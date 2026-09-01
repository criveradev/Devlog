/** Carga el contrato OpenAPI v1 que utiliza Swagger UI y las pruebas de contrato. */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const openApiFile = new URL('../../openapi.yaml', import.meta.url);

export const swaggerDocument = parse(readFileSync(openApiFile, 'utf8'));

if (swaggerDocument.openapi !== '3.1.0') {
    throw new Error('El contrato OpenAPI debe utilizar la versión 3.1.0');
}
