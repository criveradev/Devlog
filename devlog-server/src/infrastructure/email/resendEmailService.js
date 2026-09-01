/** Adaptador HTTP de Resend para los correos transaccionales de cuentas. */
import { ApplicationError } from '../../errors/ApplicationError.js';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 10_000;

/** Construye el servicio con límites externos inyectables para probarlo sin red. */
export const createResendEmailService = ({
    fetchFn = globalThis.fetch,
    environment = process.env,
    logger = console,
} = {}) => {
    const getConfiguration = () => {
        const apiKey = environment.RESEND_API_KEY?.trim();
        const from = environment.RESEND_FROM?.trim();

        if (!apiKey || !from) {
            throw new ApplicationError(503, 'El servicio de email no está configurado');
        }

        return { apiKey, from };
    };

    const sendActionEmail = async ({ to, subject, text }) => {
        const { apiKey, from } = getConfiguration();
        let response;

        try {
            response = await fetchFn(RESEND_EMAILS_URL, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${apiKey}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ from, to: [to], subject, text }),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
        } catch (error) {
            logger.error('No se pudo conectar con Resend', { error: error.message });
            throw new ApplicationError(502, 'No se pudo enviar el email');
        }

        if (!response.ok) {
            let providerCode;
            try {
                providerCode = (await response.json())?.name;
            } catch {
                providerCode = undefined;
            }

            logger.error('Resend rechazó el envío de email', {
                statusCode: response.status,
                providerCode,
            });
            throw new ApplicationError(502, 'No se pudo enviar el email');
        }
    };

    return {
        assertConfigured: getConfiguration,
        sendEmailVerification: ({ to, url }) =>
            sendActionEmail({
                to,
                subject: 'Verifica tu cuenta de Devlog',
                text: `Verifica tu cuenta abriendo este enlace: ${url}`,
            }),
        sendPasswordReset: ({ to, url }) =>
            sendActionEmail({
                to,
                subject: 'Restablece tu contraseña de Devlog',
                text: `Restablece tu contraseña abriendo este enlace: ${url}`,
            }),
    };
};

export const resendEmailService = createResendEmailService();
