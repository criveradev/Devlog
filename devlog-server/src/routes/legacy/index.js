/** Expone aliases temporales del contrato anterior sin mezclarlo con rutas versionadas. */
import express from 'express';
import { markLegacyApiAsDeprecated } from '../../middleware/apiDeprecationMiddleware.js';
import authRoutes from '../v1/authRoutes.js';
import commentRoutes from '../v1/commentRoutes.js';
import postRoutes from '../v1/postRoutes.js';
import userRoutes from '../v1/userRoutes.js';

const legacyRouter = express.Router();

legacyRouter.use('/auth', markLegacyApiAsDeprecated, authRoutes);
legacyRouter.use('/posts', markLegacyApiAsDeprecated, postRoutes);
legacyRouter.use('/comments', markLegacyApiAsDeprecated, commentRoutes);
legacyRouter.use('/users', markLegacyApiAsDeprecated, userRoutes);

export default legacyRouter;
