// ==========================================
// AUTHENTICATION CONTEXT
// ==========================================
// Author: Samson Fabiyi
// Description: Global auth state management
// ==========================================

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getAccessToken();
    
    if (currentUser && token) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    
    if (response.success) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    
    if (response.success) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
    return null;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

export default AuthContext;