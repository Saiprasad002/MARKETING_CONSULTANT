import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';
import { User, Company } from '@shared/types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  markOnboardingCompleted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
      setCompany(res.company);
    } catch (err) {
      console.error('Session restoration failed:', err);
      removeAuthToken();
      setUser(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (data: any) => {
    const res = await api.login(data);
    setAuthToken(res.token);
    setUser(res.user);
    setCompany(res.company);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setUser(res.user);
    setCompany(res.company);
  };

  const markOnboardingCompleted = async () => {
    await api.completeOnboarding();
    if (user) {
      setUser({ ...user, onboardingCompleted: true });
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setCompany(null);
    api.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user,
      company,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refreshUser: fetchCurrentUser,
      markOnboardingCompleted
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
