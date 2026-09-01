/** Publicación interactiva con likes optimistas y comentarios cargados bajo demanda. */
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import Icon from "./Icon";

const PAGE_LOADED_AT = Date.now();

/** Avatar compacto con fallback por inicial para autores sin imagen. */
function Avatar({ src, name, size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-xl object-cover ring-1 ring-[#dfe3db] shrink-0`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-xl bg-[#111510]
      flex items-center justify-center text-[#caff4a] font-bold shrink-0`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

/** Botón controlado que expone visual y semánticamente el estado del like. */
function LikeButton({ liked, count, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? "Quitar me gusta" : "Dar me gusta"}
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition
        ${
          liked
            ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
            : "text-[#687064] hover:bg-[#f2f4ee] hover:text-[#111510]"
        } disabled:opacity-60`}
    >
      <Icon name="heart" size={18} filled={liked} className={`transition-transform ${loading ? "scale-125" : "scale-100"}`} />
      <span className="font-medium">{count}</span>
    </button>
  );
}

/** Comentario individual con eliminación condicional para su autor. */
function CommentItem({ comment, onDelete, currentUserId }) {
  const isOwn = comment.author?._id === currentUserId;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/comments/${comment._id}`);
      onDelete(comment._id);
    } catch {
      toast.error("Error al eliminar comentario");
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2.5 group">
      <Avatar
        src={comment.author?.avatar}
        name={comment.author?.username}
        size="sm"
      />
      <div className="flex-1 bg-[#f7f8f4] rounded-2xl px-3.5 py-2.5 border border-[#e8ebe4]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">
            {comment.author?.username}
          </p>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-slate-300 hover:text-red-500 transition sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
            >
              {deleting ? "..." : "Eliminar"}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

/**
 * Conserva localmente el estado interactivo de una publicación para evitar
 * recargar todo el feed después de cada like o comentario.
 */
function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(Boolean(post.likedByCurrentUser));
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOwner = user?._id === post.author?._id;

  const handleLike = async () => {
    if (likeLoading) return;
    // La UI responde antes que la red y revierte exactamente el mismo cambio si falla.
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    setLikeLoading(true);
    try {
      const res = liked
        ? await api.delete(`/posts/${post._id}/like`)
        : await api.put(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev + 1 : prev - 1));
      toast.error("Error al dar like");
    } finally {
      setLikeLoading(false);
    }
  };

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingComments(true);
    setShowComments(true);
    try {
      const res = await api.get(`/comments/post/${post._id}?page=1&limit=20`);
      setComments(res.data.comments);
      setCommentsPage(res.data.page);
      setCommentsTotalPages(res.data.totalPages);
      setCommentsTotal(res.data.total);
    } catch {
      toast.error("Error al cargar comentarios");
      setShowComments(false);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/comments/post/${post._id}`, {
        content: commentText,
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentsTotal((prev) => prev + 1);
      setCommentText("");
      toast.success("Comentario agregado");
    } catch {
      toast.error("Error al comentar");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (deletedId) => {
    setComments((prev) => prev.filter((c) => c._id !== deletedId));
    setCommentsTotal((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMoreComments = async () => {
    const nextPage = commentsPage + 1;
    setLoadingComments(true);
    try {
      const res = await api.get(
        `/comments/post/${post._id}?page=${nextPage}&limit=20`,
      );
      setComments((prev) => [...prev, ...res.data.comments]);
      setCommentsPage(res.data.page);
      setCommentsTotalPages(res.data.totalPages);
      setCommentsTotal(res.data.total);
    } catch {
      toast.error("Error al cargar más comentarios");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este post permanentemente?")) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post eliminado");
      onDelete?.(post._id);
    } catch {
      toast.error("Error al eliminar");
      setDeleting(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Math.max(0, PAGE_LOADED_AT - new Date(date).getTime());
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `hace ${mins}m`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return new Date(date).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <article
      className={`surface-card overflow-hidden transition duration-200 hover:border-[#c9cec4] hover:shadow-[0_20px_50px_rgb(17_21_16_/_0.07)] ${deleting ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <Link
          to={`/profile/${post.author?._id}`}
          className="flex items-center gap-2.5 group"
        >
          <Avatar src={post.author?.avatar} name={post.author?.username} />
          <div>
            <p className="text-sm font-bold text-[#20251e] group-hover:text-[#668b12] transition">
              {post.author?.username}
            </p>
            <p className="text-xs text-[#949b90]">{timeAgo(post.createdAt)} · Público</p>
          </div>
        </Link>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-slate-400 hover:text-red-600 transition px-2.5 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        )}
      </div>

      <div className="px-4 sm:px-5 pb-4">
        <p className="text-slate-700 text-[15px] leading-7 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {post.image && (
        <div className="relative mx-3 sm:mx-4 mb-2 overflow-hidden rounded-2xl bg-slate-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          )}
          <img
            src={post.image}
            alt="Imagen del post"
            onLoad={() => setImageLoaded(true)}
            className={`w-full object-cover max-h-[32rem] transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      )}

      <div className="mx-4 sm:mx-5 py-2.5 flex items-center gap-2 border-t border-[#edf0e9]">
        <LikeButton
          liked={liked}
          count={likes}
          loading={likeLoading}
          onClick={handleLike}
        />
        <button
          type="button"
          onClick={toggleComments}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition
            ${
              showComments
                ? "text-[#506f09] bg-[#f0ffd0]"
                : "text-[#687064] hover:bg-[#f2f4ee] hover:text-[#111510]"
            }`}
        >
          <Icon name="message" size={18} />
          <span className="font-medium">
            {loadingComments ? "..." : `${commentsTotal || ""} Comentar`}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="px-4 sm:px-5 pb-5 border-t border-[#edf0e9] bg-[#fafbf8]">
          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <Avatar src={user?.avatar} name={user?.username} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                aria-label="Nuevo comentario"
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                disabled={submittingComment}
                className="field flex-1 py-2! text-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="btn-primary min-h-0! w-10 p-0! shrink-0"
              >
                {submittingComment ? "..." : <Icon name="arrowUp" size={17} />}
              </button>
            </div>
          </form>

          <div className="mt-3 space-y-2.5">
            {loadingComments ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 bg-gray-100 rounded-xl p-2 space-y-1">
                      <div className="h-2.5 w-20 bg-gray-200 rounded" />
                      <div className="h-2.5 w-40 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">
                Sin comentarios aún. ¡Sé el primero!
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                  currentUserId={user?._id}
                />
              ))
            )}

            {!loadingComments && commentsPage < commentsTotalPages && (
              <button
                type="button"
                onClick={handleLoadMoreComments}
                className="w-full py-2 text-xs font-semibold text-[#668b12] hover:text-[#405a07]"
              >
                Cargar más comentarios
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default PostCard;
