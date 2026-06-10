import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

function Avatar({ src, name, size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover border border-gray-100 shrink-0`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
      flex items-center justify-center text-white font-bold shrink-0`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function LikeButton({ liked, count, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg transition
        ${
          liked
            ? "text-red-500 bg-red-50 hover:bg-red-100"
            : "text-gray-500 hover:bg-gray-100"
        } disabled:opacity-60`}
    >
      <span
        className={`transition-transform ${loading ? "scale-125" : "scale-100"}`}
      >
        {liked ? "❤️" : "🤍"}
      </span>
      <span className="font-medium">{count}</span>
    </button>
  );
}

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
    <div className="flex gap-2 group">
      <Avatar
        src={comment.author?.avatar}
        name={comment.author?.username}
        size="sm"
      />
      <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700">
            {comment.author?.username}
          </p>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {deleting ? "..." : "Eliminar"}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOwner = user?._id === post.author?._id;

  const handleLike = async () => {
    if (likeLoading) return;
    // Optimistic update
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    setLikeLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch {
      // Revertir si falla
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
      const res = await api.get(`/comments/post/${post._id}`);
      setComments(res.data);
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
    const diff = Date.now() - new Date(date);
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
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-opacity ${deleting ? "opacity-50" : "opacity-100"}`}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link
          to={`/profile/${post.author?._id}`}
          className="flex items-center gap-2.5 group"
        >
          <Avatar src={post.author?.avatar} name={post.author?.username} />
          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {post.author?.username}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-gray-300 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Imagen con skeleton mientras carga */}
      {post.image && (
        <div className="relative bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          )}
          <img
            src={post.image}
            alt="Imagen del post"
            onLoad={() => setImageLoaded(true)}
            className={`w-full object-cover max-h-96 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      )}

      {/* Barra de acciones */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-t border-gray-100">
        <LikeButton
          liked={liked}
          count={likes}
          loading={likeLoading}
          onClick={handleLike}
        />
        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg transition
            ${
              showComments
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:bg-gray-100"
            }`}
        >
          <span>💬</span>
          <span className="font-medium">
            {loadingComments ? "..." : `${comments.length || ""} Comentar`}
          </span>
        </button>
      </div>

      {/* Sección comentarios */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Input nuevo comentario */}
          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <Avatar src={user?.avatar} name={user?.username} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                disabled={submittingComment}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {submittingComment ? "..." : "→"}
              </button>
            </div>
          </form>

          {/* Lista comentarios */}
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
              <p className="text-center text-gray-400 text-sm py-3">
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
          </div>
        </div>
      )}
    </article>
  );
}

export default PostCard;
