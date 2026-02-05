'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, LoginCredentials, User } from '@/lib/api/auth/auth';
import { apiClient } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Vérifier si on a un token dans les cookies
      const cookies = document.cookie;
      const hasToken = cookies.includes('auth-token=');

      if (!hasToken) {
        setUser(null);
        localStorage.removeItem('user-data');
        setIsLoading(false);
        return;
      }

      // Essayer d'appeler le backend pour récupérer les données à jour
      try {
        const userData = await authAPI.getCurrentUser();

        // Mettre à jour localStorage avec les données fraîches
        localStorage.setItem('user-data', JSON.stringify(userData));
        setUser(userData);
      } catch (apiError) {
        console.error('[AuthContext] Failed to fetch user:', apiError);

        // En cas d'erreur, essayer de charger depuis localStorage comme fallback
        const storedUser = localStorage.getItem('user-data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.data.user);

      // Stocker le token et l'utilisateur dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', response.data.accessToken);
        localStorage.setItem('user-data', JSON.stringify(response.data.user));
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);

      // Supprimer le token des en-têtes
      apiClient.removeAuthToken();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
      }

      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
