/**
 * Registro liviano de métricas del proceso. Se mantiene en memoria para evitar
 * introducir infraestructura externa en esta versión de la aplicación.
 */
const startedAt = Date.now();
let requestsTotal = 0;
let totalDurationMs = 0;
const responsesByStatus = new Map();

/** Acumula duración y familia de estado de cada respuesta HTTP completada. */
export const recordHttpRequest = ({ statusCode, durationMs }) => {
    requestsTotal += 1;
    totalDurationMs += durationMs;
    const statusGroup = `${Math.floor(statusCode / 100)}xx`;
    responsesByStatus.set(statusGroup, (responsesByStatus.get(statusGroup) || 0) + 1);
};

/** Construye una fotografía serializable de las métricas operativas actuales. */
export const getMetricsSnapshot = () => ({
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    http: {
        requestsTotal,
        responsesByStatus: Object.fromEntries(responsesByStatus),
        averageDurationMs:
            requestsTotal === 0 ? 0 : Number((totalDurationMs / requestsTotal).toFixed(2)),
    },
    process: {
        memoryBytes: process.memoryUsage().rss,
    },
});
