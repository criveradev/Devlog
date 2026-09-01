/** Traduce operaciones sensibles de cuenta entre HTTP y los servicios de aplicación. */
import { accountService } from '../services/accountService.js';
import { accountDeletionService } from '../services/accountDeletionService.js';
import { clearAuthCookie } from '../utils/authCookie.js';

/** Solicita el correo de verificación para la sesión autenticada. */
export const requestEmailVerification = async (req, res, next) => {
    try {
        await accountService.requestEmailVerification(req.user);
        res.status(202).json({ message: 'Email de verificación enviado' });
    } catch (error) {
        next(error);
    }
};

/** Consume un token de verificación enviado en el cuerpo. */
export const verifyEmail = async (req, res, next) => {
    try {
        await accountService.verifyEmail(req.body.token);
        res.json({ message: 'Email verificado' });
    } catch (error) {
        next(error);
    }
};

/** Inicia recuperación sin revelar si la dirección pertenece a una cuenta. */
export const forgotPassword = async (req, res, next) => {
    try {
        await accountService.requestPasswordReset(req.body.email);
        res.status(202).json({
            message: 'Si la cuenta existe, recibirás instrucciones para restablecer la contraseña',
        });
    } catch (error) {
        next(error);
    }
};

/** Reemplaza la contraseña mediante un token de un solo uso. */
export const resetPassword = async (req, res, next) => {
    try {
        await accountService.resetPassword(req.body);
        res.json({ message: 'Contraseña actualizada' });
    } catch (error) {
        next(error);
    }
};

/** Elimina la cuenta autenticada y limpia su cookie tras confirmar la operación. */
export const deleteAccount = async (req, res, next) => {
    try {
        await accountDeletionService.deleteAccount({
            userId: req.user._id,
            currentPassword: req.body.currentPassword,
        });
        clearAuthCookie(res);
        res.json({ message: 'Cuenta eliminada' });
    } catch (error) {
        next(error);
    }
};

/** Cambia la contraseña y fuerza una nueva autenticación. */
export const changePassword = async (req, res, next) => {
    try {
        await accountService.changePassword({
            userId: req.user._id,
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword,
        });
        clearAuthCookie(res);
        res.json({ message: 'Contraseña actualizada; inicia sesión nuevamente' });
    } catch (error) {
        next(error);
    }
};

/** Envía al nuevo email el enlace que autoriza el cambio. */
export const requestEmailChange = async (req, res, next) => {
    try {
        await accountService.requestEmailChange({ user: req.user, newEmail: req.body.email });
        res.status(202).json({ message: 'Confirmación enviada al nuevo email' });
    } catch (error) {
        next(error);
    }
};

/** Confirma el nuevo email y elimina la sesión que contiene la identidad anterior. */
export const confirmEmailChange = async (req, res, next) => {
    try {
        await accountService.confirmEmailChange(req.body.token);
        clearAuthCookie(res);
        res.json({ message: 'Email actualizado; inicia sesión nuevamente' });
    } catch (error) {
        next(error);
    }
};
