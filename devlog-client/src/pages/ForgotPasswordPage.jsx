/** Solicita recuperación con una respuesta indistinguible para emails inexistentes. */
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import Icon from "../components/Icon";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      toast.success(response.data.message);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-[#eaffb7] text-[#506f09]"><Icon name="refresh" size={20} /></div>
      <p className="eyebrow mb-2">Recuperación segura</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">Recuperar contraseña</h1>
      <p className="text-sm leading-6 text-slate-500 mt-2 mb-6">
        Te enviaremos un enlace si existe una cuenta asociada.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="recovery-email" className="block text-sm font-semibold text-slate-700">
          Email de tu cuenta
        </label>
        <input
          id="recovery-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          className="field text-sm"
        />
        <button
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
      <Link to="/login" className="block text-center text-sm font-semibold text-[#668b12] mt-5 hover:text-[#405a07]">
        <span className="inline-flex items-center gap-1.5"><Icon name="arrowLeft" size={15} /> Volver al inicio de sesión</span>
      </Link>
    </div>
  );
}

export default ForgotPasswordPage;
