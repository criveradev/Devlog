/** Modela relaciones dirigidas de seguimiento entre usuarios. */
import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
    {
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        following: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// La restricción compuesta impide follows duplicados incluso bajo concurrencia.
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Optimiza el conteo y listado de seguidores de un usuario.
followSchema.index({ following: 1, createdAt: -1 });

export default mongoose.model('Follow', followSchema);
