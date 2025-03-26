import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Secure storage functions
  const setSecureStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error('LocalStorage error:', err);
      throw new Error('Failed to store authentication data');
    }
  };

  const getSecureStorage = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error('LocalStorage error:', err);
      return null;
    }
  };

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      const token = getSecureStorage('token');
      const userData = JSON.parse(getSecureStorage('user') || 'null');
      
      if (token && userData) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Validate token with backend
        const response = await api.get('/auth/validate');
        
        // Update user data with fresh data from validation
        const updatedUser = {
          ...response.data.user,
          role: response.data.user.role.toLowerCase()
        };
        
        setSecureStorage('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Session validation failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(),
        password 
      });
      
      // Normalize and validate user data
      const userData = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        role: response.data.user.role.toLowerCase(),
        createdAt: response.data.user.createdAt
      };

      // Store auth data
      setSecureStorage('token', response.data.token);
      setSecureStorage('user', JSON.stringify(userData));
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setUser(userData);
      
      // Redirect based on role and previous location
      const redirectPath = location.state?.from?.pathname || 
        {
          clerk: '/clerk/dashboard',
          admin: '/admin/dashboard',
          merchant: '/merchant/dashboard'
        }[userData.role] || '/';
      
      navigate(redirectPath, { replace: true });
      
      return { success: true, user: userData };
    } catch (err) {
      let errorMessage = 'Login failed';
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
          err.response.status === 401 ? 'Invalid credentials' : 
          err.response.status === 403 ? 'Account not active' : 
          'Authentication error';
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        status: err.response?.status 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
      
      // Preserve current location for redirect back after login
      navigate('/login', { 
        state: { from: location },
        replace: true 
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [navigate, location]);

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = {
        ...response.data,
        role: response.data.role.toLowerCase()
      };
      setSecureStorage('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
      return { success: false, error: err.message };
    }
  };

  // Enhanced permission checking
  const hasPermission = (requiredRoles) => {
    if (!user) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.some(role => 
        user.role === role.toLowerCase()
      );
    }
    return user.role === requiredRoles.toLowerCase();
  };

  // Check if route requires authentication
  const isRouteProtected = (path) => {
    const protectedRoutes = [
      '/clerk',
      '/admin',
      '/merchant'
    ];
    return protectedRoutes.some(route => path.startsWith(route));
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    hasPermission,
    isRouteProtected,
    isAuthenticated: !!user,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};