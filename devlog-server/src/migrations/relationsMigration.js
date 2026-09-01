/** Migra arrays legacy de likes y follows hacia colecciones relacionales. */
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const BATCH_SIZE = 500;

/** Vacía lotes no ordenados; los upserts vuelven idempotente cada operación. */
const flushOperations = async (model, operations) => {
    if (operations.length === 0) return;
    await model.bulkWrite(operations, { ordered: false });
    operations.length = 0;
};

/**
 * Recorre cursores MongoDB sin cargar colecciones completas en memoria y elimina
 * campos legacy únicamente después de persistir todas las relaciones.
 */
export const migrateRelations = async () => {
    const likeOperations = [];
    const postCursor = Post.collection.find(
        { 'likes.0': { $exists: true } },
        { projection: { likes: 1 } }
    );

    for await (const post of postCursor) {
        for (const userId of post.likes || []) {
            likeOperations.push({
                updateOne: {
                    filter: { post: post._id, user: userId },
                    update: { $setOnInsert: { post: post._id, user: userId } },
                    upsert: true,
                },
            });
            if (likeOperations.length >= BATCH_SIZE) {
                await flushOperations(Like, likeOperations);
            }
        }
    }
    await flushOperations(Like, likeOperations);

    const followOperations = [];
    const userCursor = User.collection.find(
        {
            $or: [{ 'following.0': { $exists: true } }, { 'followers.0': { $exists: true } }],
        },
        { projection: { followers: 1, following: 1 } }
    );

    for await (const user of userCursor) {
        for (const followingId of user.following || []) {
            followOperations.push({
                updateOne: {
                    filter: { follower: user._id, following: followingId },
                    update: { $setOnInsert: { follower: user._id, following: followingId } },
                    upsert: true,
                },
            });
        }
        for (const followerId of user.followers || []) {
            followOperations.push({
                updateOne: {
                    filter: { follower: followerId, following: user._id },
                    update: { $setOnInsert: { follower: followerId, following: user._id } },
                    upsert: true,
                },
            });
        }
        if (followOperations.length >= BATCH_SIZE) {
            await flushOperations(Follow, followOperations);
        }
    }
    await flushOperations(Follow, followOperations);

    await Promise.all([
        Post.collection.updateMany({ likes: { $exists: true } }, { $unset: { likes: '' } }),
        User.collection.updateMany(
            { $or: [{ followers: { $exists: true } }, { following: { $exists: true } }] },
            { $unset: { followers: '', following: '' } }
        ),
    ]);
};
