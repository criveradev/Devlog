/** Guard de navegación que espera el bootstrap antes de proteger rutas privadas. */
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

/** Renderiza rutas hijas únicamente cuando existe un usuario restaurado. */
function ProtectedRoute() {
  const { user, sessionChecked } = useAuthStore();

  if (!sessionChecked) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
