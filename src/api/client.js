import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL });

// Injecte le token JWT admin (stocké au login) sur chaque requête.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sur 401, on purge la session : un écouteur (AuthContext) gère la redirection.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Extrait un message d'erreur lisible depuis une erreur axios.
export function errorMessage(error, fallback = 'Une erreur est survenue') {
  return error?.response?.data?.error || error?.message || fallback;
}

export default api;
