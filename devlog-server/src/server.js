/**
 * Punto de entrada del proceso: valida configuración, conecta MongoDB y coordina
 * un apagado ordenado ante señales del sistema operativo.
 */
import 'dotenv/config';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { validateEnvironment } from './config/environment.js';

const PORT = Number(process.env.PORT || 5050);
const SHUTDOWN_TIMEOUT_MS = 10_000;

const startServer = async () => {
    validateEnvironment();
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.info(`Servidor escuchando en el puerto ${PORT}`);
    });

    const shutdown = (signal) => {
        console.info(`Señal ${signal} recibida; cerrando servidor`);

        // El timeout evita que una conexión colgada mantenga vivo el contenedor.
        const forcedShutdown = setTimeout(() => {
            console.error('El apagado ordenado excedió el tiempo máximo');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS);
        forcedShutdown.unref();

        server.close(async (serverError) => {
            try {
                await disconnectDB();
                clearTimeout(forcedShutdown);
                process.exit(serverError ? 1 : 0);
            } catch (error) {
                console.error('Error cerrando la conexión a MongoDB', { error: error.message });
                process.exit(1);
            }
        });
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
    console.error('No se pudo iniciar el servidor', { error: error.message });
    process.exit(1);
});
