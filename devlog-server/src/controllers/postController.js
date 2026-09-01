/** Adapta peticiones de publicaciones a servicios y contratos de respuesta HTTP. */
import Post from '../models/Post.js';
import { postService } from '../services/postService.js';
import { interactionService } from '../services/interactionService.js';
import { feedService } from '../services/feedService.js';

/** Crea una publicación y delega el ciclo de vida de la imagen al servicio. */
export const createPost = async (req, res, next) => {
    try {
        const { content } = req.body;
        const post = await postService.createPost({
            authorId: req.user._id,
            content,
            imageBuffer: req.file?.buffer,
        });

        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

/** Selecciona paginación por cursor o compatibilidad legacy según la consulta. */
export const getPosts = async (req, res, next) => {
    try {
        const limit = req.query.limit || 10;
        const result = req.query.page
            ? await feedService.getPageFeed({
                  page: req.query.page,
                  limit,
                  currentUserId: req.user._id,
              })
            : await feedService.getCursorFeed({
                  cursor: req.query.cursor,
                  limit,
                  currentUserId: req.user._id,
              });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/** Recupera una publicación y añade metadatos personalizados de likes. */
export const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate(
            'author',
            'username avatar'
        );

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        const [postWithLikes] = await interactionService.addLikeMetadata([post], req.user._id);
        res.json(postWithLikes);
    } catch (error) {
        next(error);
    }
};

/** Actualiza el contenido de una publicación autorizada. */
export const updatePost = async (req, res, next) => {
    try {
        const post = await postService.updatePost({
            postId: req.params.id,
            userId: req.user._id,
            content: req.body.content,
        });

        res.json(post);
    } catch (error) {
        next(error);
    }
};

/** Elimina una publicación y sus recursos relacionados. */
export const deletePost = async (req, res, next) => {
    try {
        await postService.deletePost({
            postId: req.params.id,
            userId: req.user._id,
        });

        return res.json({ message: 'Post eliminado' });
    } catch (error) {
        return next(error);
    }
};

/** Establece el like del usuario autenticado de forma idempotente. */
export const likePost = async (req, res, next) => {
    try {
        const result = await interactionService.setLike({
            postId: req.params.id,
            userId: req.user._id,
            liked: true,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/** Elimina el like del usuario autenticado de forma idempotente. */
export const unlikePost = async (req, res, next) => {
    try {
        const result = await interactionService.setLike({
            postId: req.params.id,
            userId: req.user._id,
            liked: false,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
};
