/** Orquesta el borrado integral de una cuenta y sus datos relacionados. */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AccountToken from '../models/AccountToken.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { ApplicationError } from '../errors/ApplicationError.js';
import { deleteFromCloudinary } from '../utils/uploadToCloudinary.js';

/**
 * Factoría con dependencias inyectables para probar transacciones y limpieza remota.
 * La base de datos se confirma antes de eliminar imágenes, que no admiten rollback.
 */
export const createAccountDeletionService = ({
    database,
    userModel,
    postModel,
    commentModel,
    likeModel,
    followModel,
    tokenModel,
    deleteImage,
    passwordHasher,
    logger,
}) => ({
    async deleteAccount({ userId, currentPassword }) {
        // bcrypt es deliberadamente costoso; se verifica antes de abrir la transacción.
        const credentialsUser = await userModel.findById(userId).select('+password');
        if (!credentialsUser) throw new ApplicationError(404, 'Usuario no encontrado');
        const passwordMatches = await passwordHasher.compare(currentPassword, credentialsUser.password);
        if (!passwordMatches) {
            throw new ApplicationError(401, 'La contraseña actual no es válida');
        }

        const session = await database.startSession();
        const imagePublicIds = [];

        try {
            await session.withTransaction(async () => {
                const user = await userModel.findById(userId).select('+avatarPublicId').session(session);
                if (!user) throw new ApplicationError(404, 'Usuario no encontrado');

                const posts = await postModel
                    .find({ author: userId })
                    .select('_id imagePublicId')
                    .session(session)
                    .lean();
                const postIds = posts.map((post) => post._id);
                imagePublicIds.push(
                    user.avatarPublicId,
                    ...posts.map((post) => post.imagePublicId)
                );

                await commentModel.deleteMany(
                    { $or: [{ author: userId }, { post: { $in: postIds } }] },
                    { session }
                );
                await likeModel.deleteMany(
                    { $or: [{ user: userId }, { post: { $in: postIds } }] },
                    { session }
                );
                await followModel.deleteMany(
                    { $or: [{ follower: userId }, { following: userId }] },
                    { session }
                );
                await tokenModel.deleteMany({ user: userId }, { session });
                await postModel.deleteMany({ _id: { $in: postIds } }, { session });
                await user.deleteOne({ session });
            });
        } finally {
            await session.endSession();
        }

        const validImagePublicIds = imagePublicIds.filter(Boolean);
        // Una limpieza remota fallida no revierte datos ya eliminados; se registra para remediación.
        const cleanupResults = await Promise.allSettled(
            validImagePublicIds.map((publicId) => deleteImage(publicId))
        );
        cleanupResults.forEach((result, index) => {
            if (result.status === 'rejected') {
                logger.error('Cuenta eliminada, pero falló la limpieza de una imagen', {
                    publicId: validImagePublicIds[index],
                    error: result.reason?.message,
                });
            }
        });
    },
});

export const accountDeletionService = createAccountDeletionService({
    database: mongoose,
    userModel: User,
    postModel: Post,
    commentModel: Comment,
    likeModel: Like,
    followModel: Follow,
    tokenModel: AccountToken,
    deleteImage: deleteFromCloudinary,
    passwordHasher: bcrypt,
    logger: console,
});
