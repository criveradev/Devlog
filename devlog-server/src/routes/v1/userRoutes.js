/** Declara rutas de perfiles, follows, edición y eliminación de cuenta. */
import express from 'express';
import { body, param, query } from 'express-validator';
import {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
} from '../../controllers/userController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { upload, validateUploadedImage } from '../../middleware/uploadMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import {
    contentWriteRateLimiter,
    interactionRateLimiter,
    uploadRateLimiter,
} from '../../middleware/rateLimitMiddleware.js';
import { deleteAccount } from '../../controllers/accountController.js';

const router = express.Router();

const validUserId = param('id').isMongoId().withMessage('El ID del usuario no es válido');

router.get(
    '/:id',
    protect,
    [
        validUserId,
        query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser mayor a 0').toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 20 })
            .withMessage('El límite debe estar entre 1 y 20')
            .toInt(),
    ],
    validateRequest,
    getUserProfile
);
router.put(
    '/profile',
    protect,
    contentWriteRateLimiter,
    uploadRateLimiter,
    upload.single('avatar'),
    validateUploadedImage,
    [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('El usuario debe tener entre 3 y 30 caracteres'),
        body('bio')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('La biografía no puede superar 200 caracteres'),
    ],
    validateRequest,
    updateProfile
);
router.put(
    '/:id/follow',
    protect,
    interactionRateLimiter,
    validUserId,
    validateRequest,
    followUser
);
router.delete(
    '/:id/follow',
    protect,
    interactionRateLimiter,
    validUserId,
    validateRequest,
    unfollowUser
);
router.delete(
    '/account',
    protect,
    contentWriteRateLimiter,
    body('currentPassword').isString().isLength({ min: 1, max: 128 }),
    validateRequest,
    deleteAccount
);

export default router;
