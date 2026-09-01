/** Consulta publicaciones y enriquece cada resultado con metadatos de interacción. */
import Post from '../models/Post.js';
import { buildCursorFilter, encodePaginationCursor } from '../utils/paginationCursor.js';
import { interactionService } from './interactionService.js';

/** Factoría del feed que desacopla la consulta de posts del cálculo de likes. */
export const createFeedService = ({ postModel, interactions }) => ({
    async getCursorFeed({ cursor, limit, currentUserId }) {
        const posts = await postModel
            .find(buildCursorFilter(cursor))
            .populate('author', 'username avatar')
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1); // El elemento adicional determina hasMore sin contar toda la colección.
        const hasMore = posts.length > limit;
        const pagePosts = hasMore ? posts.slice(0, limit) : posts;
        const postsWithLikes = await interactions.addLikeMetadata(pagePosts, currentUserId);
        const lastPost = pagePosts.at(-1);

        return {
            posts: postsWithLikes,
            hasMore,
            nextCursor: hasMore && lastPost ? encodePaginationCursor(lastPost) : null,
        };
    },

    async getPageFeed({ page, limit, currentUserId }) {
        // Se conserva temporalmente para clientes anteriores que todavía envían page.
        const [posts, total] = await Promise.all([
            postModel
                .find()
                .populate('author', 'username avatar')
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            postModel.countDocuments(),
        ]);

        return {
            posts: await interactions.addLikeMetadata(posts, currentUserId),
            page,
            totalPages: Math.ceil(total / limit),
            total,
        };
    },
});

export const feedService = createFeedService({
    postModel: Post,
    interactions: interactionService,
});
