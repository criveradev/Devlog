/**
 * Ejecuta persistencia y transacciones contra un replica set efímero aislado de
 * cualquier MONGO_URI configurada por el desarrollador.
 */
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Comment from '../src/models/Comment.js';
import AccountToken from '../src/models/AccountToken.js';
import Follow from '../src/models/Follow.js';
import Like from '../src/models/Like.js';
import Post from '../src/models/Post.js';
import User from '../src/models/User.js';
import { migrateRelations } from '../src/migrations/relationsMigration.js';
import { interactionService } from '../src/services/interactionService.js';
import { feedService } from '../src/services/feedService.js';
import { createAccountDeletionService } from '../src/services/accountDeletionService.js';
import { protect } from '../src/middleware/authMiddleware.js';
import { AUTH_COOKIE_NAME } from '../src/utils/authCookie.js';
import { createPostService } from '../src/services/postService.js';

describe('integración MongoDB', () => {
    let replicaSet;

    before(async () => {
        replicaSet = await MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: 'wiredTiger' },
        });
        await mongoose.connect(replicaSet.getUri(), { dbName: 'devlog-test' });
        await Promise.all([
            User.syncIndexes(),
            Post.syncIndexes(),
            Comment.syncIndexes(),
            Follow.syncIndexes(),
            Like.syncIndexes(),
            AccountToken.syncIndexes(),
        ]);
    });

    beforeEach(async () => {
        await Promise.all([
            User.deleteMany({}),
            Post.deleteMany({}),
            Comment.deleteMany({}),
            Follow.deleteMany({}),
            Like.deleteMany({}),
            AccountToken.deleteMany({}),
        ]);
    });

    after(async () => {
        await mongoose.disconnect();
        await replicaSet?.stop();
    });

    it('aplica la unicidad de email en la base de datos', async () => {
        const userData = {
            username: 'dev-one',
            email: 'dev@example.com',
            password: 'hash-de-prueba',
        };
        await User.create(userData);

        await assert.rejects(
            () => User.create({ ...userData, username: 'dev-two' }),
            (error) => error.code === 11000
        );
    });

    it('no devuelve el hash salvo que se seleccione explícitamente', async () => {
        const created = await User.create({
            username: 'dev',
            email: 'dev@example.com',
            password: 'hash-de-prueba',
        });

        const publicUser = await User.findById(created._id);
        const authenticationUser = await User.findById(created._id).select('+password');

        assert.equal(publicUser.password, undefined);
        assert.equal(authenticationUser.password, 'hash-de-prueba');
    });

    it('elimina post, comentarios y likes dentro de una transacción real', async () => {
        const user = await User.create({
            username: 'dev',
            email: 'dev@example.com',
            password: 'hash-de-prueba',
        });
        const post = await Post.create({ author: user._id, content: 'Post transaccional' });
        await Comment.create({ post: post._id, author: user._id, content: 'Comentario' });
        await Like.create({ post: post._id, user: user._id });
        const deletedImages = [];
        const service = createPostService({
            postModel: Post,
            commentModel: Comment,
            likeModel: Like,
            database: mongoose,
            uploadImage: async () => null,
            deleteImage: async (publicId) => deletedImages.push(publicId),
            logger: { error: () => {} },
        });

        await service.deletePost({ postId: post._id, userId: user._id });

        assert.equal(await Post.countDocuments(), 0);
        assert.equal(await Comment.countDocuments(), 0);
        assert.equal(await Like.countDocuments(), 0);
        assert.deepEqual(deletedImages, []);
    });

    it('revierte la transacción cuando el usuario no es propietario', async () => {
        const [owner, intruder] = await User.create([
            { username: 'owner', email: 'owner@example.com', password: 'hash-de-prueba' },
            { username: 'intruder', email: 'intruder@example.com', password: 'hash-de-prueba' },
        ]);
        const post = await Post.create({ author: owner._id, content: 'Post protegido' });
        await Comment.create({ post: post._id, author: owner._id, content: 'Comentario' });
        const service = createPostService({
            postModel: Post,
            commentModel: Comment,
            likeModel: Like,
            database: mongoose,
            uploadImage: async () => null,
            deleteImage: async () => {},
            logger: { error: () => {} },
        });

        await assert.rejects(
            () => service.deletePost({ postId: post._id, userId: intruder._id }),
            (error) => error.statusCode === 403
        );

        assert.equal(await Post.countDocuments(), 1);
        assert.equal(await Comment.countDocuments(), 1);
    });

    it('mantiene likes y follows únicos mediante transacciones', async () => {
        const [firstUser, secondUser] = await User.create([
            { username: 'first', email: 'first@example.com', password: 'hash-de-prueba' },
            { username: 'second', email: 'second@example.com', password: 'hash-de-prueba' },
        ]);
        const post = await Post.create({ author: firstUser._id, content: 'Post' });

        const liked = await interactionService.setLike({
            postId: post._id,
            userId: secondUser._id,
            liked: true,
        });
        const followed = await interactionService.setFollow({
            followerId: secondUser._id,
            followingId: firstUser._id,
            following: true,
        });

        assert.deepEqual(liked, { likes: 1, liked: true });
        assert.deepEqual(followed, { following: true, followersCount: 1 });
        assert.equal(await Like.countDocuments(), 1);
        assert.equal(await Follow.countDocuments(), 1);

        const repeatedLike = await interactionService.setLike({
            postId: post._id,
            userId: secondUser._id,
            liked: true,
        });
        assert.deepEqual(repeatedLike, { likes: 1, liked: true });
        assert.equal(await Like.countDocuments(), 1);

        const unliked = await interactionService.setLike({
            postId: post._id,
            userId: secondUser._id,
            liked: false,
        });
        assert.deepEqual(unliked, { likes: 0, liked: false });
    });

    it('migra relaciones legacy de forma idempotente y elimina los arrays', async () => {
        const [firstUser, secondUser] = await User.create([
            { username: 'first', email: 'first@example.com', password: 'hash-de-prueba' },
            { username: 'second', email: 'second@example.com', password: 'hash-de-prueba' },
        ]);
        const post = await Post.create({ author: firstUser._id, content: 'Post legacy' });
        await Post.collection.updateOne(
            { _id: post._id },
            { $set: { likes: [secondUser._id] } }
        );
        await User.collection.updateOne(
            { _id: secondUser._id },
            { $set: { following: [firstUser._id] } }
        );
        await User.collection.updateOne(
            { _id: firstUser._id },
            { $set: { followers: [secondUser._id] } }
        );

        await migrateRelations();
        await migrateRelations();

        assert.equal(await Like.countDocuments(), 1);
        assert.equal(await Follow.countDocuments(), 1);
        const rawPost = await Post.collection.findOne({ _id: post._id });
        const rawUser = await User.collection.findOne({ _id: firstUser._id });
        assert.equal(rawPost.likes, undefined);
        assert.equal(rawUser.followers, undefined);
    });

    it('rechaza inmediatamente un JWT cuya versión fue revocada', async () => {
        process.env.JWT_SECRET = 'integration-secret-that-is-at-least-32-chars';
        const user = await User.create({
            username: 'session-user',
            email: 'session@example.com',
            password: 'hash-de-prueba',
        });
        const token = jwt.sign({ id: user._id, version: 0 }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        const executeProtection = async () => {
            const response = {
                statusCode: 200,
                body: null,
                status(code) {
                    this.statusCode = code;
                    return this;
                },
                json(body) {
                    this.body = body;
                    return this;
                },
            };
            let accepted = false;
            await protect(
                { headers: {}, cookies: { [AUTH_COOKIE_NAME]: token } },
                response,
                () => {
                    accepted = true;
                }
            );
            return { accepted, response };
        };

        assert.equal((await executeProtection()).accepted, true);
        await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });
        const revoked = await executeProtection();
        assert.equal(revoked.accepted, false);
        assert.equal(revoked.response.statusCode, 401);
        assert.deepEqual(revoked.response.body, { message: 'Sesión revocada' });
    });

    it('pagina el feed por cursor sin duplicar publicaciones', async () => {
        const user = await User.create({
            username: 'feed-user',
            email: 'feed@example.com',
            password: 'hash-de-prueba',
        });
        const posts = await Post.create([
            { author: user._id, content: 'Primero', createdAt: new Date('2026-01-01') },
            { author: user._id, content: 'Segundo', createdAt: new Date('2026-01-02') },
            { author: user._id, content: 'Tercero', createdAt: new Date('2026-01-03') },
        ]);

        const firstPage = await feedService.getCursorFeed({ limit: 2, currentUserId: user._id });
        const secondPage = await feedService.getCursorFeed({
            cursor: firstPage.nextCursor,
            limit: 2,
            currentUserId: user._id,
        });

        assert.equal(firstPage.hasMore, true);
        assert.equal(secondPage.hasMore, false);
        const returnedIds = [...firstPage.posts, ...secondPage.posts].map((post) => String(post._id));
        assert.equal(new Set(returnedIds).size, 3);
        assert.deepEqual(
            new Set(returnedIds),
            new Set(posts.map((post) => String(post._id)))
        );
    });

    it('elimina integralmente una cuenta y sus relaciones', async () => {
        const [user, otherUser] = await User.create([
            { username: 'delete-me', email: 'delete@example.com', password: 'hash-de-prueba' },
            { username: 'keep-me', email: 'keep@example.com', password: 'hash-de-prueba' },
        ]);
        const post = await Post.create({ author: user._id, content: 'Será eliminado' });
        await Comment.create({ post: post._id, author: otherUser._id, content: 'También' });
        await Like.create({ post: post._id, user: otherUser._id });
        await Follow.create({ follower: otherUser._id, following: user._id });
        await AccountToken.create({
            user: user._id,
            type: 'password_reset',
            tokenHash: 'token-hash',
            expiresAt: new Date(Date.now() + 60_000),
        });
        const service = createAccountDeletionService({
            database: mongoose,
            userModel: User,
            postModel: Post,
            commentModel: Comment,
            likeModel: Like,
            followModel: Follow,
            tokenModel: AccountToken,
            deleteImage: async () => {},
            passwordHasher: { compare: async () => true },
            logger: { error: () => {} },
        });

        await service.deleteAccount({ userId: user._id, currentPassword: 'password' });

        assert.equal(await User.countDocuments({ _id: user._id }), 0);
        assert.equal(await User.countDocuments({ _id: otherUser._id }), 1);
        assert.equal(await Post.countDocuments(), 0);
        assert.equal(await Comment.countDocuments(), 0);
        assert.equal(await Like.countDocuments(), 0);
        assert.equal(await Follow.countDocuments(), 0);
        assert.equal(await AccountToken.countDocuments(), 0);
    });

    it('conserva la cuenta cuando la contraseña de confirmación no coincide', async () => {
        const user = await User.create({
            username: 'protected-user',
            email: 'protected@example.com',
            password: 'hash-de-prueba',
        });
        const service = createAccountDeletionService({
            database: mongoose,
            userModel: User,
            postModel: Post,
            commentModel: Comment,
            likeModel: Like,
            followModel: Follow,
            tokenModel: AccountToken,
            deleteImage: async () => {},
            passwordHasher: { compare: async () => false },
            logger: { error: () => {} },
        });

        await assert.rejects(
            () => service.deleteAccount({ userId: user._id, currentPassword: 'incorrecta' }),
            (error) => error.statusCode === 401 && error.message === 'La contraseña actual no es válida'
        );
        assert.equal(await User.countDocuments({ _id: user._id }), 1);
    });
});
