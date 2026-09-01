/** Cubre registro, hashing, autenticación y respuestas resistentes a enumeración. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAuthService } from '../src/services/authService.js';

describe('authService', () => {
    it('registra un usuario almacenando únicamente el hash', async () => {
        let createdUserData;
        const expectedUser = { _id: 'user-id', username: 'dev', email: 'dev@example.com' };
        const service = createAuthService({
            userModel: {
                findOne: async () => null,
                create: async (userData) => {
                    createdUserData = userData;
                    return expectedUser;
                },
            },
            passwordHasher: {
                hash: async (password, rounds) => {
                    assert.equal(password, 'contraseña-segura');
                    assert.equal(rounds, 12);
                    return 'hash-seguro';
                },
            },
        });

        const user = await service.registerUser({
            username: 'dev',
            email: 'dev@example.com',
            password: 'contraseña-segura',
        });

        assert.equal(user, expectedUser);
        assert.deepEqual(createdUserData, {
            username: 'dev',
            email: 'dev@example.com',
            password: 'hash-seguro',
        });
    });

    it('rechaza identidades duplicadas con un conflicto', async () => {
        const service = createAuthService({
            userModel: { findOne: async () => ({ _id: 'existing-user' }) },
            passwordHasher: {},
        });

        await assert.rejects(
            () =>
                service.registerUser({
                    username: 'dev',
                    email: 'dev@example.com',
                    password: 'contraseña-segura',
                }),
            (error) => error.statusCode === 409 && error.message === 'Usuario o email ya en uso'
        );
    });

    it('autentica solicitando explícitamente el hash excluido por defecto', async () => {
        const expectedUser = { email: 'dev@example.com', password: 'hash-seguro' };
        const service = createAuthService({
            userModel: {
                findOne: () => ({
                    select: async (selection) => {
                        assert.equal(selection, '+password +tokenVersion');
                        return expectedUser;
                    },
                }),
            },
            passwordHasher: {
                compare: async (password, hash) =>
                    password === 'contraseña-segura' && hash === 'hash-seguro',
            },
        });

        const user = await service.authenticateUser({
            email: 'dev@example.com',
            password: 'contraseña-segura',
        });

        assert.equal(user, expectedUser);
    });

    it('usa el mismo error para usuario inexistente y contraseña incorrecta', async () => {
        const createService = (user) =>
            createAuthService({
                userModel: {
                    findOne: () => ({ select: async () => user }),
                },
                passwordHasher: { compare: async () => false },
            });

        for (const service of [createService(null), createService({ password: 'hash' })]) {
            await assert.rejects(
                () =>
                    service.authenticateUser({
                        email: 'dev@example.com',
                        password: 'incorrecta',
                    }),
                (error) => error.statusCode === 401 && error.message === 'Credenciales inválidas'
            );
        }
    });
});
