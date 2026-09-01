/** Cliente HTTP compartido con cookies habilitadas y manejo global de sesión vencida. */
import axios from 'axios';
import useAuthStore from '../store/authStore';

// Sin origen explícito se usa una URL relativa para permitir el proxy local y Docker.
const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

const api = axios.create({
    baseURL: `${apiOrigin}/api/v1`,
    withCredentials: true,
});

// Solo una respuesta autenticada inválida fuerza la limpieza del estado local.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();

            const isSessionCheck = error.config?.url === '/auth/me';
            const isPublicRoute = ['/login', '/register'].includes(window.location.pathname);
            if (!isSessionCheck && !isPublicRoute) {
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
