import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [user, setUser] = useState(null);
  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
      // attempt to fetch current user
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (d?.authenticated) setUser(d.user);
          else setUser(null);
        })
        .catch(() => setUser(null));
    } else {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }, [token]);

  async function login(username, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Return error message if available
        return { success: false, error: data?.error || 'Login failed' };
      }
      
      if (data?.token) {
        setToken(data.token);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check if the server is running.' };
    }
  }

  function logout() {
    setToken('');
  }

  async function authFetch(input, init = {}) {
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }

  const value = useMemo(() => ({ token, user, isAuthenticated, login, logout, authFetch }), [token, user, isAuthenticated]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
