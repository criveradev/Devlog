/** Define el contenido publicable y las referencias de su imagen remota. */
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000,
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Ambos índices conservan el mismo orden estable utilizado por los cursores del feed.
postSchema.index({ createdAt: -1, _id: -1 });
postSchema.index({ author: 1, createdAt: -1, _id: -1 });

export default mongoose.model('Post', postSchema);
