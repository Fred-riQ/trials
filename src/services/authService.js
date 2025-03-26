import api from './api';

// Helper function for token storage with validation
const safeStoreToken = (tokenName, tokenValue) => {
  if (!tokenValue || typeof tokenValue !== 'string') {
    throw new Error(`Invalid ${tokenName} provided`);
  }
  localStorage.setItem(tokenName, tokenValue);
};

// Helper function for user data storage
const storeUserData = (user) => {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user data provided');
  }
  localStorage.setItem('user', JSON.stringify(user));
};

export const authService = {
  /**
   * Merchant-initiated admin registration (sends invitation)
   * @param {string} email - Admin email to invite
   * @returns {Promise<Object>} - Server response
   */
  inviteAdmin: async (email) => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please provide a valid email address');
      }
      
      const response = await api.post('/auth/invite-admin', { email });
      return {
        success: true,
        message: response.data.message || 'Invitation sent successfully',
        data: response.data
      };
    } catch (error) {
      console.error('Invite admin error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to send admin invitation'
      );
    }
  },

  /**
   * Complete registration with token
   * @param {string} token - Registration token
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  completeRegistration: async (token, userData) => {
    try {
      if (!token) throw new Error('Registration token is required');
      
      const requiredFields = ['name', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await api.post(`/auth/register/${token}`, userData);
      
      // Automatically store tokens if provided
      if (response.data.access_token) {
        safeStoreToken('access_token', response.data.access_token);
      }
      if (response.data.refresh_token) {
        safeStoreToken('refresh_token', response.data.refresh_token);
      }
      if (response.data.user) {
        storeUserData(response.data.user);
      }

      return {
        success: true,
        user: response.data.user,
        message: 'Registration completed successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
    }
  },

  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} - User data
   */
  login: async (credentials) => {
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }

      const response = await api.post('/auth/login', credentials);
      
      // Validate and store tokens
      safeStoreToken('access_token', response.data.access_token);
      safeStoreToken('refresh_token', response.data.refresh_token);
      storeUserData(response.data.user);

      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<string>} - New access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      
      if (!response.data.access_token) {
        throw new Error('No access token received');
      }

      safeStoreToken('access_token', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      authService.logout();
      throw new Error('Session expired. Please login again.');
    }
  },

  /**
   * Validate current token and get user data
   * @returns {Promise<Object>} - Current user data
   */
  validateToken: async () => {
    try {
      const response = await api.get('/auth/me');
      storeUserData(response.data.user); // Update user data
      return response.data.user;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Session validation failed'
      );
    }
  },

  /**
   * Logout - clears all auth data
   */
  logout: () => {
    try {
      ['access_token', 'refresh_token', 'user'].forEach(item => {
        localStorage.removeItem(item);
      });
      // Additional cleanup if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} - Server response
   */
  requestPasswordReset: async (email) => {
    try {
      if (!email) throw new Error('Email is required');
      
      const response = await api.post('/auth/request-password-reset', { email });
      return {
        success: true,
        message: response.data.message || 'Password reset instructions sent'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Password reset request failed'
      );
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Server response
   */
  resetPassword: async (token, newPassword) => {
    try {
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await api.post(`/auth/reset-password/${token}`, {
        new_password: newPassword
      });

      return {
        success: true,
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Password reset failed'
      );
    }
  },

  /**
   * Get current user data from storage
   * @returns {Object|null} - Current user data
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};