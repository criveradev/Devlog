/**
 * Define identidad, credenciales y perfil. Los campos sensibles quedan excluidos
 * por defecto y deben solicitarse explícitamente en flujos de autenticación.
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        tokenVersion: {
            type: Number,
            default: 0,
            select: false,
        },
        avatar: {
            type: String,
            default: '',
        },
        avatarPublicId: {
            type: String,
            default: '',
            select: false,
        },
        bio: {
            type: String,
            default: '',
            maxlength: 200,
        },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);
