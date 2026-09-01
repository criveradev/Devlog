/** Normaliza rutas inexistentes dentro del contrato JSON común de la API. */
export const notFound = (req, res, next) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
};

/**
 * Traduce errores conocidos y enmascara detalles internos antes de responder.
 * Los fallos inesperados conservan contexto operativo únicamente en logs.
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message;

    if (err.code === 11000) {
        statusCode = 409;
        message = 'El usuario o email ya está en uso';
    } else if (err.name === 'ValidationError') {
        statusCode = 422;
        message = 'Datos de entrada inválidos';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        message = 'La imagen supera el tamaño máximo permitido de 5MB';
    } else if (err.type === 'entity.too.large') {
        statusCode = 413;
        message = 'El cuerpo de la petición supera el tamaño máximo permitido';
    } else if (err.message === 'Not allowed by CORS') {
        statusCode = 403;
        message = 'Origen no permitido';
    } else if (statusCode >= 500 && err.name !== 'ApplicationError') {
        message = 'Error interno del servidor';
    }

    if (statusCode >= 500 && err.name !== 'ApplicationError') {
        console.error('Error no controlado', {
            method: req.method,
            path: req.originalUrl,
            requestId: req.requestId,
            error: err.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
        });
    }

    res.status(statusCode).json({
        message,
    });
};
