import axios from 'axios';

// Prefer explicit env; fall back to dev proxy only in DEV
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://api.rtc-bb.camai.kh/api');

console.log('🌐 API Base URL:', API_BASE_URL || '(not set)');
console.log('🌐 Environment:', import.meta.env.DEV ? 'Development (proxy)' : 'Production');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// 🔧 Only skip login (register requires auth on your server)
const SKIP_AUTH = ['/auth/login'];

api.interceptors.request.use(
  (config) => {
    const ls = localStorage.getItem('auth_token');
    const ss = sessionStorage.getItem('auth_token');
    const token = ls || ss;

    const url = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${url}`);

    if (token && !SKIP_AUTH.some((p) => (config.url || '').includes(p))) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added Bearer token to request');
    }

    // Let browser set boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// api.interceptors.response.use(
//   (response) => {
//     console.log(`✅ Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
//     return response;
//   },
//   (error) => {
//     console.error('❌ Response Error:', error.response?.status, error.response?.data);
//     return Promise.reject(error);
//   }
// );

export default api;
