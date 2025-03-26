import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && userData) {
        // Set auth header and validate token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.get('/auth/validate');
        setUser(userData);
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
      const response = await api.post('/auth/login', { email, password });
      
      // Normalize user data
      const userData = {
        ...response.data.user,
        role: response.data.user.role.toLowerCase()
      };
      
      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setUser(userData);
      
      // Redirect based on role
      const redirectPath = {
        clerk: '/clerk/dashboard',
        admin: '/admin/dashboard',
        merchant: '/merchant/dashboard'
      }[userData.role] || '/';
      
      navigate(redirectPath);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = {
        ...response.data,
        role: response.data.role.toLowerCase()
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
      return null;
    }
  };

  // Check user permission
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole.toLowerCase();
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    hasPermission,
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