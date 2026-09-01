/** Garantiza atributos y expiración coherentes al crear o limpiar cookies de sesión. */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import {
    AUTH_COOKIE_NAME,
    clearAuthCookie,
    setAuthCookie,
} from '../src/utils/authCookie.js';

const originalNodeEnvironment = process.env.NODE_ENV;

afterEach(() => {
    process.env.NODE_ENV = originalNodeEnvironment;
});

describe('cookie de autenticación', () => {
    it('usa atributos seguros y una duración alineada con el JWT', () => {
        process.env.NODE_ENV = 'production';
        const token = jwt.sign({ id: 'user-id' }, 'a'.repeat(32), { expiresIn: '1h' });
        let cookie;
        const response = {
            cookie(name, value, options) {
                cookie = { name, value, options };
            },
        };

        setAuthCookie(response, token);

        assert.equal(cookie.name, AUTH_COOKIE_NAME);
        assert.equal(cookie.value, token);
        assert.equal(cookie.options.httpOnly, true);
        assert.equal(cookie.options.secure, true);
        assert.equal(cookie.options.sameSite, 'strict');
        assert.ok(cookie.options.maxAge > 3_500_000 && cookie.options.maxAge <= 3_600_000);
    });

    it('elimina la cookie usando los mismos atributos base', () => {
        process.env.NODE_ENV = 'development';
        let clearedCookie;
        const response = {
            clearCookie(name, options) {
                clearedCookie = { name, options };
            },
        };

        clearAuthCookie(response);

        assert.equal(clearedCookie.name, AUTH_COOKIE_NAME);
        assert.deepEqual(clearedCookie.options, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        });
    });
});
