/** Cubre actualización de perfiles y compensación de imágenes remotas. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createProfileService } from '../src/services/profileService.js';

const createDependencies = (overrides = {}) => ({
    userModel: {},
    postModel: {},
    interactions: {},
    uploadImage: async () => null,
    deleteImage: async () => {},
    logger: { error: () => {} },
    ...overrides,
});

describe('profileService', () => {
    it('responde 404 cuando el perfil autenticado desapareció', async () => {
        const service = createProfileService(
            createDependencies({
                userModel: { findById: () => ({ select: async () => null }) },
            })
        );

        await assert.rejects(
            () => service.updateProfile({ userId: 'missing' }),
            (error) => error.statusCode === 404 && error.message === 'Usuario no encontrado'
        );
    });

    it('reemplaza el avatar y limpia el recurso anterior después de guardar', async () => {
        const deletedImages = [];
        const user = {
            _id: 'user-id',
            username: 'anterior',
            email: 'dev@example.com',
            avatar: 'old-url',
            avatarPublicId: 'avatars/old',
            bio: '',
            save: async () => {},
        };
        const service = createProfileService(
            createDependencies({
                userModel: { findById: () => ({ select: async () => user }) },
                uploadImage: async () => ({
                    secure_url: 'new-url',
                    public_id: 'avatars/new',
                }),
                deleteImage: async (publicId) => deletedImages.push(publicId),
            })
        );

        const result = await service.updateProfile({
            userId: user._id,
            username: 'nuevo',
            bio: 'Bio',
            avatarBuffer: Buffer.from('avatar'),
        });

        assert.deepEqual(deletedImages, ['avatars/old']);
        assert.deepEqual(result, {
            _id: 'user-id',
            username: 'nuevo',
            email: 'dev@example.com',
            avatar: 'new-url',
            bio: 'Bio',
        });
    });

    it('elimina el avatar recién subido cuando falla la persistencia', async () => {
        const deletedImages = [];
        const user = {
            _id: 'user-id',
            username: 'dev',
            avatarPublicId: 'avatars/old',
            save: async () => {
                throw new Error('MongoDB no disponible');
            },
        };
        const service = createProfileService(
            createDependencies({
                userModel: { findById: () => ({ select: async () => user }) },
                uploadImage: async () => ({
                    secure_url: 'new-url',
                    public_id: 'avatars/new',
                }),
                deleteImage: async (publicId) => deletedImages.push(publicId),
            })
        );

        await assert.rejects(() =>
            service.updateProfile({ userId: user._id, avatarBuffer: Buffer.from('avatar') })
        );
        assert.deepEqual(deletedImages, ['avatars/new']);
    });
});
