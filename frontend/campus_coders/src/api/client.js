import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic JWT Token Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatic 401 Unauthorized Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cc-token');
      localStorage.removeItem('cc-user');
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register') && 
          window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
