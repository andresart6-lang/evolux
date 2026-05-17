import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';
import api from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(() => authService.getCurrentUserId());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setProfile(user);
      setUserId(user.id);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success && result.user_id) {
        setUserId(result.user_id);
        const user = authService.getCurrentUser();
        setProfile(user);
        api.post('/login', { email, password }).catch(() => {});
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.register(email, password, name);
      if (result.success && result.user_id) {
        setUserId(result.user_id);
        const user = authService.getCurrentUser();
        setProfile(user);
        api.post('/register', { email, password, name }).catch(() => {});
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (google_id, email, name) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.googleLogin(google_id, email, name);
      if (result.success && result.user_id) {
        setUserId(result.user_id);
        const user = authService.getCurrentUser();
        setProfile(user);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUserId(null);
    setProfile(null);
    setError(null);
  };

  const updateUserProfile = async (data) => {
    const user = authService.getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    
    const updatedUser = { ...user, ...data };
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    setProfile(updatedUser);
    
    return { success: true };
  };

  const value = {
    userId,
    profile,
    loading,
    error,
    isAuthenticated: !!userId,
    login,
    register,
    googleLogin,
    logout,
    updateProfile: updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}