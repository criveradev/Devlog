/** Formulario de alta que inicia sesión inmediatamente tras crear la cuenta. */
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      login(res.data);
      toast.success("¡Cuenta creada con éxito!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrarse");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto surface-card p-6 sm:p-8 lg:p-9">
        <p className="eyebrow mb-3">Únete a la comunidad</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 mb-1">Crear cuenta</h1>
        <p className="text-slate-500 text-sm mb-7">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-[#668b12] hover:text-[#405a07]">
            Inicia sesión
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="register-username" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Usuario
            </label>
            <input
              id="register-username"
              {...register("username", {
                required: "El usuario es requerido",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
              })}
              autoComplete="username"
              className="field text-sm"
              placeholder="juandev"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: { value: 12, message: "Mínimo 12 caracteres" },
              })}
              autoComplete="new-password"
              className="field text-sm"
              placeholder="••••••"
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
            {isSubmitting ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>
    </div>
  );
}

export default RegisterPage;
