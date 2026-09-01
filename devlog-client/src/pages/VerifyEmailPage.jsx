/** Confirma email inicial o cambio de dirección según el propósito del enlace. */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import Icon from "../components/Icon";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isEmailChange = searchParams.get("type") === "change";
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [status, setStatus] = useState(
    token ? "Verificando email..." : "El enlace no contiene un token válido.",
  );

  useEffect(() => {
    if (!token) return;
    api
      .post(isEmailChange ? "/auth/change-email/confirm" : "/auth/verify-email", {
        token,
      })
      .then(() => {
        if (isEmailChange) logout();
        else updateUser({ emailVerified: true });
        setStatus(isEmailChange ? "Email actualizado correctamente." : "Email verificado correctamente.");
      })
      .catch((error) =>
        setStatus(error.response?.data?.message || "No se pudo verificar el email"),
      );
  }, [isEmailChange, logout, token, updateUser]);

  return (
    <div className="surface-card p-7 sm:p-9 text-center">
      <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#eaffb7] text-[#506f09]"><Icon name="check" size={22} /></div>
      <p className="eyebrow mb-2">Confirmación</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">Verificación de email</h1>
      <p className="text-sm leading-6 text-slate-500 my-6">{status}</p>
      <Link to="/login" className="btn-primary w-full">
        Continuar al login
      </Link>
    </div>
  );
}

export default VerifyEmailPage;
