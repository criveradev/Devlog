import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();


// Middlewares globales
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            'http://localhost:5173',
            'http://localhost:5050',
            process.env.CLIENT_URL,
        ].filter(Boolean);

        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json()); // permite leer JSON en req.body

// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando' });
});

// Conectar a la base de datos y arrancar servidor
const PORT = process.env.PORT || 5050;

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor en http://localhost:${PORT}`);
    });
});

app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use(notFound);
app.use(errorHandler);