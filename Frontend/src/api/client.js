import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
        code = data.error.code || 'UNKNOWN_ERROR';
        message = data.error.message || message;
        details = data.error.details || {};
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
