import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token && role) {
        try {
          // Fetch current user based on token
          const endpoint = '/auth/me';
          const res = await API.get(endpoint);
          if (res.data.success) {
            setUser({ ...res.data.data, role });
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ ...userData, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
