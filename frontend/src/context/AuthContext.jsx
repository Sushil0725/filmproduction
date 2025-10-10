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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.token) {
      setToken(data.token);
      return true;
    }
    return false;
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
