import api from './api';

export const authService = {
  // Merchant-initiated admin registration (sends invitation)
  inviteAdmin: async (email) => {
    try {
      const response = await api.post('/auth/invite-admin', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send admin invitation';
    }
  },

  // Complete registration with token
  completeRegistration: async (token, userData) => {
    try {
      const response = await api.post(`/auth/register/${token}`, {
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Store token and user data
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      localStorage.setItem('access_token', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      throw error.response?.data?.message || 'Session expired. Please login again.';
    }
  },

  validateToken: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Session validation failed';
    }
  },

  logout: () => {
    // Clear all auth-related items
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/request-password-reset', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Password reset request failed';
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Password reset failed';
    }
  }
};