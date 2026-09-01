/** Ejecutable de migración manual con validación, logging y cierre garantizado. */
import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { validateEnvironment } from '../src/config/environment.js';
import { migrateRelations } from '../src/migrations/relationsMigration.js';

let connected = false;

try {
    validateEnvironment();
    await connectDB();
    connected = true;
    await migrateRelations();
    console.info('Migración de likes y follows completada');
} catch (error) {
    console.error('Falló la migración de likes y follows', { error: error.message });
    process.exitCode = 1;
} finally {
    if (connected) {
        await disconnectDB();
    }
}
