import User from '../models/User.js';
import Post from '../models/Post.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

// Obtener perfil público
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username avatar')
            .populate('following', 'username avatar');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar');

        res.json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar perfil propio
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (req.body.username) user.username = req.body.username;
        if (req.body.bio !== undefined) user.bio = req.body.bio;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'avatars');
            user.avatar = result.secure_url;
        }

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seguir/dejar de seguir (toggle)
export const toggleFollow = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const alreadyFollowing = currentUser.following.some(
            (id) => id.toString() === req.params.id
        );

        if (alreadyFollowing) {
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== req.params.id
            );
            userToFollow.followers = userToFollow.followers.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            following: !alreadyFollowing,
            followersCount: userToFollow.followers.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};