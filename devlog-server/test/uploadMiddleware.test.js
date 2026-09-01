/** Valida detección binaria de imágenes y rechazo de MIME inconsistentes. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateUploadedImage } from '../src/middleware/uploadMiddleware.js';

const runValidation = (file) => {
    let receivedError;
    validateUploadedImage({ file }, {}, (error) => {
        receivedError = error;
    });
    return receivedError;
};

describe('validateUploadedImage', () => {
    it('acepta una imagen PNG cuya firma coincide con su MIME', () => {
        const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

        const error = runValidation({ mimetype: 'image/png', buffer });

        assert.equal(error, undefined);
    });

    it('rechaza contenido arbitrario aunque declare un MIME permitido', () => {
        const error = runValidation({
            mimetype: 'image/jpeg',
            buffer: Buffer.from('contenido que no es una imagen'),
        });

        assert.equal(error.statusCode, 422);
        assert.equal(error.message, 'El archivo no contiene una imagen JPG, PNG o WEBP válida');
    });

    it('rechaza una firma válida cuando no coincide con el MIME declarado', () => {
        const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);

        const error = runValidation({ mimetype: 'image/png', buffer: jpegBuffer });

        assert.equal(error.statusCode, 422);
    });
});
