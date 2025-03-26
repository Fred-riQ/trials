import axios from 'axios';
import { authService } from './services/authService';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('access_token');
    
    // If token exists, add to headers
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Add content type for specific requests
    if (['post', 'put', 'patch'].includes(config.method) ){
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      } else {
        // For file uploads, let browser set Content-Type
        delete config.headers['Content-Type'];
      }
    }
  
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const newAccessToken = await authService.refreshToken();
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        authService.logout();
        
        // Redirect to login with return URL
        const returnUrl = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Transform Flask error response to consistent format
      const transformedError = {
        message: error.response.data?.message || 
                error.response.data?.error ||
                'An unexpected error occurred',
        status: error.response.status,
        data: error.response.data
      };
      
      return Promise.reject(transformedError);
    } else if (error.request) {
      // Network error (no response received)
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true
      });
    } else {
      // Request setup error
      return Promise.reject({
        message: 'Request configuration error',
        config: error.config
      });
    }
  }
);

export default api;