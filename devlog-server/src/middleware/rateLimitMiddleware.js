/** Define límites separados según el riesgo y costo de cada operación HTTP. */
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const createAuthRateLimiter = ({ windowMs, limit, message }) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { message },
    });

export const loginRateLimiter = createAuthRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
});

export const registerRateLimiter = createAuthRateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'Demasiados intentos de registro. Intenta nuevamente más tarde.',
});

export const accountRecoveryRateLimiter = createAuthRateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'Demasiadas solicitudes de recuperación. Intenta nuevamente más tarde.',
});

// Tras autenticar, la cuota sigue al usuario aunque cambie de dirección IP.
const authenticatedKeyGenerator = (req) =>
    req.user?._id ? `user:${req.user._id}` : `ip:${ipKeyGenerator(req.ip)}`;

const createAuthenticatedRateLimiter = ({ windowMs, limit, message }) =>
    rateLimit({
        windowMs,
        limit,
        keyGenerator: authenticatedKeyGenerator,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { message },
    });

export const contentWriteRateLimiter = createAuthenticatedRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    message: 'Has realizado demasiadas operaciones de contenido. Intenta nuevamente más tarde.',
});

export const interactionRateLimiter = createAuthenticatedRateLimiter({
    windowMs: 60 * 1000,
    limit: 60,
    message: 'Has realizado demasiadas interacciones. Intenta nuevamente en un minuto.',
});

export const uploadRateLimiter = createAuthenticatedRateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    message: 'Has realizado demasiadas operaciones con imágenes. Intenta nuevamente más tarde.',
});
