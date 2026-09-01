/**
 * Compone la aplicación HTTP sin abrir puertos ni conectar infraestructura.
 * Esta separación permite probar Express en aislamiento y controlar el arranque.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import apiRouter from './routes/index.js';
import { API_BASE_PATH } from './config/api.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import {
    requestContext,
    requestLogger,
} from './middleware/requestContextMiddleware.js';
import { protectMetrics } from './middleware/metricsAuthMiddleware.js';
import { getMetricsSnapshot } from './observability/metricsRegistry.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// El orden es deliberado: seguridad y contexto preceden al parsing y a las rutas.
app.use(helmet());
app.use(requestContext);
app.use(requestLogger);
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        // CLIENT_URL admite varios dominios separados por coma,
        // p. ej. "https://devlog.criveradev.com,https://criveradev.com"
        const developmentOrigins = process.env.NODE_ENV === 'production'
            ? []
            : ['http://localhost:5173', 'http://localhost:5050'];
        const allowed = [
            ...developmentOrigins,
            ...(process.env.CLIENT_URL?.split(',').map((value) => value.trim()) ?? []),
        ].filter(Boolean);

        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// Liveness solo confirma que el proceso HTTP responde; no depende de MongoDB.
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/ready', (req, res) => {
    // Readiness evita recibir tráfico cuando la persistencia no está disponible.
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
        status: ready ? 'ready' : 'not_ready',
        database: ready ? 'connected' : 'disconnected',
    });
});
app.get('/metrics', protectMetrics, (req, res) => {
    res.json(getMetricsSnapshot());
});
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando' });
});

app.use(API_BASE_PATH, apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
