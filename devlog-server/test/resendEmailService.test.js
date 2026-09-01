/** Verifica configuración, contrato HTTP y fallos seguros del adaptador de Resend. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createResendEmailService } from '../src/infrastructure/email/resendEmailService.js';

const configuredEnvironment = {
    RESEND_API_KEY: 're_test_key',
    RESEND_FROM: 'Devlog <no-reply@example.com>',
};

describe('resendEmailService', () => {
    it('rechaza el uso cuando faltan credenciales', () => {
        const service = createResendEmailService({ environment: {} });

        assert.throws(
            () => service.assertConfigured(),
            (error) => error.statusCode === 503 && error.message === 'El servicio de email no está configurado'
        );
    });

    it('envía el contrato esperado a la API de Resend', async () => {
        let request;
        const service = createResendEmailService({
            environment: configuredEnvironment,
            fetchFn: async (url, options) => {
                request = { url, options };
                return { ok: true, status: 200 };
            },
        });

        await service.sendPasswordReset({
            to: 'dev@example.com',
            url: 'https://devlog.example/reset-password?token=abc',
        });

        assert.equal(request.url, 'https://api.resend.com/emails');
        assert.equal(request.options.method, 'POST');
        assert.equal(request.options.headers.authorization, 'Bearer re_test_key');
        assert.deepEqual(JSON.parse(request.options.body), {
            from: 'Devlog <no-reply@example.com>',
            to: ['dev@example.com'],
            subject: 'Restablece tu contraseña de Devlog',
            text: 'Restablece tu contraseña abriendo este enlace: https://devlog.example/reset-password?token=abc',
        });
    });

    it('enmascara los errores devueltos por Resend', async () => {
        const loggedErrors = [];
        const service = createResendEmailService({
            environment: configuredEnvironment,
            fetchFn: async () => ({
                ok: false,
                status: 403,
                json: async () => ({ name: 'validation_error' }),
            }),
            logger: { error: (...args) => loggedErrors.push(args) },
        });

        await assert.rejects(
            () =>
                service.sendEmailVerification({
                    to: 'dev@example.com',
                    url: 'https://devlog.example/verify-email?token=abc',
                }),
            (error) => error.statusCode === 502 && error.message === 'No se pudo enviar el email'
        );
        assert.equal(loggedErrors.length, 1);
    });
});
