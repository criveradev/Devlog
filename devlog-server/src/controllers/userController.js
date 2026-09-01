/** Gestiona perfiles, edición del usuario autenticado y relaciones de seguimiento. */
import { interactionService } from '../services/interactionService.js';
import { profileService } from '../services/profileService.js';

/** Combina perfil, metadatos sociales y publicaciones paginadas. */
export const getUserProfile = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const result = await profileService.getProfile({
            profileUserId: req.params.id,
            currentUserId: req.user._id,
            page,
            limit,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/** Actualiza campos editables y reemplaza el avatar con compensación ante fallos. */
export const updateProfile = async (req, res, next) => {
    try {
        const profile = await profileService.updateProfile({
            userId: req.user._id,
            username: req.body.username,
            bio: req.body.bio,
            avatarBuffer: req.file?.buffer,
        });
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

/** Establece una relación de seguimiento de forma idempotente. */
export const followUser = async (req, res, next) => {
    try {
        const result = await interactionService.setFollow({
            followerId: req.user._id,
            followingId: req.params.id,
            following: true,
        });
        return res.json(result);
    } catch (error) {
        return next(error);
    }
};

/** Elimina una relación de seguimiento de forma idempotente. */
export const unfollowUser = async (req, res, next) => {
    try {
        const result = await interactionService.setFollow({
            followerId: req.user._id,
            followingId: req.params.id,
            following: false,
        });
        return res.json(result);
    } catch (error) {
        return next(error);
    }
};
