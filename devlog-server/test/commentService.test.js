/** Cubre existencia y autorización en operaciones de comentarios. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCommentService } from '../src/services/commentService.js';

describe('commentService', () => {
    it('rechaza comentarios para posts inexistentes', async () => {
        const service = createCommentService({
            postModel: { exists: async () => false },
            commentModel: {},
        });

        await assert.rejects(
            () => service.createComment({ postId: 'missing', authorId: 'user', content: 'Texto' }),
            (error) => error.statusCode === 404 && error.message === 'Post no encontrado'
        );
    });

    it('crea y devuelve el comentario con su autor público', async () => {
        const populated = { _id: 'comment-id', author: { username: 'dev' } };
        const service = createCommentService({
            postModel: { exists: async () => true },
            commentModel: {
                create: async (data) => ({
                    populate: async (path, fields) => {
                        assert.deepEqual(data, {
                            post: 'post-id',
                            author: 'user-id',
                            content: 'Texto',
                        });
                        assert.equal(path, 'author');
                        assert.equal(fields, 'username avatar');
                        return populated;
                    },
                }),
            },
        });

        const result = await service.createComment({
            postId: 'post-id',
            authorId: 'user-id',
            content: 'Texto',
        });

        assert.equal(result, populated);
    });

    it('impide eliminar comentarios de otro usuario', async () => {
        const service = createCommentService({
            postModel: {},
            commentModel: { findById: async () => ({ author: 'owner-id' }) },
        });

        await assert.rejects(
            () => service.deleteComment({ commentId: 'comment-id', userId: 'intruder-id' }),
            (error) => error.statusCode === 403 && error.message === 'No autorizado'
        );
    });
});
