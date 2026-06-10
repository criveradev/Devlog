import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import cloudinary from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

// Crear post
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        let image = '';
        let imagePublicId = '';

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'posts');
            image = result.secure_url;
            imagePublicId = result.public_id;
        }

        const post = await Post.create({
            author: req.user._id,
            content,
            image,
            imagePublicId,
        });

        const populated = await post.populate('author', 'username avatar');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener feed con paginación
export const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments();

        res.json({
            posts,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un post específico
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate(
            'author',
            'username avatar'
        );

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar post (solo el autor)
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        post.content = req.body.content || post.content;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar post (solo el autor)
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Borrar imagen de Cloudinary si existe
        if (post.imagePublicId) {
            await cloudinary.uploader.destroy(post.imagePublicId);
        }

        // Borrar comentarios asociados
        await Comment.deleteMany({ post: post._id });

        await post.deleteOne();
        res.json({ message: 'Post eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dar/quitar like (toggle)
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        const userId = req.user._id.toString();
        const alreadyLiked = post.likes.some((id) => id.toString() === userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: !alreadyLiked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};