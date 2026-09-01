/** Expone registro, login, restauración y revocación de sesiones. */
import jwt from 'jsonwebtoken';
import { setAuthCookie } from '../utils/authCookie.js';
import { authService } from '../services/authService.js';

/** Emite un JWT ligado a la versión de sesión actual del usuario. */
const generateToken = (user) => {
    return jwt.sign({ id: user._id, version: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

/** Registra una identidad y establece su primera cookie de sesión. */
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = await authService.registerUser({ username, email, password });

        const token = generateToken(user);
        setAuthCookie(res, token);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
        });
    } catch (error) {
        next(error);
    }
};

/** Autentica credenciales y establece una cookie segura. */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await authService.authenticateUser({ email, password });

        const token = generateToken(user);
        setAuthCookie(res, token);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
        });
    } catch (error) {
        next(error);
    }
};

/** Devuelve exclusivamente campos públicos necesarios para restaurar la UI. */
export const getCurrentUser = (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        emailVerified: req.user.emailVerified,
        avatar: req.user.avatar,
        bio: req.user.bio,
    });
};

/** Incrementa tokenVersion para revocar todas las sesiones previamente emitidas. */
export const logout = async (req, res, next) => {
    try {
        req.user.tokenVersion += 1;
        await req.user.save();
    } catch (error) {
        return next(error);
    }

    res.json({ message: 'Sesión cerrada' });
};
