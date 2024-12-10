// src/AuthContext.jsx

import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos
const SESSION_LIMIT = 60 * 60 * 1000;    // 1 hora

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  const inactivityTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      logout();
      alert('Sessão expirada por inatividade.');
    }, INACTIVITY_LIMIT);
  };

  const startSessionTimer = () => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = setTimeout(() => {
      logout();
      alert('Sessão expirada.');
    }, SESSION_LIMIT);
  };

  const handleActivity = () => {
    if (auth.isAuthenticated) {
      resetInactivityTimer();
    }
  };

  const setupAxiosInterceptors = () => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (auth.token) {
          config.headers['Authorization'] = `Bearer ${auth.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          logout();
          alert('Sessão inválida. Por favor, faça login novamente.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    localStorage.setItem('logout', Date.now());
  };

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({
      isAuthenticated: true,
      token: token,
      user: user,
    });
    resetInactivityTimer();
    startSessionTimer();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      setAuth({
        isAuthenticated: true,
        token: token,
        user: user,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.isAuthenticated && auth.token) {
        try {
          const response = await axios.get(`/v1/api/me`, { // Usando proxy
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (response.data.user) {
            setAuth((prevAuth) => ({
              ...prevAuth,
              user: response.data.user,
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar informações do usuário:', error);
          logout();
        }
      }
    };

    fetchUser();
  }, [auth.isAuthenticated, auth.token]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      resetInactivityTimer();
      startSessionTimer();
      const events = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach((event) => window.addEventListener(event, handleActivity));

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && auth.isAuthenticated) {
          resetInactivityTimer();
          startSessionTimer();
        } else {
          if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
          if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const handleStorageChange = (event) => {
        if (event.key === 'logout') {
          logout();
        }
      };
      window.addEventListener('storage', handleStorageChange);

      const ejectInterceptors = setupAxiosInterceptors();

      return () => {
        events.forEach((event) => window.removeEventListener(event, handleActivity));
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('storage', handleStorageChange);
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        ejectInterceptors();
      };
    }
  }, [auth.isAuthenticated, auth.token]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
