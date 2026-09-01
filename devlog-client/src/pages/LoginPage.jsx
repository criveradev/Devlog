/** Formulario de inicio de sesión que delega persistencia al store global. */
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      login(res.data);
      toast.success(`Bienvenido, ${res.data.username}`);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <div className="surface-card p-6 sm:p-8 lg:p-9">
          <p className="eyebrow mb-3">Bienvenido de vuelta</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 mb-1">
            Iniciar sesión
          </h2>
          <p className="text-slate-500 text-sm mb-7">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#668b12] hover:text-[#405a07]"
            >
              Regístrate gratis
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                {...register("email", { required: "El email es requerido" })}
                autoComplete="email"
                className="field text-sm"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
                Contraseña
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#668b12] hover:text-[#405a07]"
                >
                  ¿La olvidaste?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                {...register("password", {
                  required: "La contraseña es requerida",
                })}
                autoComplete="current-password"
                className="field text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#92998e]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sesión protegida y privada
          </p>
        </div>
    </div>
  );
}

export default LoginPage;
