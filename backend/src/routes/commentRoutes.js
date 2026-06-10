import express from 'express';
import {
    createComment,
    getCommentsByPost,
    deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', protect, createComment);
router.delete('/:id', protect, deleteComment);

export default router;