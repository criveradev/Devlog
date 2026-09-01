/** Coordina persistencia de posts, autorización y ciclo de vida de imágenes. */
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import { ApplicationError } from '../errors/ApplicationError.js';
import {
    deleteFromCloudinary,
    uploadToCloudinary,
} from '../utils/uploadToCloudinary.js';

const idsAreEqual = (left, right) =>
    typeof left?.equals === 'function' ? left.equals(right) : String(left) === String(right);

/** Factoría con adaptadores inyectables para aislar MongoDB y Cloudinary. */
export const createPostService = ({
    postModel,
    commentModel,
    likeModel,
    database,
    uploadImage,
    deleteImage,
    logger,
}) => ({
    async createPost({ authorId, content, imageBuffer }) {
        let uploadedImage;
        let postCreated = false;

        try {
            if (imageBuffer) {
                uploadedImage = await uploadImage(imageBuffer, 'posts');
            }

            const post = await postModel.create({
                author: authorId,
                content,
                image: uploadedImage?.secure_url || '',
                imagePublicId: uploadedImage?.public_id || '',
            });
            postCreated = true;

            return post.populate('author', 'username avatar');
        } catch (error) {
            // Compensa el upload cuando la escritura posterior no llegó a completarse.
            if (uploadedImage?.public_id && !postCreated) {
                try {
                    await deleteImage(uploadedImage.public_id);
                } catch (cleanupError) {
                    logger.error('No se pudo limpiar la imagen del post fallido', {
                        publicId: uploadedImage.public_id,
                        error: cleanupError.message,
                    });
                }
            }

            throw error;
        }
    },

    async updatePost({ postId, userId, content }) {
        const post = await postModel.findById(postId);
        if (!post) {
            throw new ApplicationError(404, 'Post no encontrado');
        }

        if (!idsAreEqual(post.author, userId)) {
            throw new ApplicationError(403, 'No autorizado');
        }

        post.content = content;
        await post.save();
        return post;
    },

    async deletePost({ postId, userId }) {
        const session = await database.startSession();
        let imagePublicId = '';

        try {
            await session.withTransaction(async () => {
                const post = await postModel.findById(postId).session(session);
                if (!post) {
                    throw new ApplicationError(404, 'Post no encontrado');
                }

                if (!idsAreEqual(post.author, userId)) {
                    throw new ApplicationError(403, 'No autorizado');
                }

                imagePublicId = post.imagePublicId;
                await commentModel.deleteMany({ post: post._id }, { session });
                await likeModel.deleteMany({ post: post._id }, { session });
                await post.deleteOne({ session });
            });

            // Cloudinary se limpia después del commit porque no participa en la transacción.
            if (imagePublicId) {
                try {
                    await deleteImage(imagePublicId);
                } catch (cleanupError) {
                    logger.error('Post eliminado, pero falló la limpieza de Cloudinary', {
                        publicId: imagePublicId,
                        error: cleanupError.message,
                    });
                }
            }
        } finally {
            try {
                await session.endSession();
            } catch (cleanupError) {
                logger.error('No se pudo cerrar la sesión de MongoDB', {
                    error: cleanupError.message,
                });
            }
        }
    },
});

export const postService = createPostService({
    postModel: Post,
    commentModel: Comment,
    likeModel: Like,
    database: mongoose,
    uploadImage: uploadToCloudinary,
    deleteImage: deleteFromCloudinary,
    logger: console,
});
