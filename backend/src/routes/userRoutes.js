import express from 'express';
import {
    getUserProfile,
    updateProfile,
    toggleFollow,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/:id', getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/:id/follow', protect, toggleFollow);

export default router;