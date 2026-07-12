import axios from 'axios';

// Default to the same machine serving the UI. This works for localhost and
// when the Vite app is opened through a LAN address during a demo.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for easy error handling
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let code = 'NETWORK_ERROR';
    let message = 'Could not connect to the operations server.';
    let details = {};

    if (error.response) {
      const data = error.response.data;
      if (data && data.error) {
        code = typeof data.error === 'object' ? (data.error.code || 'UNKNOWN_ERROR') : 'REQUEST_ERROR';
        message = typeof data.error === 'string' ? data.error : (data.error.message || message);
        details = typeof data.error === 'object' ? (data.error.details || {}) : {};
      } else if (data && data.message) {
        message = data.message;
      }
    }

    return Promise.reject({
      code,
      message,
      details,
      status: error.response?.status,
    });
  }
);

export default client;
