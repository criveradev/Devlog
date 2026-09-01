/** Modela likes como relaciones independientes y escalables. */
import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// La unicidad se garantiza en base de datos, no solo mediante lógica de aplicación.
likeSchema.index({ post: 1, user: 1 }, { unique: true });
// Optimiza consultas de actividad por usuario.
likeSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Like', likeSchema);
