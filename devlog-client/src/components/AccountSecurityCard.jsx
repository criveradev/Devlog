/** Centraliza operaciones sensibles que solo deben aparecer en el perfil propio. */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import Icon from "./Icon";

/**
 * Coordina cambio de credenciales, verificación y eliminación de cuenta.
 * Los cambios de identidad limpian Zustand porque el backend revoca la cookie.
 */
function AccountSecurityCard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [newEmail, setNewEmail] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [submitting, setSubmitting] = useState(null);

  const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setSubmitting("password");
    try {
      await api.post("/auth/change-password", passwords);
      logout();
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      navigate("/login");
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo cambiar la contraseña"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleEmailChange = async (event) => {
    event.preventDefault();
    setSubmitting("email");
    try {
      await api.post("/auth/change-email/request", { email: newEmail });
      setNewEmail("");
      toast.success("Revisa el nuevo correo para confirmar el cambio.");
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo solicitar el cambio de email"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleEmailVerification = async () => {
    setSubmitting("verification");
    try {
      await api.post("/auth/verify-email/request");
      toast.success("Revisa tu correo para completar la verificación.");
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo enviar la verificación"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "ELIMINAR" || !deletePassword) return;
    setSubmitting("delete");
    try {
      await api.delete("/users/account", {
        data: { currentPassword: deletePassword },
      });
      logout();
      toast.success("Cuenta eliminada");
      navigate("/register");
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo eliminar la cuenta"));
      setSubmitting(null);
    }
  };

  return (
    <section className="surface-card p-5 sm:p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaffb7] text-[#506f09]"><Icon name="lock" size={19} /></div>
        <div>
        <p className="eyebrow mb-1">Configuración</p>
        <h2 className="font-semibold text-slate-900">Seguridad de la cuenta</h2>
        <p className="text-xs text-slate-500 mt-1">
          Los cambios de contraseña o email cierran todas las sesiones activas.
        </p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Cambiar contraseña</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="password"
            required
            maxLength={128}
            value={passwords.currentPassword}
            aria-label="Contraseña actual"
            onChange={(event) =>
              setPasswords((value) => ({ ...value, currentPassword: event.target.value }))
            }
            placeholder="Contraseña actual"
            autoComplete="current-password"
            className="field text-sm"
          />
          <input
            type="password"
            required
            minLength={12}
            maxLength={128}
            value={passwords.newPassword}
            aria-label="Nueva contraseña"
            onChange={(event) =>
              setPasswords((value) => ({ ...value, newPassword: event.target.value }))
            }
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            className="field text-sm"
          />
        </div>
        <button
          disabled={submitting !== null}
          className="btn-primary"
        >
          {submitting === "password" ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>

      <form onSubmit={handleEmailChange} className="space-y-3 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-semibold text-slate-700">Cambiar email</h3>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Email actual: {user?.email || "no disponible"}
          </span>
          {user && !user.emailVerified && (
            <button
              type="button"
              onClick={handleEmailVerification}
              disabled={submitting !== null}
              className="font-semibold text-[#668b12] hover:text-[#405a07] disabled:opacity-50"
            >
              {submitting === "verification" ? "Enviando..." : "Verificar email"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={newEmail}
            aria-label="Nuevo email"
            onChange={(event) => setNewEmail(event.target.value)}
            placeholder="Nuevo email"
            autoComplete="email"
            className="field flex-1 text-sm"
          />
          <button
            disabled={submitting !== null}
            className="btn-secondary"
          >
            {submitting === "email" ? "Enviando..." : "Enviar confirmación"}
          </button>
        </div>
      </form>

      <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-4">
        <div>
          <h3 className="text-sm font-semibold text-red-700">Zona de riesgo</h3>
          <p className="text-xs leading-5 text-slate-500 mt-1">
            Esta acción elimina permanentemente tu perfil y todo su contenido. Confirma tu contraseña y escribe ELIMINAR.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            placeholder="Contraseña actual"
            aria-label="Contraseña actual para eliminar la cuenta"
            autoComplete="current-password"
            maxLength={128}
            className="field border-red-200! bg-white! text-sm"
          />
          <input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder="ELIMINAR"
            aria-label="Confirmación para eliminar cuenta"
            className="field flex-1 border-red-200! bg-white! text-sm"
          />
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== "ELIMINAR" || !deletePassword || submitting !== null}
            className="btn-danger bg-red-600! text-white! disabled:opacity-40 sm:col-span-2"
          >
            {submitting === "delete" ? "Eliminando..." : <><Icon name="trash" size={17} /> Eliminar definitivamente</>}
          </button>
        </div>
      </div>
    </section>
  );
}

export default AccountSecurityCard;
