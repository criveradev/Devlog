/** Gestiona el límite HTTP de creación, listado y eliminación de comentarios. */
import { commentService } from '../services/commentService.js';

/** Crea un comentario asociado al usuario autenticado. */
export const createComment = async (req, res, next) => {
    try {
        const comment = await commentService.createComment({
            postId: req.params.postId,
            authorId: req.user._id,
            content: req.body.content,
        });
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

/** Lista comentarios de un post mediante paginación acotada. */
export const getCommentsByPost = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 20;
        const result = await commentService.getCommentsByPost({
            postId: req.params.postId,
            page,
            limit,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/** Elimina un comentario únicamente cuando pertenece al solicitante. */
export const deleteComment = async (req, res, next) => {
    try {
        await commentService.deleteComment({
            commentId: req.params.id,
            userId: req.user._id,
        });
        res.json({ message: 'Comentario eliminado' });
    } catch (error) {
        next(error);
    }
};
