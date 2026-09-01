/** Autentica cookies seguras y conserva compatibilidad temporal con Bearer JWT. */
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AUTH_COOKIE_NAME } from '../utils/authCookie.js';

/**
 * Verifica firma, usuario y versión de sesión antes de adjuntar req.user.
 * tokenVersion permite revocar inmediatamente JWT válidos ya emitidos.
 */
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const token = req.cookies?.[AUTH_COOKIE_NAME] || bearerToken;

        if (!token) {
            return res.status(401).json({ message: 'No autorizado, sin token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // El hash permanece excluido; solo se recupera la versión necesaria para revocación.
        req.user = await User.findById(decoded.id).select('+tokenVersion');

        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        if ((decoded.version ?? 0) !== req.user.tokenVersion) {
            return res.status(401).json({ message: 'Sesión revocada' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};
