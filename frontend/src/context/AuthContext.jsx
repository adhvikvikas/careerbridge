import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, googleLogin as apiGoogleLogin, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('careerbridge_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(localStorage.getItem('careerbridge_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.user);
          localStorage.setItem('careerbridge_user', JSON.stringify(res.user));
        } catch (error) {
          console.error('Failed to restore session', error);
          if (error.status === 401) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('careerbridge_token');
            localStorage.removeItem('careerbridge_user');
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('careerbridge_token', res.token);
      localStorage.setItem('careerbridge_user', JSON.stringify(res.user));
      return res.user;
    }
  };

  const loginWithGoogle = async (credential) => {
    const res = await apiGoogleLogin(credential);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('careerbridge_token', res.token);
      localStorage.setItem('careerbridge_user', JSON.stringify(res.user));
      return res.user;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('careerbridge_token');
    localStorage.removeItem('careerbridge_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, logout }}>
      {children}
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
