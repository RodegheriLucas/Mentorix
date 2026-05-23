import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';

export interface AuthUser {
  id: number;
  email: string;
  nome: string;
  papel: 'ALUNO' | 'ALUNO_MENTOR' | 'PROFESSOR_MENTOR' | 'GESTOR';
  telefone?: string;
  tags_competencia?: string[];
  horas_complementares?: number;
  suspenso_ate?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isSuspended: () => boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, senha: string) => {
    const res = await api.post('/auth/login', { email, senha });
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isSuspended = () => {
    if (!user?.suspenso_ate) return false;
    return new Date(user.suspenso_ate) > new Date();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isSuspended }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
