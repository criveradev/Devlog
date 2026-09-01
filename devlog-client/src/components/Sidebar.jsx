/** Navegación persistente para el layout privado de escritorio amplio. */
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Icon from "./Icon";

/** Presenta identidad y enlaces con estado activo derivado de la ruta actual. */
function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const links = [
    { to: "/", icon: "home", label: "Inicio" },
    { to: "/create", icon: "plus", label: "Publicar" },
    { to: `/profile/${user?._id}`, icon: "user", label: "Mi perfil" },
  ];

  return (
    <div className="sticky top-24 space-y-1">
      <div className="surface-card mb-5 flex items-center gap-3 p-3.5">
        {user?.avatar ? (
          <img
            src={user.avatar}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#e7f9b8]"
            alt={user.username}
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-[#111510] flex items-center justify-center text-[#caff4a] font-bold">
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

      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition w-full ${
            location.pathname === link.to
              ? "bg-[#111510] text-white font-semibold shadow-lg shadow-black/10"
              : "text-[#62695e] hover:bg-white/85 hover:text-[#111510]"
          }`}
        >
          <span className={`grid h-8 w-8 place-items-center rounded-xl ${location.pathname === link.to ? "bg-[#caff4a] text-[#111510]" : "bg-white text-[#8c9388] shadow-sm group-hover:text-[#668b12]"}`}>
            <Icon name={link.icon} size={17} />
          </span>
          {link.label}
        </Link>
      ))}

      <div className="mt-6 border-t border-[#dfe3db] px-3.5 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa196]">Tu espacio</p>
        <p className="mt-2 text-xs leading-5 text-[#767e72]">Comparte avances pequeños. La constancia hace visible el progreso.</p>
      </div>
    </div>
  );
}

export default Sidebar;
