import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        const comment = await Comment.create({
            post: post._id,
            author: req.user._id,
            content,
        });

        const populated = await comment.populate('author', 'username avatar');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comentario eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};