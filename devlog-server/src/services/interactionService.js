/** Implementa likes, follows y metadatos derivados con integridad transaccional. */
import mongoose from 'mongoose';
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { ApplicationError } from '../errors/ApplicationError.js';

/** Factoría de interacciones con modelos y coordinador transaccional inyectables. */
export const createInteractionService = ({ database, followModel, likeModel, postModel, userModel }) => ({
    async setLike({ postId, userId, liked }) {
        const session = await database.startSession();

        try {
            await session.withTransaction(async () => {
                const postExists = await postModel.exists({ _id: postId }).session(session);
                if (!postExists) {
                    throw new ApplicationError(404, 'Post no encontrado');
                }

                if (liked) {
                    await likeModel.updateOne(
                        { post: postId, user: userId },
                        { $setOnInsert: { post: postId, user: userId } },
                        { upsert: true, session }
                    );
                } else {
                    await likeModel.deleteOne({ post: postId, user: userId }, { session });
                }
            });
        } catch (error) {
            // Dos PUT concurrentes pueden competir por el mismo índice único; ambos
            // expresan el mismo estado final, por lo que la colisión equivale a éxito.
            if (!(liked && error.code === 11000)) throw error;
        } finally {
            await session.endSession();
        }

        const likes = await likeModel.countDocuments({ post: postId });
        return { likes, liked };
    },

    async setFollow({ followerId, followingId, following }) {
        if (String(followerId) === String(followingId)) {
            throw new ApplicationError(400, 'No puedes seguirte a ti mismo');
        }

        const session = await database.startSession();
        try {
            await session.withTransaction(async () => {
                const userExists = await userModel.exists({ _id: followingId }).session(session);
                if (!userExists) {
                    throw new ApplicationError(404, 'Usuario no encontrado');
                }

                if (following) {
                    await followModel.updateOne(
                        { follower: followerId, following: followingId },
                        { $setOnInsert: { follower: followerId, following: followingId } },
                        { upsert: true, session }
                    );
                } else {
                    await followModel.deleteOne(
                        { follower: followerId, following: followingId },
                        { session }
                    );
                }
            });
        } catch (error) {
            if (!(following && error.code === 11000)) throw error;
        } finally {
            await session.endSession();
        }

        const followersCount = await followModel.countDocuments({ following: followingId });
        return { following, followersCount };
    },

    async getProfileMetadata({ profileUserId, currentUserId }) {
        const [followersCount, followingCount, currentFollow] = await Promise.all([
            followModel.countDocuments({ following: profileUserId }),
            followModel.countDocuments({ follower: profileUserId }),
            followModel.exists({ follower: currentUserId, following: profileUserId }),
        ]);

        return {
            followersCount,
            followingCount,
            isFollowing: Boolean(currentFollow),
        };
    },

    async addLikeMetadata(posts, currentUserId) {
        if (posts.length === 0) return [];

        const postIds = posts.map((post) => post._id);
        // Una sola agregación evita una consulta de conteo por cada publicación (N+1).
        const metadata = await likeModel.aggregate([
            { $match: { post: { $in: postIds } } },
            {
                $group: {
                    _id: '$post',
                    likesCount: { $sum: 1 },
                    likedByCurrentUser: {
                        $max: { $eq: ['$user', currentUserId] },
                    },
                },
            },
        ]);
        const metadataByPost = new Map(metadata.map((item) => [String(item._id), item]));

        return posts.map((post) => {
            const postObject = typeof post.toObject === 'function' ? post.toObject() : post;
            const postMetadata = metadataByPost.get(String(post._id));
            return {
                ...postObject,
                likesCount: postMetadata?.likesCount || 0,
                likedByCurrentUser: Boolean(postMetadata?.likedByCurrentUser),
            };
        });
    },
});

export const interactionService = createInteractionService({
    database: mongoose,
    followModel: Follow,
    likeModel: Like,
    postModel: Post,
    userModel: User,
});
