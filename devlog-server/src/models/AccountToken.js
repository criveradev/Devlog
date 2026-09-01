/** Persiste tokens de un solo uso mediante hashes; nunca almacena el token original. */
import mongoose from 'mongoose';

const accountTokenSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['email_verification', 'email_change', 'password_reset'],
            required: true,
        },
        tokenHash: { type: String, required: true, unique: true },
        pendingEmail: { type: String, lowercase: true, trim: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// MongoDB elimina automáticamente tokens vencidos mediante el índice TTL.
accountTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Acelera la invalidación y reemplazo de tokens por usuario y propósito.
accountTokenSchema.index({ user: 1, type: 1 });

export default mongoose.model('AccountToken', accountTokenSchema);
