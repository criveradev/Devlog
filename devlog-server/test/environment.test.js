/** Valida escenarios exitosos y fallidos del contrato de configuración. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateEnvironment } from '../src/config/environment.js';

const validEnvironment = {
    NODE_ENV: 'development',
    PORT: '5050',
    MONGO_URI: 'mongodb://localhost:27017/devlog',
    JWT_SECRET: 'a'.repeat(32),
    JWT_EXPIRES: '7d',
    CLOUDINARY_CLOUD_NAME: 'cloud',
    CLOUDINARY_API_KEY: 'key',
    CLOUDINARY_API_SECRET: 'secret',
};

describe('validateEnvironment', () => {
    it('acepta una configuración completa', () => {
        assert.doesNotThrow(() => validateEnvironment(validEnvironment));
    });

    it('informa todas las variables requeridas ausentes', () => {
        assert.throws(
            () => validateEnvironment({}),
            (error) =>
                error.message.includes('MONGO_URI es requerida') &&
                error.message.includes('JWT_SECRET es requerida') &&
                error.message.includes('CLOUDINARY_API_SECRET es requerida')
        );
    });

    it('rechaza secretos JWT débiles y puertos inválidos', () => {
        assert.throws(
            () =>
                validateEnvironment({
                    ...validEnvironment,
                    JWT_SECRET: 'débil',
                    PORT: '70000',
                }),
            (error) =>
                error.message.includes('JWT_SECRET debe tener al menos 32 caracteres') &&
                error.message.includes('PORT debe ser un número entero entre 1 y 65535')
        );
    });

    it('requiere un origen permitido en producción', () => {
        assert.throws(
            () => validateEnvironment({ ...validEnvironment, NODE_ENV: 'production' }),
            /CLIENT_URL es requerida en producción/
        );
    });

    it('rechaza expiraciones ambiguas y orígenes inseguros en producción', () => {
        assert.throws(
            () =>
                validateEnvironment({
                    ...validEnvironment,
                    NODE_ENV: 'production',
                    JWT_EXPIRES: '7',
                    CLIENT_URL: 'http://devlog.example.com/path',
                }),
            (error) =>
                error.message.includes('JWT_EXPIRES debe incluir una unidad válida') &&
                error.message.includes('CLIENT_URL debe contener orígenes sin ruta') &&
                error.message.includes('CLIENT_URL debe usar HTTPS en producción')
        );
    });

    it('acepta varios orígenes HTTPS exactos en producción', () => {
        assert.doesNotThrow(() =>
            validateEnvironment({
                ...validEnvironment,
                NODE_ENV: 'production',
                CLIENT_URL: 'https://devlog.example.com,https://www.devlog.example.com',
            })
        );
    });
});
