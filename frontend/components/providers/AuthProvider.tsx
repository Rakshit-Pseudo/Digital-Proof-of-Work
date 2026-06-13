'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import { getToken, getUser, setAuth, clearAuth } from '@/lib/auth';
import { getSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const setCookies = (token: string, role: string) => {
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  document.cookie = `userRole=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
};

const clearCookies = () => {
  document.cookie = 'token=; path=/; max-age=0';
  document.cookie = 'userRole=; path=/; max-age=0';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      clearAuth();
      clearCookies();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getUser();
    if (stored) setUser(stored);
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) getSocket();
    return () => disconnectSocket();
  }, [user]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setAuth(data.token, data.user);
    setCookies(data.token, data.user.role);
    setUser(data.user);
    return data.user;
  };

  const register = async (regData: { name: string; email: string; password: string; role?: string }) => {
    const { data } = await authApi.register(regData);
    setAuth(data.token, data.user);
    setCookies(data.token, data.user.role);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAuth();
    clearCookies();
    disconnectSocket();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
