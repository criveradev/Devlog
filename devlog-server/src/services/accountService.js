/** Gestiona verificación, recuperación y cambios sensibles de una cuenta. */
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import AccountToken from '../models/AccountToken.js';
import User from '../models/User.js';
import { ApplicationError } from '../errors/ApplicationError.js';
import { resendEmailService } from '../infrastructure/email/resendEmailService.js';

const TOKEN_LIFETIME_MS = {
    email_verification: 24 * 60 * 60 * 1000,
    email_change: 24 * 60 * 60 * 1000,
    password_reset: 60 * 60 * 1000,
};

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const clientUrl = () => process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

/**
 * Construye el servicio con adaptadores inyectables para aislar persistencia,
 * hashing y correo en pruebas.
 */
export const createAccountService = ({
    database,
    userModel,
    tokenModel,
    passwordHasher,
    emailService,
}) => {
    // Solo el hash se persiste; el token original existe lo suficiente para construir el enlace.
    const issueToken = async ({ user, type, pendingEmail }) => {
        const token = randomBytes(32).toString('hex');
        await tokenModel.deleteMany({ user: user._id, type });
        await tokenModel.create({
            user: user._id,
            type,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS[type]),
            ...(pendingEmail ? { pendingEmail } : {}),
        });
        return token;
    };

    // El borrado y la mutación asociada comparten transacción para garantizar un solo consumo.
    const consumeToken = async ({ token, type, mutate }) => {
        const session = await database.startSession();

        try {
            await session.withTransaction(async () => {
                const storedToken = await tokenModel.findOneAndDelete(
                    {
                        tokenHash: hashToken(token),
                        type,
                        expiresAt: { $gt: new Date() },
                    },
                    { session }
                );
                if (!storedToken) {
                    throw new ApplicationError(400, 'El token es inválido o expiró');
                }

                await mutate(storedToken, session);
            });
        } finally {
            await session.endSession();
        }
    };

    return {
        async requestEmailVerification(user) {
            emailService.assertConfigured();
            if (user.emailVerified) {
                throw new ApplicationError(409, 'El email ya está verificado');
            }
            const token = await issueToken({ user, type: 'email_verification' });
            await emailService.sendEmailVerification({
                to: user.email,
                url: `${clientUrl()}/verify-email?token=${token}`,
            });
        },

        async verifyEmail(token) {
            await consumeToken({
                token,
                type: 'email_verification',
                mutate: (storedToken, session) =>
                    userModel.updateOne(
                        { _id: storedToken.user },
                        { $set: { emailVerified: true } },
                        { session }
                    ),
            });
        },

        async requestPasswordReset(email) {
            emailService.assertConfigured();
            const user = await userModel.findOne({ email });
            // La ausencia se trata como éxito para no permitir enumeración de cuentas.
            if (!user) return;
            const token = await issueToken({ user, type: 'password_reset' });
            await emailService.sendPasswordReset({
                to: user.email,
                url: `${clientUrl()}/reset-password?token=${token}`,
            });
        },

        async resetPassword({ token, password }) {
            const passwordHash = await passwordHasher.hash(password, 12);
            await consumeToken({
                token,
                type: 'password_reset',
                // Incrementar la versión invalida todas las sesiones emitidas previamente.
                mutate: (storedToken, session) =>
                    userModel.updateOne(
                        { _id: storedToken.user },
                        { $set: { password: passwordHash }, $inc: { tokenVersion: 1 } },
                        { session }
                    ),
            });
        },

        async changePassword({ userId, currentPassword, newPassword }) {
            const user = await userModel.findById(userId).select('+password +tokenVersion');
            if (!user) {
                throw new ApplicationError(404, 'Usuario no encontrado');
            }
            const passwordMatches = await passwordHasher.compare(currentPassword, user.password);
            if (!passwordMatches) {
                throw new ApplicationError(401, 'La contraseña actual no es válida');
            }
            user.password = await passwordHasher.hash(newPassword, 12);
            user.tokenVersion += 1;
            await user.save();
        },

        async requestEmailChange({ user, newEmail }) {
            emailService.assertConfigured();
            if (await userModel.exists({ email: newEmail, _id: { $ne: user._id } })) {
                throw new ApplicationError(409, 'El email ya está en uso');
            }
            const token = await issueToken({ user, type: 'email_change', pendingEmail: newEmail });
            await emailService.sendEmailVerification({
                to: newEmail,
                url: `${clientUrl()}/verify-email?type=change&token=${token}`,
            });
        },

        async confirmEmailChange(token) {
            await consumeToken({
                token,
                type: 'email_change',
                mutate: (storedToken, session) =>
                    userModel.updateOne(
                        { _id: storedToken.user },
                        {
                            $set: { email: storedToken.pendingEmail, emailVerified: true },
                            $inc: { tokenVersion: 1 },
                        },
                        { session }
                    ),
            });
        },
    };
};

export const accountService = createAccountService({
    database: mongoose,
    userModel: User,
    tokenModel: AccountToken,
    passwordHasher: bcrypt,
    emailService: resendEmailService,
});
