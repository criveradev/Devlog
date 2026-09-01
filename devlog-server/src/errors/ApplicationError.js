/**
 * Error esperado de aplicación que transporta un estado HTTP seguro para el cliente.
 * Los errores no clasificados se mantienen como fallos internos y se enmascaran.
 */
export class ApplicationError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'ApplicationError';
        this.statusCode = statusCode;
    }
}
