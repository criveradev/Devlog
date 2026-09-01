/** Consume el token de recuperación recibido en la URL y establece un nuevo password. */
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import Icon from "../components/Icon";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Contraseña actualizada");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo actualizar la contraseña");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return <div className="surface-card p-8 text-center text-sm text-red-600">El enlace no contiene un token válido.</div>;
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <p className="eyebrow mb-2">Protege tu cuenta</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 mb-2">Nueva contraseña</h1>
      <p className="mb-6 text-sm leading-6 text-slate-500">Usa una contraseña que no hayas utilizado en otros servicios.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700">
          Nueva contraseña
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={12}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          className="field text-sm"
        />
        <button
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
      <Link to="/login" className="block text-center text-sm font-semibold text-[#668b12] mt-5">
        <span className="inline-flex items-center gap-1.5"><Icon name="arrowLeft" size={15} /> Volver al inicio de sesión</span>
      </Link>
    </div>
  );
}

export default ResetPasswordPage;
