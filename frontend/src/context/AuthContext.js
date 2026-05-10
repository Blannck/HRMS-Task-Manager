import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      // Verify token is still valid by fetching user profile
      const userId = localStorage.getItem('user_id');
      if (userId) {
        api.get(`/profile/${userId}`)
          .then((response) => {
            setUser(response.data.user);
          })
          .catch(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            setToken(null);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', user.id);
    setToken(token);
    setUser(user);
    
    return user;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/register', { 
      name, 
      email, 
      password,
      role: 'employee'
    });
    
    return response.data;
  };

  const logout = async () => {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const response = await api.get(`/profile/${userId}`);
        setUser(response.data.user);
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
