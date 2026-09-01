/** Define comentarios asociados a una publicación y a su autor. */
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 500,
            trim: true,
        },
    },
    { timestamps: true }
);

// Soporta la lectura cronológica paginada de comentarios por publicación.
commentSchema.index({ post: 1, createdAt: -1, _id: -1 });

export default mongoose.model('Comment', commentSchema);
