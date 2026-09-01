/** Encapsula reglas de existencia, autorización y persistencia de comentarios. */
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { ApplicationError } from '../errors/ApplicationError.js';

const idsAreEqual = (left, right) => String(left) === String(right);

export const createCommentService = ({ commentModel, postModel }) => ({
    async createComment({ postId, authorId, content }) {
        const postExists = await postModel.exists({ _id: postId });
        if (!postExists) {
            throw new ApplicationError(404, 'Post no encontrado');
        }

        const comment = await commentModel.create({ post: postId, author: authorId, content });
        return comment.populate('author', 'username avatar');
    },

    async getCommentsByPost({ postId, page, limit }) {
        const postExists = await postModel.exists({ _id: postId });
        if (!postExists) {
            throw new ApplicationError(404, 'Post no encontrado');
        }

        const [comments, total] = await Promise.all([
            commentModel
                .find({ post: postId })
                .populate('author', 'username avatar')
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            commentModel.countDocuments({ post: postId }),
        ]);

        return {
            comments,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        };
    },

    async deleteComment({ commentId, userId }) {
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            throw new ApplicationError(404, 'Comentario no encontrado');
        }
        if (!idsAreEqual(comment.author, userId)) {
            throw new ApplicationError(403, 'No autorizado');
        }

        await comment.deleteOne();
    },
});

export const commentService = createCommentService({
    commentModel: Comment,
    postModel: Post,
});
