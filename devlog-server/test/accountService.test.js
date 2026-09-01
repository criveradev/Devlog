/** Verifica tokens de cuenta, revocación de sesiones y privacidad de recuperación. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAccountService } from '../src/services/accountService.js';

const createDatabase = () => ({
    startSession: async () => ({
        withTransaction: async (operation) => operation(),
        endSession: async () => {},
    }),
});

describe('accountService', () => {
    it('restablece el password y revoca sesiones al consumir el token', async () => {
        const user = { _id: 'user-id', email: 'dev@example.com' };
        let storedToken;
        let resetUrl;
        let userUpdate;
        const service = createAccountService({
            database: createDatabase(),
            userModel: {
                findOne: async () => user,
                updateOne: async (filter, update, options) => {
                    userUpdate = { filter, update, options };
                },
            },
            tokenModel: {
                deleteMany: async () => {},
                create: async (tokenData) => {
                    storedToken = tokenData;
                },
                findOneAndDelete: async (filter) => {
                    if (filter.tokenHash !== storedToken?.tokenHash) return null;
                    const consumedToken = storedToken;
                    storedToken = null;
                    return consumedToken;
                },
            },
            passwordHasher: { hash: async () => 'nuevo-hash' },
            emailService: {
                assertConfigured: () => {},
                sendPasswordReset: async ({ url }) => {
                    resetUrl = url;
                },
            },
        });

        await service.requestPasswordReset(user.email);
        const token = new URL(resetUrl).searchParams.get('token');
        await service.resetPassword({ token, password: 'nueva-contraseña' });

        assert.deepEqual(userUpdate, {
            filter: { _id: 'user-id' },
            update: { $set: { password: 'nuevo-hash' }, $inc: { tokenVersion: 1 } },
            options: { session: userUpdate.options.session },
        });
    });

    it('no revela si el email solicitado existe', async () => {
        let emailSent = false;
        const service = createAccountService({
            database: createDatabase(),
            userModel: { findOne: async () => null },
            tokenModel: {},
            passwordHasher: {},
            emailService: {
                assertConfigured: () => {},
                sendPasswordReset: async () => {
                    emailSent = true;
                },
            },
        });

        await assert.doesNotReject(() => service.requestPasswordReset('missing@example.com'));
        assert.equal(emailSent, false);
    });

    it('cambia el password y revoca las sesiones activas', async () => {
        const user = {
            _id: 'user-id',
            password: 'hash-anterior',
            tokenVersion: 2,
            saveCalled: false,
            async save() {
                this.saveCalled = true;
            },
        };
        const service = createAccountService({
            database: createDatabase(),
            userModel: {
                findById: () => ({ select: async () => user }),
            },
            tokenModel: {},
            passwordHasher: {
                compare: async (plain, hash) =>
                    plain === 'password-actual' && hash === 'hash-anterior',
                hash: async (plain, rounds) => `${plain}:${rounds}`,
            },
            emailService: {},
        });

        await service.changePassword({
            userId: user._id,
            currentPassword: 'password-actual',
            newPassword: 'password-nuevo',
        });

        assert.equal(user.password, 'password-nuevo:12');
        assert.equal(user.tokenVersion, 3);
        assert.equal(user.saveCalled, true);
    });

    it('confirma un cambio de email usando el valor asociado al token', async () => {
        const user = { _id: 'user-id', email: 'actual@example.com' };
        let storedToken;
        let verificationUrl;
        let userUpdate;
        const service = createAccountService({
            database: createDatabase(),
            userModel: {
                exists: async () => false,
                updateOne: async (filter, update, options) => {
                    userUpdate = { filter, update, options };
                },
            },
            tokenModel: {
                deleteMany: async () => {},
                create: async (tokenData) => {
                    storedToken = tokenData;
                },
                findOneAndDelete: async (filter) => {
                    if (filter.tokenHash !== storedToken?.tokenHash) return null;
                    const consumedToken = storedToken;
                    storedToken = null;
                    return consumedToken;
                },
            },
            passwordHasher: {},
            emailService: {
                assertConfigured: () => {},
                sendEmailVerification: async ({ url }) => {
                    verificationUrl = url;
                },
            },
        });

        await service.requestEmailChange({ user, newEmail: 'nuevo@example.com' });
        const token = new URL(verificationUrl).searchParams.get('token');
        await service.confirmEmailChange(token);

        assert.equal(userUpdate.update.$set.email, 'nuevo@example.com');
        assert.equal(storedToken, null);
        assert.deepEqual(userUpdate, {
            filter: { _id: user._id },
            update: {
                $set: { email: 'nuevo@example.com', emailVerified: true },
                $inc: { tokenVersion: 1 },
            },
            options: { session: userUpdate.options.session },
        });
    });

    it('permite consumir un token de recuperación una sola vez bajo concurrencia', async () => {
        const user = { _id: 'user-id', email: 'dev@example.com' };
        let storedToken;
        let resetUrl;
        let updates = 0;
        const service = createAccountService({
            database: createDatabase(),
            userModel: {
                findOne: async () => user,
                updateOne: async () => {
                    updates += 1;
                },
            },
            tokenModel: {
                deleteMany: async () => {},
                create: async (tokenData) => {
                    storedToken = tokenData;
                },
                findOneAndDelete: async (filter) => {
                    if (filter.tokenHash !== storedToken?.tokenHash) return null;
                    const consumedToken = storedToken;
                    storedToken = null;
                    return consumedToken;
                },
            },
            passwordHasher: { hash: async (password) => `hash:${password}` },
            emailService: {
                assertConfigured: () => {},
                sendPasswordReset: async ({ url }) => {
                    resetUrl = url;
                },
            },
        });

        await service.requestPasswordReset(user.email);
        const token = new URL(resetUrl).searchParams.get('token');
        const results = await Promise.allSettled([
            service.resetPassword({ token, password: 'primera' }),
            service.resetPassword({ token, password: 'segunda' }),
        ]);

        assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1);
        assert.equal(results.filter(({ status }) => status === 'rejected').length, 1);
        assert.equal(updates, 1);
    });
});
