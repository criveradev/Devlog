/** Declara contratos de entrada, cuotas y handlers de autenticación y cuenta. */
import express from 'express';
import { body } from 'express-validator';
import {
    getCurrentUser,
    login,
    logout,
    register,
} from '../../controllers/authController.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { protect } from '../../middleware/authMiddleware.js';
import { clearAuthCookie } from '../../utils/authCookie.js';
import {
    accountRecoveryRateLimiter,
    loginRateLimiter,
    registerRateLimiter,
} from '../../middleware/rateLimitMiddleware.js';
import {
    forgotPassword,
    changePassword,
    confirmEmailChange,
    requestEmailVerification,
    resetPassword,
    requestEmailChange,
    verifyEmail,
} from '../../controllers/accountController.js';

const router = express.Router();

router.post(
    '/register',
    registerRateLimiter,
    [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('El usuario debe tener entre 3 y 30 caracteres'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('El email no es válido')
            .normalizeEmail(),
        body('password')
            .isString()
            .isLength({ min: 12, max: 128 })
            .withMessage('La contraseña debe tener entre 12 y 128 caracteres'),
    ],
    validateRequest,
    register
);
router.post(
    '/login',
    loginRateLimiter,
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage('El email no es válido')
            .normalizeEmail(),
        body('password').isString().notEmpty().withMessage('La contraseña es requerida'),
    ],
    validateRequest,
    login
);
router.get('/me', protect, getCurrentUser);
router.post(
    '/logout',
    (req, res, next) => {
        clearAuthCookie(res);
        next();
    },
    protect,
    logout
);
router.post('/verify-email/request', protect, accountRecoveryRateLimiter, requestEmailVerification);
router.post(
    '/verify-email',
    accountRecoveryRateLimiter,
    body('token').isHexadecimal().isLength({ min: 64, max: 64 }),
    validateRequest,
    verifyEmail
);
router.post(
    '/forgot-password',
    accountRecoveryRateLimiter,
    body('email').trim().isEmail().normalizeEmail(),
    validateRequest,
    forgotPassword
);
router.post(
    '/reset-password',
    accountRecoveryRateLimiter,
    [
        body('token').isHexadecimal().isLength({ min: 64, max: 64 }),
        body('password').isString().isLength({ min: 12, max: 128 }),
    ],
    validateRequest,
    resetPassword
);
router.post(
    '/change-password',
    protect,
    accountRecoveryRateLimiter,
    [
        body('currentPassword').isString().notEmpty(),
        body('newPassword').isString().isLength({ min: 12, max: 128 }),
    ],
    validateRequest,
    changePassword
);
router.post(
    '/change-email/request',
    protect,
    accountRecoveryRateLimiter,
    body('email').trim().isEmail().normalizeEmail(),
    validateRequest,
    requestEmailChange
);
router.post(
    '/change-email/confirm',
    accountRecoveryRateLimiter,
    body('token').isHexadecimal().isLength({ min: 64, max: 64 }),
    validateRequest,
    confirmEmailChange
);

export default router;
