import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const tokenFromStorage = localStorage.getItem('accessToken');
      if (tokenFromStorage && tokenFromStorage.trim()) {
        setToken(tokenFromStorage);
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiresAt');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (mobile, password, orgSlug) => {
    const payload = { mobile, password };
    if (orgSlug && orgSlug.trim()) payload.orgSlug = orgSlug.trim();
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('accessToken', data.accessToken);
    const expiresInSec = typeof data.expiresIn === 'number' ? data.expiresIn : 8 * 3600;
    localStorage.setItem('tokenExpiresAt', String(Date.now() + expiresInSec * 1000));
    setToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (d) => {
    const payload = {
      orgName: (d.orgName || '').trim(),
      orgSlug: (d.orgSlug || '').trim().toLowerCase().replace(/\s+/g, '-'),
      name: (d.name || '').trim(),
      mobile: (d.mobile || '').trim(),
      password: d.password,
    };
    if (d.email) payload.email = d.email.trim();
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('accessToken', data.accessToken);
    const expiresInSec = typeof data.expiresIn === 'number' ? data.expiresIn : 8 * 3600;
    localStorage.setItem('tokenExpiresAt', String(Date.now() + expiresInSec * 1000));
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiresAt');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
