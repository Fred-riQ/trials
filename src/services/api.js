import axios from 'axios';
import { authService } from './authService'; // Fixed import path

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Handle FormData requests
    if (['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']; // Let browser set boundary
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { accessToken } = await authService.refreshToken();
        localStorage.setItem('access_token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject({
          message: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED'
        });
      }
    }

    // Error transformation
    const errorResponse = {
      message: error.response?.data?.message || 
              error.response?.data?.error || 
              'An unexpected error occurred',
      status: error.response?.status,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      data: error.response?.data,
      originalError: error
    };

    // Network error handling
    if (error.code === 'ERR_NETWORK') {
      errorResponse.message = 'Network error. Please check your internet connection.';
      errorResponse.code = 'NETWORK_ERROR';
    }

    return Promise.reject(errorResponse);
  }
);

export default api;