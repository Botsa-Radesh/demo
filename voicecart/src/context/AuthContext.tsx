'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'voicecart-auth-user';

function generateUserId(): string {
  return `u${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function ensureUserHasId(u: User): User {
  if (!u.id) return { ...u, id: generateUserId() };
  return u;
}

interface StoredUser {
  email: string;
  name: string;
  password: string;
  id: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(ensureUserHasId(parsed));
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Try API first
    try {
      const result = await authApi.login(email, password);
      if (result.user) {
        const u: User = { id: result.user.userId || result.user.id, email: result.user.email, name: result.user.name };
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return true;
      }
    } catch { /* API failed, fall through to localStorage */ }
    // Fall back to localStorage
    await new Promise(r => setTimeout(r, 600));
    const stored = localStorage.getItem('voicecart-users');
    const users: StoredUser[] = stored ? JSON.parse(stored) : [];
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const u: User = ensureUserHasId({ id: found.id, email: found.email, name: found.name });
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    // Try API first
    try {
      const result = await authApi.signup(email, password, name);
      if (result.user) {
        const u: User = { id: result.user.userId || result.user.id, email: result.user.email, name: result.user.name };
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return true;
      }
    } catch { /* API failed, fall through to localStorage */ }
    // Fall back to localStorage
    await new Promise(r => setTimeout(r, 600));
    const stored = localStorage.getItem('voicecart-users');
    const users: StoredUser[] = stored ? JSON.parse(stored) : [];
    if (users.find(u => u.email === email)) return false;
    const id = generateUserId();
    users.push({ email, name, password, id });
    localStorage.setItem('voicecart-users', JSON.stringify(users));
    const u: User = { id, email, name };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}><div style={{ fontSize: 14, color: '#888' }}>Loading...</div></div>;

  return (
    <AuthContext.Provider value={{ user, userId: user?.id ?? null, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, userId: null, isAuthenticated: false, login: async () => false, signup: async () => false, logout: () => {} };
  return ctx;
}
