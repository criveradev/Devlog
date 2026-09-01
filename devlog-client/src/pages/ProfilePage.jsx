/** Perfil público con edición propia, relaciones sociales y posts paginados. */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import PostCard from "../components/PostCard";
import AccountSecurityCard from "../components/AccountSecurityCard";
import { ProfileSkeleton, PostSkeleton } from "../components/Skeleton";
import Icon from "../components/Icon";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Presenta una métrica social sin acoplarla al origen de sus datos. */
function StatBadge({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold tracking-tight text-slate-900">{value}</p>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

/**
 * Distingue perfil propio y ajeno para habilitar edición o follow. Mantiene las
 * actualizaciones sociales optimistas y sincroniza cambios propios con Zustand.
 */
function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ bio: "", username: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const isOwn = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setProfile(null);
      try {
        const res = await api.get(`/users/${id}?page=1&limit=10`);
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setPostsPage(res.data.page);
        setPostsTotalPages(res.data.totalPages);
        setTotalPosts(res.data.totalPosts);
        setFollowing(res.data.user.isFollowing);
        setEditData({
          bio: res.data.user.bio || "",
          username: res.data.user.username || "",
        });
      } catch {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser?._id]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleFollow = async () => {
    if (followLoading) return;
    const previousFollowing = following;
    const previousFollowersCount = profile.followersCount;

    // La actualización anticipada mantiene fluida la interacción y se revierte ante error.
    setFollowing((prev) => !prev);
    setProfile((prev) => ({
      ...prev,
      followersCount: Math.max(0, prev.followersCount + (following ? -1 : 1)),
    }));
    setFollowLoading(true);
    try {
      const res = following
        ? await api.delete(`/users/${id}/follow`)
        : await api.put(`/users/${id}/follow`);
      setFollowing(res.data.following);
      setProfile((prev) => ({
        ...prev,
        followersCount: res.data.followersCount,
      }));
    } catch {
      setFollowing(previousFollowing);
      setProfile((prev) => ({
        ...prev,
        followersCount: previousFollowersCount,
      }));
      toast.error("Error al seguir");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("La imagen debe pesar menos de 5MB");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("bio", editData.bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((prev) => ({ ...prev, ...res.data }));
      updateUser(res.data);
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setTotalPosts((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMorePosts = async () => {
    const nextPage = postsPage + 1;
    setLoadingMorePosts(true);
    try {
      const res = await api.get(`/users/${id}?page=${nextPage}&limit=10`);
      setPosts((prev) => [...prev, ...res.data.posts]);
      setPostsPage(res.data.page);
      setPostsTotalPages(res.data.totalPages);
      setTotalPosts(res.data.totalPosts);
    } catch {
      toast.error("Error al cargar más publicaciones");
    } finally {
      setLoadingMorePosts(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <ProfileSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Perfil no encontrado</p>
        <Link to="/" className="text-[#668b12] text-sm mt-2 block">
          Volver al feed
        </Link>
      </div>
    );
  }

  const avatarSrc = avatarPreview || profile.avatar;

  return (
    <div className="space-y-4 pb-8">
      <div className="surface-card overflow-hidden">
        <div className="relative h-32 overflow-hidden bg-[#111510]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgb(202_255_74_/_0.28),transparent_16rem)]" />
          <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full border-[32px] border-white/5" />
          <div className="absolute left-1/3 top-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="px-5 sm:px-6 pb-6">
          <div className="flex items-end justify-between -mt-11 mb-4">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.username}
                  className="w-22 h-22 rounded-2xl object-cover border-4 border-white shadow-xl shadow-slate-900/10"
                />
              ) : (
                <div className="w-22 h-22 rounded-2xl bg-[#111510] border-4 border-white shadow-xl flex items-center justify-center text-[#caff4a] text-3xl font-bold">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}

              {editMode && isOwn && (
                <label className="absolute inset-0 rounded-2xl cursor-pointer flex items-center justify-center bg-slate-950/55 text-white text-xs font-medium hover:bg-slate-950/70 transition">
                  <span>Cambiar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2">
              {isOwn ? (
                editMode ? (
                  <>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="btn-secondary min-h-0! py-2!"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn-primary min-h-0! py-2!"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary min-h-0! py-2!"
                  >
                    Editar perfil
                  </button>
                )
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    following
                      ? "border border-[#d9ddd5] bg-white text-[#4f574b] hover:border-[#aeb6aa]"
                      : "border border-[#111510] bg-[#caff4a] text-[#111510] shadow-lg shadow-black/10 hover:bg-[#d5ff73]"
                  } disabled:opacity-60`}
                >
                  {followLoading ? "..." : following ? <span className="inline-flex items-center gap-1.5">Siguiendo <Icon name="check" size={14} /></span> : "Seguir"}
                </button>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Usuario
                </label>
                <input
                  value={editData.username}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, username: e.target.value }))
                  }
                  className="field mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Biografía
                </label>
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, bio: e.target.value }))
                  }
                  rows={2}
                  placeholder="Cuéntanos algo sobre ti..."
                  className="field mt-1 resize-none text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                {profile.username}
              </h1>
              {isOwn && currentUser?.emailVerified && (
                <span title="Email verificado" className="grid h-5 w-5 place-items-center rounded-full bg-[#caff4a] text-[#111510]"><Icon name="check" size={12} /></span>
              )}
              </div>
              {profile.bio ? (
                <p className="text-slate-500 text-sm leading-6 mt-1">{profile.bio}</p>
              ) : (
                isOwn && (
                  <p className="text-slate-300 text-sm mt-1 italic">
                    Agrega una biografía...
                  </p>
                )
              )}
            </div>
          )}

          {!editMode && (
            <div className="flex gap-8 mt-5 pt-5 border-t border-slate-100">
              <StatBadge value={totalPosts} label="Posts" />
              <StatBadge
                value={profile.followersCount || 0}
                label="Seguidores"
              />
              <StatBadge
                value={profile.followingCount || 0}
                label="Siguiendo"
              />
            </div>
          )}
        </div>
      </div>

      {isOwn && <AccountSecurityCard />}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
        <h2 className="eyebrow">
          Publicaciones recientes
        </h2>
        <span className="text-xs text-slate-400">{totalPosts} en total</span>
        </div>

        {posts.length === 0 ? (
          <div className="surface-card py-14 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#eaffb7] text-[#506f09]"><Icon name="plus" size={21} /></div>
            <p className="text-slate-600 font-medium">Sin publicaciones</p>
            {isOwn && (
              <Link
                to="/create"
                className="mt-3 inline-block text-sm font-semibold text-[#668b12] hover:text-[#405a07]"
              >
                Crear tu primera publicación
              </Link>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
          ))
        )}

        {loadingMorePosts && <PostSkeleton />}

        {!loadingMorePosts && postsPage < postsTotalPages && (
          <button
            type="button"
            onClick={handleLoadMorePosts}
            className="btn-secondary w-full"
          >
            Cargar más publicaciones
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
