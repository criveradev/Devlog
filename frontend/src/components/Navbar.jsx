import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

function Avatar({ src, name, size = "sm" }) {
  const s = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${s} rounded-full object-cover border border-gray-200`}
    />
  ) : (
    <div
      className={`${s} rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <span className="inline-block bg-blue-600 text-white font-mono font-bold text-2xl px-4 py-3 rounded-xl mb-4">
          &gt;_
        </span>
        <Link to="/" className="font-bold text-lg text-blue-600 tracking-tight">
          Devlog
        </Link>

        {user ? (
          <>
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/"
                className={`text-sm px-3 py-1.5 rounded-lg transition ${
                  isActive("/")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Feed
              </Link>
              <Link
                to="/create"
                className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Publicar
              </Link>
              <Link to={`/profile/${user._id}`} className="ml-1">
                <Avatar src={user.avatar} name={user.username} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-700 transition ml-1"
              >
                Salir
              </button>
            </div>

            {/* Mobile nav */}
            <div className="sm:hidden flex items-center gap-2">
              <Link
                to="/create"
                className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                +
              </Link>
              <button onClick={() => setMenuOpen((v) => !v)}>
                <Avatar src={user.avatar} name={user.username} />
              </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
              <div className="sm:hidden absolute top-14 right-4 bg-white border border-gray-200 rounded-xl shadow-lg py-2 w-48 z-30">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Feed
                </Link>
                <Link
                  to={`/profile/${user._id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Mi perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="text-sm text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
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
