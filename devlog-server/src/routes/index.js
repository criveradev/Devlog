/** Compone las versiones públicas de la API bajo un único router raíz. */
import express from 'express';
import {
    API_NAME,
    CURRENT_API_PATH,
    CURRENT_API_VERSION,
} from '../config/api.js';
import legacyRouter from './legacy/index.js';
import v1Router from './v1/index.js';

const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
    res.json({
        name: API_NAME,
        currentVersion: CURRENT_API_VERSION,
        versions: [
            {
                version: CURRENT_API_VERSION,
                basePath: CURRENT_API_PATH,
                status: 'current',
            },
        ],
    });
});

apiRouter.use(`/${CURRENT_API_VERSION}`, v1Router);
apiRouter.use(legacyRouter);

export default apiRouter;
