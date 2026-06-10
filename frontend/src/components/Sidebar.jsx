import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const links = [
    { to: "/", icon: "🏠", label: "Feed" },
    { to: "/create", icon: "✏️", label: "Publicar" },
    { to: `/profile/${user?._id}`, icon: "👤", label: "Mi perfil" },
  ];

  return (
    <div className="sticky top-20 space-y-1">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-3 px-3 py-3 mb-2">
        {user?.avatar ? (
          <img
            src={user.avatar}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
            alt={user.username}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {user?.username}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-35">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Links de navegación */}
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition w-full ${
            location.pathname === link.to
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="text-base">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;
