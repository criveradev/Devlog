/**
 * Define y valida el contrato mínimo de configuración del proceso.
 * La validación ocurre antes de conectar servicios para fallar rápido al arrancar.
 */
const REQUIRED_VARIABLES = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRES',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

/**
 * Valida variables requeridas y restricciones que no expresa dotenv.
 * @param {NodeJS.ProcessEnv|Record<string, string>} environment Entorno a validar.
 * @throws {Error} Incluye todas las inconsistencias encontradas en un solo mensaje.
 */
export const validateEnvironment = (environment = process.env) => {
    const errors = REQUIRED_VARIABLES.filter((name) => !environment[name]?.trim()).map(
        (name) => `${name} es requerida`
    );

    if (environment.JWT_SECRET && environment.JWT_SECRET.trim().length < 32) {
        errors.push('JWT_SECRET debe tener al menos 32 caracteres');
    }

    if (environment.JWT_EXPIRES && !/^\d+(ms|s|m|h|d|w|y)$/.test(environment.JWT_EXPIRES.trim())) {
        errors.push('JWT_EXPIRES debe incluir una unidad válida, por ejemplo 7d o 12h');
    }

    if (environment.PORT) {
        const port = Number(environment.PORT);
        if (!Number.isInteger(port) || port < 1 || port > 65_535) {
            errors.push('PORT debe ser un número entero entre 1 y 65535');
        }
    }

    if (environment.NODE_ENV === 'production' && !environment.CLIENT_URL?.trim()) {
        errors.push('CLIENT_URL es requerida en producción');
    }

    for (const configuredOrigin of environment.CLIENT_URL?.split(',') ?? []) {
        const origin = configuredOrigin.trim();
        if (!origin) continue;

        try {
            const parsedUrl = new URL(origin);
            if (parsedUrl.origin !== origin) {
                errors.push(`CLIENT_URL debe contener orígenes sin ruta ni barra final: ${origin}`);
            }
            if (environment.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
                errors.push(`CLIENT_URL debe usar HTTPS en producción: ${origin}`);
            }
        } catch {
            errors.push(`CLIENT_URL contiene un origen inválido: ${origin}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Configuración inválida:\n- ${errors.join('\n- ')}`);
    }
};
