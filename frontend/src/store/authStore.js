import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,

            login: (userData, token) => {
                localStorage.setItem('token', token);
                set({ user: userData, token });
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },

            updateUser: (userData) => {
                set((state) => ({ user: { ...state.user, ...userData } }));
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);

export default useAuthStore;