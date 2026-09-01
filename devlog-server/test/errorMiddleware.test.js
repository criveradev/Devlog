/** Verifica traducción segura y consistente de errores de aplicación e infraestructura. */
import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { errorHandler } from '../src/middleware/errorMiddleware.js';

const createResponse = () => ({
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
});

const request = {
    method: 'POST',
    originalUrl: '/api/auth/register',
};

describe('errorHandler', () => {
    it('oculta detalles internos en errores inesperados', () => {
        mock.method(console, 'error', () => {});
        const response = createResponse();

        errorHandler(new Error('mongodb://usuario:secreto@host'), request, response);

        assert.equal(response.statusCode, 500);
        assert.deepEqual(response.body, { message: 'Error interno del servidor' });
        mock.restoreAll();
    });

    it('traduce claves duplicadas a conflicto', () => {
        const response = createResponse();
        const error = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });

        errorHandler(error, request, response);

        assert.equal(response.statusCode, 409);
        assert.deepEqual(response.body, { message: 'El usuario o email ya está en uso' });
    });

    it('traduce archivos demasiado grandes a payload too large', () => {
        const response = createResponse();
        const error = Object.assign(new Error('File too large'), { code: 'LIMIT_FILE_SIZE' });

        errorHandler(error, request, response);

        assert.equal(response.statusCode, 413);
        assert.deepEqual(response.body, {
            message: 'La imagen supera el tamaño máximo permitido de 5MB',
        });
    });

    it('traduce cuerpos JSON demasiado grandes sin filtrar mensajes internos', () => {
        const response = createResponse();
        const error = Object.assign(new Error('request entity too large'), {
            type: 'entity.too.large',
            statusCode: 413,
        });

        errorHandler(error, request, response);

        assert.equal(response.statusCode, 413);
        assert.deepEqual(response.body, {
            message: 'El cuerpo de la petición supera el tamaño máximo permitido',
        });
    });
});
