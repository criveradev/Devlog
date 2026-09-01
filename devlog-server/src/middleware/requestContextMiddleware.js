/** Añade correlación, logging estructurado y medición a cada petición. */
import { randomUUID } from 'node:crypto';
import { recordHttpRequest } from '../observability/metricsRegistry.js';

const VALID_REQUEST_ID = /^[a-zA-Z0-9_-]{1,100}$/;

/** Reutiliza identificadores confiables o genera uno nuevo y seguro. */
export const requestContext = (req, res, next) => {
    const receivedRequestId = req.get('x-request-id');
    req.requestId = VALID_REQUEST_ID.test(receivedRequestId || '')
        ? receivedRequestId
        : randomUUID();

    res.set('x-request-id', req.requestId);
    next();
};

/** Registra una sola entrada al finalizar la respuesta, incluida su duración real. */
export const requestLogger = (req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.once('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        recordHttpRequest({ statusCode: res.statusCode, durationMs });

        if (process.env.NODE_ENV === 'test') return;

        console.info(
            JSON.stringify({
                event: 'http_request',
                requestId: req.requestId,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                durationMs: Number(durationMs.toFixed(2)),
            })
        );
    });

    next();
};
