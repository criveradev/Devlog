/** Cubre autorización, transacciones y compensaciones remotas del servicio de posts. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPostService } from '../src/services/postService.js';

const createDependencies = (overrides = {}) => ({
    postModel: {},
    commentModel: {},
    likeModel: {},
    database: {},
    uploadImage: async () => null,
    deleteImage: async () => {},
    logger: { error: () => {} },
    ...overrides,
});

describe('postService', () => {
    it('crea y devuelve un post poblado con su imagen', async () => {
        let createdData;
        const populatedPost = { _id: 'post-id', author: { username: 'dev' } };
        const service = createPostService(
            createDependencies({
                uploadImage: async () => ({
                    secure_url: 'https://cdn.example/post.webp',
                    public_id: 'posts/image-id',
                }),
                postModel: {
                    create: async (data) => {
                        createdData = data;
                        return {
                            populate: async (path, fields) => {
                                assert.equal(path, 'author');
                                assert.equal(fields, 'username avatar');
                                return populatedPost;
                            },
                        };
                    },
                },
            })
        );

        const result = await service.createPost({
            authorId: 'user-id',
            content: 'Contenido',
            imageBuffer: Buffer.from('imagen'),
        });

        assert.equal(result, populatedPost);
        assert.deepEqual(createdData, {
            author: 'user-id',
            content: 'Contenido',
            image: 'https://cdn.example/post.webp',
            imagePublicId: 'posts/image-id',
        });
    });

    it('elimina de Cloudinary una imagen si falla la persistencia', async () => {
        const deletedImages = [];
        const databaseError = new Error('MongoDB no disponible');
        const service = createPostService(
            createDependencies({
                uploadImage: async () => ({
                    secure_url: 'https://cdn.example/post.webp',
                    public_id: 'posts/image-id',
                }),
                postModel: { create: async () => Promise.reject(databaseError) },
                deleteImage: async (publicId) => deletedImages.push(publicId),
            })
        );

        await assert.rejects(
            () =>
                service.createPost({
                    authorId: 'user-id',
                    content: 'Contenido',
                    imageBuffer: Buffer.from('imagen'),
                }),
            databaseError
        );
        assert.deepEqual(deletedImages, ['posts/image-id']);
    });

    it('autoriza y persiste la edición del propietario', async () => {
        let saved = false;
        const post = {
            author: 'owner-id',
            content: 'Anterior',
            save: async () => {
                saved = true;
            },
        };
        const service = createPostService(
            createDependencies({ postModel: { findById: async () => post } })
        );

        const result = await service.updatePost({
            postId: 'post-id',
            userId: 'owner-id',
            content: 'Actualizado',
        });

        assert.equal(result.content, 'Actualizado');
        assert.equal(saved, true);
    });

    it('impide que otro usuario edite el post', async () => {
        const service = createPostService(
            createDependencies({
                postModel: {
                    findById: async () => ({ author: 'owner-id' }),
                },
            })
        );

        await assert.rejects(
            () =>
                service.updatePost({
                    postId: 'post-id',
                    userId: 'intruder-id',
                    content: 'Actualizado',
                }),
            (error) => error.statusCode === 403 && error.message === 'No autorizado'
        );
    });

    it('elimina post, comentarios y likes en transacción antes de limpiar Cloudinary', async () => {
        const operations = [];
        const post = {
            _id: 'post-id',
            author: 'owner-id',
            imagePublicId: 'posts/image-id',
            deleteOne: async ({ session }) => operations.push(['post', session]),
        };
        const session = {
            withTransaction: async (operation) => operation(),
            endSession: async () => operations.push(['session']),
        };
        const service = createPostService(
            createDependencies({
                database: { startSession: async () => session },
                postModel: {
                    findById: () => ({ session: async () => post }),
                },
                commentModel: {
                    deleteMany: async (filter, options) =>
                        operations.push(['comments', filter, options]),
                },
                likeModel: {
                    deleteMany: async (filter, options) =>
                        operations.push(['likes', filter, options]),
                },
                deleteImage: async (publicId) => operations.push(['image', publicId]),
            })
        );

        await service.deletePost({ postId: 'post-id', userId: 'owner-id' });

        assert.equal(operations[0][0], 'comments');
        assert.equal(operations[1][0], 'likes');
        assert.equal(operations[2][0], 'post');
        assert.deepEqual(operations[3], ['image', 'posts/image-id']);
        assert.deepEqual(operations[4], ['session']);
    });
});
