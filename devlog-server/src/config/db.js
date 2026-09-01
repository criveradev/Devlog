/** Gestiona el ciclo de vida de la conexión principal a MongoDB. */
import mongoose from 'mongoose';

/** Abre la conexión configurada en MONGO_URI o propaga el error de arranque. */
export const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.info('MongoDB conectado');
};

/** Cierra ordenadamente la conexión activa durante el apagado del proceso. */
export const disconnectDB = async () => {
    await mongoose.connection.close();
};
