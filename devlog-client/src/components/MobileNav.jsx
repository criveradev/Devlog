/** Navegación primaria táctil que sustituye al sidebar en pantallas pequeñas. */
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Icon from "./Icon";

/** Calcula el estado activo desde la URL y expone contexto semántico al navegador. */
function MobileNav() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const links = [
    { to: "/", icon: "home", label: "Inicio" },
    { to: "/create", icon: "plus", label: "Publicar", primary: true },
    { to: `/profile/${user?._id}`, icon: "user", label: "Perfil" },
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-around rounded-[1.35rem] border border-white/10 bg-[#111510]/96 px-3 py-2 text-white shadow-2xl shadow-black/25 backdrop-blur-xl sm:hidden"
    >
      {links.map((link) => {
        const active = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${
              link.primary
                ? "bg-[#caff4a] text-[#111510]"
                : active
                  ? "text-[#caff4a]"
                  : "text-white/45 hover:text-white"
            }`}
          >
            <Icon name={link.icon} size={19} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNav;
