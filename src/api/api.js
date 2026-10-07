import axios from 'axios';
import i18n from '../i18n';
import { localizeLogos } from '../utils/logos';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ── REQUEST : injecter le token ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);
  return config;
}, (error) => Promise.reject(error));

/* ── RESPONSE : gérer expiration token ── */
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Bloquer les réponses HTML inattendues
    if (response.headers['content-type']?.includes('text/html')) {
      return Promise.reject(new Error(i18n.t('common:api.invalidResponse')));
    }
    response.data = localizeLogos(response.data);
    return response;
  },
  async (error) => {
    const original = error.config;

    // Token expiré (403 "Invalid or expired token") → tenter un refresh
    const is403expired = error.response?.status === 403 &&
      (error.response?.data?.message?.includes('expired') ||
       error.response?.data?.message?.includes('Invalid'));

    if ((error.response?.status === 401 || is403expired) && !original._retry) {
      if (isRefreshing) {
        // Mettre en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry  = true;
      isRefreshing     = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newToken = res.data?.data?.accessToken || res.data?.accessToken;
        if (!newToken) throw new Error('No new token');

        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh impossible → déconnexion seulement sur 401 strict
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // On rejette l'erreur d'origine (réponse, statut, code métier accessibles) avec le message du serveur.
    error.message = error.response?.data?.message || i18n.t('common:api.serverError');
    return Promise.reject(error);
  }
);

export default api;