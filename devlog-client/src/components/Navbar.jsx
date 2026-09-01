/** Barra superior compartida con identidad, navegación y menú de sesión. */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import api from "../api/axios";
import Icon from "./Icon";

/** Representa avatares remotos con un fallback determinista por inicial. */
function Avatar({ src, name, size = "sm" }) {
  const s = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${s} rounded-xl object-cover ring-1 ring-white/15`}
    />
  ) : (
    <div
      className={`${s} rounded-xl bg-[#caff4a] flex items-center justify-center text-[#111510] font-bold`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

/** Adapta acciones y navegación según exista o no una sesión autenticada. */
function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      logout();
      toast.success("Sesión cerrada");
      navigate("/login");
    } catch {
      toast.error("No se pudo cerrar la sesión. Intenta nuevamente.");
    } finally {
      setMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-20 border-b border-white/8 bg-[#111510]/96 text-white backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white tracking-[-0.035em]">
          <img src="/favicon.svg?v=4" alt="" className="brand-mark" aria-hidden="true" />
          <span>Devlog<span className="text-[#caff4a]">.</span></span>
        </Link>

        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/"
                className={`text-sm px-3.5 py-2 rounded-xl transition ${
                  isActive("/")
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/50 hover:bg-white/6 hover:text-white"
                }`}
              >
                Feed
              </Link>
              <Link
                to="/create"
                className="btn-primary min-h-0! px-3.5! py-2!"
              >
                <Icon name="plus" size={17} /> Publicar
              </Link>
              <Link to={`/profile/${user._id}`} className="ml-1">
                <Avatar src={user.avatar} name={user.username} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Salir"
                className="grid h-9 w-9 place-items-center rounded-xl text-white/40 transition hover:bg-white/8 hover:text-white"
              >
                <Icon name="logout" size={17} />
              </button>
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <button
                type="button"
                aria-label="Abrir menú de usuario"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <Avatar src={user.avatar} name={user.username} />
              </button>
            </div>

            {menuOpen && (
              <div className="sm:hidden absolute top-[66px] right-4 surface-card py-2 w-56 z-30">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Feed
                </Link>
                <Link
                  to={`/profile/${user._id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Mi perfil
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden min-h-0! rounded-xl border border-transparent px-3! py-2! text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white min-[360px]:inline-flex"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="btn-primary min-h-0! px-3.5! py-2!"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
