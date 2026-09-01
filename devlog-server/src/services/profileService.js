/** Coordina lectura y actualización de perfiles sin acoplar reglas a Express. */
import User from '../models/User.js';
import Post from '../models/Post.js';
import { ApplicationError } from '../errors/ApplicationError.js';
import { interactionService } from './interactionService.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const createProfileService = ({
    userModel,
    postModel,
    interactions,
    uploadImage,
    deleteImage,
    logger,
}) => ({
    async getProfile({ profileUserId, currentUserId, page, limit }) {
        const user = await userModel
            .findById(profileUserId)
            .select('username avatar bio createdAt')
            .lean();
        if (!user) {
            throw new ApplicationError(404, 'Usuario no encontrado');
        }

        const [posts, totalPosts, profileMetadata] = await Promise.all([
            postModel
                .find({ author: user._id })
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author', 'username avatar')
                .lean(),
            postModel.countDocuments({ author: user._id }),
            interactions.getProfileMetadata({ profileUserId: user._id, currentUserId }),
        ]);
        const postsWithLikes = await interactions.addLikeMetadata(posts, currentUserId);

        return {
            user: {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt,
                ...profileMetadata,
            },
            posts: postsWithLikes,
            page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
        };
    },

    async updateProfile({ userId, username, bio, avatarBuffer }) {
        let uploadedAvatarPublicId = '';
        let profileSaved = false;

        try {
            const user = await userModel
                .findById(userId)
                .select('username email avatar bio +avatarPublicId');
            if (!user) {
                throw new ApplicationError(404, 'Usuario no encontrado');
            }
            const previousAvatarPublicId = user.avatarPublicId;

            if (username) user.username = username;
            if (bio !== undefined) user.bio = bio;

            if (avatarBuffer) {
                const result = await uploadImage(avatarBuffer, 'avatars');
                user.avatar = result.secure_url;
                user.avatarPublicId = result.public_id;
                uploadedAvatarPublicId = result.public_id;
            }

            await user.save();
            profileSaved = true;

            if (uploadedAvatarPublicId && previousAvatarPublicId) {
                try {
                    await deleteImage(previousAvatarPublicId);
                } catch (cleanupError) {
                    logger.error('Perfil actualizado, pero falló la limpieza del avatar anterior', {
                        publicId: previousAvatarPublicId,
                        error: cleanupError.message,
                    });
                }
            }

            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
            };
        } catch (error) {
            if (uploadedAvatarPublicId && !profileSaved) {
                try {
                    await deleteImage(uploadedAvatarPublicId);
                } catch (cleanupError) {
                    logger.error('No se pudo limpiar el avatar de la actualización fallida', {
                        publicId: uploadedAvatarPublicId,
                        error: cleanupError.message,
                    });
                }
            }
            throw error;
        }
    },
});

export const profileService = createProfileService({
    userModel: User,
    postModel: Post,
    interactions: interactionService,
    uploadImage: uploadToCloudinary,
    deleteImage: deleteFromCloudinary,
    logger: console,
});
