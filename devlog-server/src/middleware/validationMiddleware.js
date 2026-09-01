/** Convierte resultados de express-validator al contrato uniforme de errores 422. */
import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next();
    }

    const errors = result.array().map(({ path, msg }) => ({
        field: path,
        message: msg,
    }));

    return res.status(422).json({
        message: 'Datos de entrada inválidos',
        errors,
    });
};
