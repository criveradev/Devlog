/** Agrupa el contrato HTTP público de la versión 1 de la API. */
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { API_NAME, CURRENT_API_VERSION } from '../../config/api.js';
import { swaggerDocument } from '../../config/swagger.js';
import { allowSwaggerUiAssets } from '../../middleware/swaggerMiddleware.js';
import authRoutes from './authRoutes.js';
import commentRoutes from './commentRoutes.js';
import postRoutes from './postRoutes.js';
import userRoutes from './userRoutes.js';

const v1Router = express.Router();

v1Router.get('/openapi.json', (req, res) => {
    res.json(swaggerDocument);
});
v1Router.use(
    '/docs',
    allowSwaggerUiAssets,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'Devlog API v1',
        swaggerOptions: { persistAuthorization: true },
    })
);

v1Router.get('/', (req, res) => {
    res.json({
        name: API_NAME,
        version: CURRENT_API_VERSION,
        status: 'current',
        docs: '/api/v1/docs',
        openapi: '/api/v1/openapi.json',
    });
});
v1Router.use('/auth', authRoutes);
v1Router.use('/posts', postRoutes);
v1Router.use('/comments', commentRoutes);
v1Router.use('/users', userRoutes);

export default v1Router;
