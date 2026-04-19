import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@shared/types/api';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return Promise.resolve().then(() => {
        setUser(null);
        setIsLoading(false);
      });
    }
    return authApi.me().then(res => {
      if (res.success) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }).catch(() => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const init = async () => { await refreshUser(); };
    init();
  }, [refreshUser]);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
