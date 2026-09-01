/** Centraliza el nombre y los atributos de seguridad de la cookie de sesión. */
import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'devlog_access_token';

const baseCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
});

/**
 * Establece la cookie alineando su expiración con el claim exp del JWT.
 * Esto evita que el navegador conserve una cookie después de vencer el token.
 */
export const setAuthCookie = (res, token) => {
    const payload = jwt.decode(token);
    const maxAge = payload?.exp ? Math.max(0, payload.exp * 1000 - Date.now()) : undefined;

    res.cookie(AUTH_COOKIE_NAME, token, {
        ...baseCookieOptions(),
        ...(maxAge !== undefined ? { maxAge } : {}),
    });
};

/** Elimina la cookie usando exactamente el mismo path y atributos base. */
export const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions());
};
