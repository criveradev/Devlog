/** Mantiene identidad y estado del bootstrap de sesión entre rutas y recargas. */
import { create } from 'zustand';

// Elimina residuos de versiones que persistían identidad o tokens en el navegador.
if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('auth-storage');
}

const useAuthStore = create((set) => ({
    user: null,
    sessionChecked: false,

    login: (userData) => set({ user: userData, sessionChecked: true }),

    logout: () => set({ user: null, sessionChecked: true }),

    restoreSession: (userData) => set({ user: userData, sessionChecked: true }),
    finishSessionCheck: () => set({ sessionChecked: true }),

    updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
    },
}));

export default useAuthStore;
