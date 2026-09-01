/** Protege métricas operativas sin revelar siquiera la ruta cuando están deshabilitadas. */
import { timingSafeEqual } from 'node:crypto';

// La comparación constante reduce filtraciones de información por diferencias de tiempo.
const valuesAreEqual = (left, right) => {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

/** Exige un Bearer token dedicado, independiente de las sesiones de usuario. */
export const protectMetrics = (req, res, next) => {
    const configuredToken = process.env.METRICS_TOKEN;
    if (!configuredToken) {
        return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    const receivedToken = req.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    if (!valuesAreEqual(receivedToken, configuredToken)) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    return next();
};
