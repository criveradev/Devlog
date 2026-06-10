import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { PostSkeleton } from "../components/Skeleton";
import { Link } from "react-router-dom";

function EmptyFeed() {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-4">✍️</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Aún no hay publicaciones
      </h3>
      <p className="text-gray-400 text-sm mb-5">
        Sé el primero en compartir algo con la comunidad
      </p>
      <Link
        to="/create"
        className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
      >
        Crear primer post
      </Link>
    </div>
  );
}

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      const res = await api.get(`/posts?page=${pageNum}&limit=10`);
      if (pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setTotalPages(res.data.totalPages);
      setError(null);
    } catch {
      setError("No se pudo cargar el feed. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchPosts(next);
  };

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  // Estado de error
  if (error && posts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-gray-600 font-medium mb-1">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchPosts(1);
          }}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Skeletons iniciales */}
      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* Posts */}
      {!loading && posts.length === 0 && <EmptyFeed />}

      {!loading &&
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}

      {/* Skeletons al cargar más */}
      {loadingMore && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* Botón cargar más */}
      {!loading && !loadingMore && page < totalPages && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-xl transition font-medium"
        >
          Cargar más posts
        </button>
      )}

      {/* Fin del feed */}
      {!loading && posts.length > 0 && page >= totalPages && (
        <p className="text-center text-gray-300 text-xs py-4">
          — Has llegado al final —
        </p>
      )}
    </div>
  );
}

export default FeedPage;
