import axios from 'axios';

// Production: use VITE_API_URL (e.g. https://inventory-x6ck.onrender.com/api/v1)
// Development: use proxy /api/v1
const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenExpiresAt');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
