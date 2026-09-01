/** Comprueba contratos HTTP, seguridad, cuotas, observabilidad y manejo de errores. */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import app from '../src/app.js';

describe('aplicación HTTP', () => {
    let server;
    let baseUrl;

    before(async () => {
        await new Promise((resolve) => {
            server = app.listen(0, '127.0.0.1', resolve);
        });
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    after(async () => {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    });

    it('expone health con cabeceras de seguridad y correlación', async () => {
        const response = await fetch(`${baseUrl}/health`, {
            headers: { 'x-request-id': 'integration-test-id' },
        });
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.status, 'ok');
        assert.equal(response.headers.get('x-request-id'), 'integration-test-id');
        assert.ok(response.headers.get('content-security-policy'));
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    });

    it('genera un request ID seguro cuando el recibido no es válido', async () => {
        const response = await fetch(`${baseUrl}/health`, {
            headers: { 'x-request-id': 'valor con espacios' },
        });

        assert.match(response.headers.get('x-request-id'), /^[0-9a-f-]{36}$/);
    });

    it('diferencia readiness de liveness cuando MongoDB no está conectado', async () => {
        const response = await fetch(`${baseUrl}/ready`);

        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), {
            status: 'not_ready',
            database: 'disconnected',
        });
    });

    it('mantiene métricas ocultas hasta configurar su token', async () => {
        const response = await fetch(`${baseUrl}/metrics`);

        assert.equal(response.status, 404);
    });

    it('expone métricas solamente con el token operativo', async () => {
        process.env.METRICS_TOKEN = 'metrics-test-token';
        try {
            const unauthorized = await fetch(`${baseUrl}/metrics`);
            const authorized = await fetch(`${baseUrl}/metrics`, {
                headers: { authorization: 'Bearer metrics-test-token' },
            });
            const metrics = await authorized.json();

            assert.equal(unauthorized.status, 401);
            assert.equal(authorized.status, 200);
            assert.ok(metrics.http.requestsTotal > 0);
            assert.ok(metrics.process.memoryBytes > 0);
        } finally {
            delete process.env.METRICS_TOKEN;
        }
    });

    it('responde 404 mediante el contrato común de errores', async () => {
        const response = await fetch(`${baseUrl}/ruta-inexistente`);
        const body = await response.json();

        assert.equal(response.status, 404);
        assert.deepEqual(body, { message: 'Ruta no encontrada: /ruta-inexistente' });
    });

    it('rechaza orígenes no autorizados sin filtrar detalles internos', async () => {
        const response = await fetch(`${baseUrl}/health`, {
            headers: { origin: 'https://origen-malicioso.example' },
        });
        const body = await response.json();

        assert.equal(response.status, 403);
        assert.deepEqual(body, { message: 'Origen no permitido' });
    });

    it('no permite orígenes locales implícitos en producción', async () => {
        const previousNodeEnvironment = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        try {
            const response = await fetch(`${baseUrl}/health`, {
                headers: { origin: 'http://localhost:5173' },
            });

            assert.equal(response.status, 403);
        } finally {
            process.env.NODE_ENV = previousNodeEnvironment;
        }
    });

    it('publica el catálogo de versiones soportadas', async () => {
        const response = await fetch(`${baseUrl}/api`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            name: 'Devlog API',
            currentVersion: 'v1',
            versions: [{ version: 'v1', basePath: '/api/v1', status: 'current' }],
        });
    });

    it('expone la versión actual de la API', async () => {
        const response = await fetch(`${baseUrl}/api/v1`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            name: 'Devlog API',
            version: 'v1',
            status: 'current',
            docs: '/api/v1/docs',
            openapi: '/api/v1/openapi.json',
        });
    });

    it('publica el contrato OpenAPI y Swagger UI dentro de v1', async () => {
        const contractResponse = await fetch(`${baseUrl}/api/v1/openapi.json`);
        const swaggerResponse = await fetch(`${baseUrl}/api/v1/docs/`);
        const contract = await contractResponse.json();
        const swaggerHtml = await swaggerResponse.text();

        assert.equal(contractResponse.status, 200);
        assert.equal(contract.openapi, '3.1.0');
        assert.ok(contract.paths['/auth/login']);
        assert.equal(swaggerResponse.status, 200);
        assert.match(swaggerHtml, /Devlog API v1/);
        assert.match(swaggerResponse.headers.get('content-security-policy'), /unsafe-inline/);
    });

    it('mantiene temporalmente rutas legacy con deprecación estándar', async () => {
        const response = await fetch(`${baseUrl}/api/auth/me`);

        assert.equal(response.status, 401);
        assert.equal(response.headers.get('deprecation'), '@1788048000');
        assert.equal(response.headers.get('x-api-deprecated'), 'true');
        assert.equal(response.headers.get('link'), '</api/v1>; rel="successor-version"');
    });

    it('no resuelve versiones desconocidas mediante el contrato legacy', async () => {
        const response = await fetch(`${baseUrl}/api/v2/auth/me`);

        assert.equal(response.status, 404);
        assert.equal(response.headers.get('deprecation'), null);
    });

    it('rechaza la consulta de sesión cuando no existe una cookie', async () => {
        const response = await fetch(`${baseUrl}/api/v1/auth/me`);

        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { message: 'No autorizado, sin token' });
    });

    it('logout invalida la cookie aunque la sesión ya no sea válida', async () => {
        const response = await fetch(`${baseUrl}/api/v1/auth/logout`, { method: 'POST' });
        const setCookie = response.headers.get('set-cookie');

        assert.equal(response.status, 401);
        assert.match(setCookie, /^devlog_access_token=;/);
        assert.match(setCookie, /HttpOnly/);
        assert.match(setCookie, /SameSite=Strict/);
    });

    it('rechaza cuerpos JSON superiores al límite global', async () => {
        const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: 'dev@example.com', password: 'x'.repeat(110_000) }),
        });

        assert.equal(response.status, 413);
        assert.deepEqual(await response.json(), {
            message: 'El cuerpo de la petición supera el tamaño máximo permitido',
        });
    });

    it('limita intentos repetidos contra el endpoint de login', async () => {
        const responses = [];
        for (let attempt = 0; attempt < 11; attempt += 1) {
            responses.push(
                await fetch(`${baseUrl}/api/v1/auth/login`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({}),
                })
            );
        }

        assert.equal(responses[9].status, 422);
        assert.equal(responses[10].status, 429);
        assert.deepEqual(await responses[10].json(), {
            message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
        });
    });

    it('informa que Resend debe configurarse antes de recuperar contraseñas', async () => {
        const response = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: 'dev@example.com' }),
        });

        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), {
            message: 'El servicio de email no está configurado',
        });
    });
});
