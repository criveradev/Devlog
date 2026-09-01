/** Implementa cursores opacos y estables para colecciones ordenadas por fecha e ID. */
import mongoose from 'mongoose';
import { ApplicationError } from '../errors/ApplicationError.js';

/** Serializa la posición de un documento como cursor URL-safe. */
export const encodePaginationCursor = ({ createdAt, _id }) =>
    Buffer.from(
        JSON.stringify({ createdAt: new Date(createdAt).toISOString(), id: String(_id) })
    ).toString('base64url');

/** Decodifica y valida un cursor recibido desde un límite de confianza. */
export const decodePaginationCursor = (cursor) => {
    try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
        const createdAt = new Date(decoded.createdAt);
        if (Number.isNaN(createdAt.getTime()) || !mongoose.isValidObjectId(decoded.id)) {
            throw new Error('Cursor inválido');
        }
        return { createdAt, _id: new mongoose.Types.ObjectId(decoded.id) };
    } catch {
        throw new ApplicationError(422, 'El cursor de paginación no es válido');
    }
};

/**
 * Genera el filtro MongoDB que continúa después del cursor sin duplicar filas.
 * El ObjectId actúa como desempate cuando varios documentos comparten fecha.
 */
export const buildCursorFilter = (cursor) => {
    if (!cursor) return {};
    const { createdAt, _id } = decodePaginationCursor(cursor);
    return {
        $or: [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: _id } }],
    };
};
