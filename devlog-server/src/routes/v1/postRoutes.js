/** Declara rutas de posts y compone autorización, cuotas, uploads y validación. */
import express from 'express';
import { body, param, query } from 'express-validator';
import {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
} from '../../controllers/postController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { upload, validateUploadedImage } from '../../middleware/uploadMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import {
    contentWriteRateLimiter,
    interactionRateLimiter,
    uploadRateLimiter,
} from '../../middleware/rateLimitMiddleware.js';

const router = express.Router();

const validPostId = param('id').isMongoId().withMessage('El ID del post no es válido');
const validContent = body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido debe tener entre 1 y 1000 caracteres');

router.get(
    '/',
    protect,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser mayor a 0').toInt(),
        query('cursor')
            .optional()
            .isString()
            .isLength({ max: 200 })
            .withMessage('El cursor no es válido'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('El límite debe estar entre 1 y 50')
            .toInt(),
    ],
    validateRequest,
    getPosts
);
router.get('/:id', protect, validPostId, validateRequest, getPostById);
router.post(
    '/',
    protect,
    contentWriteRateLimiter,
    uploadRateLimiter,
    upload.single('image'),
    validateUploadedImage,
    validContent,
    validateRequest,
    createPost
);
router.put(
    '/:id',
    protect,
    contentWriteRateLimiter,
    [validPostId, validContent],
    validateRequest,
    updatePost
);
router.delete(
    '/:id',
    protect,
    contentWriteRateLimiter,
    validPostId,
    validateRequest,
    deletePost
);
router.put(
    '/:id/like',
    protect,
    interactionRateLimiter,
    validPostId,
    validateRequest,
    likePost
);
router.delete(
    '/:id/like',
    protect,
    interactionRateLimiter,
    validPostId,
    validateRequest,
    unlikePost
);

export default router;
