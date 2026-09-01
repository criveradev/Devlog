/** Declara rutas de comentarios con validación previa a cada controlador. */
import express from 'express';
import { body, param, query } from 'express-validator';
import {
    createComment,
    getCommentsByPost,
    deleteComment,
} from '../../controllers/commentController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validationMiddleware.js';
import { contentWriteRateLimiter } from '../../middleware/rateLimitMiddleware.js';

const router = express.Router();

const validPostId = param('postId').isMongoId().withMessage('El ID del post no es válido');
const validCommentId = param('id').isMongoId().withMessage('El ID del comentario no es válido');
const validContent = body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('El comentario debe tener entre 1 y 500 caracteres');

router.get(
    '/post/:postId',
    [
        validPostId,
        query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser mayor a 0').toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('El límite debe estar entre 1 y 50')
            .toInt(),
    ],
    validateRequest,
    getCommentsByPost
);
router.post(
    '/post/:postId',
    protect,
    contentWriteRateLimiter,
    [validPostId, validContent],
    validateRequest,
    createComment
);
router.delete(
    '/:id',
    protect,
    contentWriteRateLimiter,
    validCommentId,
    validateRequest,
    deleteComment
);

export default router;
