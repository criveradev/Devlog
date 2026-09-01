/** Valida que el contrato versionado sea legible y describa los recursos publicados. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { swaggerDocument } from '../src/config/swagger.js';

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

describe('contrato OpenAPI v1', () => {
    it('declara servidores versionados y operaciones principales', () => {
        assert.equal(swaggerDocument.openapi, '3.1.0');
        assert.equal(swaggerDocument.info['x-api-version'], 'v1');
        assert.ok(swaggerDocument.servers.every(({ url }) => url.endsWith('/api/v1')));
        assert.ok(swaggerDocument.paths['/auth/register']?.post);
        assert.ok(swaggerDocument.paths['/posts']?.get);
        assert.ok(swaggerDocument.paths['/users/{id}']?.get);
        assert.ok(swaggerDocument.paths['/posts/{id}/like']?.put);
        assert.ok(swaggerDocument.paths['/posts/{id}/like']?.delete);
        assert.ok(swaggerDocument.paths['/users/{id}/follow']?.put);
        assert.ok(swaggerDocument.paths['/users/{id}/follow']?.delete);
        assert.equal(swaggerDocument.paths['/posts/{id}/like']?.post, undefined);
    });

    it('asigna summaries y operationId únicos a todas las operaciones', () => {
        const operations = Object.values(swaggerDocument.paths).flatMap((pathItem) =>
            Object.entries(pathItem)
                .filter(([method]) => HTTP_METHODS.has(method))
                .map(([, operation]) => operation)
        );
        const operationIds = operations.map(({ operationId }) => operationId);

        assert.ok(operations.length > 0);
        assert.ok(operations.every(({ summary }) => typeof summary === 'string' && summary.length > 0));
        assert.ok(operationIds.every(Boolean));
        assert.equal(new Set(operationIds).size, operations.length);
    });
});
