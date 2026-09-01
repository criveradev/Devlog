/** Feed principal con paginación por cursor, reintento y carga progresiva. */
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { PostSkeleton } from "../components/Skeleton";
import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Icon from "../components/Icon";

/** Estado vacío reutilizable con una acción que permite iniciar la conversación. */
function EmptyFeed() {
  return (
    <div className="surface-card text-center py-16 px-5">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#eaffb7] text-[#506f09]"><Icon name="plus" size={24} /></div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        Aún no hay publicaciones
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        Sé el primero en compartir algo con la comunidad
      </p>
      <Link
        to="/create"
        className="btn-primary"
      >
        Crear primer post
      </Link>
    </div>
  );
}

/**
 * Agrega páginas usando el cursor opaco entregado por el backend y conserva
 * publicaciones ya renderizadas cuando falla una carga posterior.
 */
function FeedPage() {
  const user = useAuthStore((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (cursor = null) => {
    try {
      const cursorQuery = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const res = await api.get(`/posts?limit=10${cursorQuery}`);
      if (!cursor) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
      setError(null);
    } catch {
      setError("No se pudo cargar el feed. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    api
      .get("/posts?limit=10")
      .then((res) => {
        if (!active) return;
        setPosts(res.data.posts);
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
        setError(null);
      })
      .catch(() => {
        if (active) setError("No se pudo cargar el feed. Intenta de nuevo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchPosts(nextCursor);
  };

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  if (error && posts.length === 0) {
    return (
      <div className="surface-card text-center py-16 px-5">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-500"><Icon name="alert" size={21} /></div>
        <p className="text-slate-700 font-medium mb-1">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchPosts();
          }}
          className="btn-secondary mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="feed-welcome p-5 sm:p-7">
        <div className="relative z-10 flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#caff4a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#caff4a]" /> Tu comunidad
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.035em] text-white sm:text-[1.75rem]">
              Hola, {user?.username || "developer"}
            </h1>
            <p className="mt-1 text-sm leading-6 text-white/50">
              Descubre qué está construyendo la comunidad hoy.
            </p>
          </div>
          <Link to="/create" aria-label="Nueva publicación" className="btn-primary shrink-0">
            <Icon name="plus" size={17} />
            <span className="hidden sm:inline">Nueva publicación</span>
          </Link>
        </div>
        <Link
          to="/create"
          className="relative z-10 mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-3 text-sm text-white/45 transition hover:border-[#caff4a]/35 hover:bg-white/10 hover:text-white"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#caff4a] text-[#111510]"><Icon name="sparkles" size={19} /></span>
          ¿Qué estás construyendo o aprendiendo?
          <span className="ml-auto hidden rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/35 sm:block">Crear post</span>
        </Link>
      </header>
      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!loading && posts.length === 0 && <EmptyFeed />}

      {!loading &&
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}

      {loadingMore && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!loading && !loadingMore && hasMore && (
        <button
          onClick={handleLoadMore}
          className="btn-secondary w-full"
        >
          Cargar más posts
        </button>
      )}

      {!loading && posts.length > 0 && !hasMore && (
        <p className="text-center text-slate-400 text-xs py-5">
          Estás al día · vuelve pronto para descubrir más
        </p>
      )}
    </div>
  );
}

export default FeedPage;
