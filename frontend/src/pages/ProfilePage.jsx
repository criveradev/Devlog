import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import PostCard from "../components/PostCard";
import { ProfileSkeleton, PostSkeleton } from "../components/Skeleton";

function StatBadge({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
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
        const res = await api.get(`/users/${id}`);
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setFollowing(
          res.data.user.followers?.some((f) => f._id === currentUser?._id),
        );
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
  }, [id]);

  const handleFollow = async () => {
    if (followLoading) return;
    // Optimistic update
    setFollowing((prev) => !prev);
    setProfile((prev) => ({
      ...prev,
      followers: following
        ? prev.followers.filter((f) => f._id !== currentUser._id)
        : [...(prev.followers || []), { _id: currentUser._id }],
    }));
    setFollowLoading(true);
    try {
      await api.post(`/users/${id}/follow`);
    } catch {
      // Revertir
      setFollowing((prev) => !prev);
      toast.error("Error al seguir");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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
        <p className="text-gray-400">Perfil no encontrado</p>
        <Link to="/" className="text-blue-600 text-sm mt-2 block">
          Volver al feed
        </Link>
      </div>
    );
  }

  const avatarSrc = avatarPreview || profile.avatar;

  return (
    <div className="space-y-4 pb-8">
      {/* Tarjeta de perfil */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Banner de color */}
        <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-700" />

        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.username}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-sm flex items-center justify-center text-white text-3xl font-bold">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}

              {/* Botón cambiar avatar en modo edición */}
              {editMode && isOwn && (
                <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/40 text-white text-xs font-medium hover:bg-black/50 transition">
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

            {/* Botones de acción */}
            <div className="flex gap-2">
              {isOwn ? (
                editMode ? (
                  <>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setAvatarPreview(null);
                      }}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
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
                      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-60`}
                >
                  {followLoading ? "..." : following ? "Siguiendo ✓" : "Seguir"}
                </button>
              )}
            </div>
          </div>

          {/* Info de usuario */}
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Usuario
                </label>
                <input
                  value={editData.username}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, username: e.target.value }))
                  }
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Biografía
                </label>
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, bio: e.target.value }))
                  }
                  rows={2}
                  placeholder="Cuéntanos algo sobre ti..."
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.username}
              </h1>
              {profile.bio ? (
                <p className="text-gray-500 text-sm mt-1">{profile.bio}</p>
              ) : (
                isOwn && (
                  <p className="text-gray-300 text-sm mt-1 italic">
                    Agrega una biografía...
                  </p>
                )
              )}
            </div>
          )}

          {/* Stats */}
          {!editMode && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
              <StatBadge value={posts.length} label="Posts" />
              <StatBadge
                value={profile.followers?.length || 0}
                label="Seguidores"
              />
              <StatBadge
                value={profile.following?.length || 0}
                label="Siguiendo"
              />
            </div>
          )}
        </div>
      </div>

      {/* Posts del usuario */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
          Publicaciones
        </h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-14 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 font-medium">Sin publicaciones</p>
            {isOwn && (
              <Link
                to="/create"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
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
      </div>
    </div>
  );
}

export default ProfilePage;
