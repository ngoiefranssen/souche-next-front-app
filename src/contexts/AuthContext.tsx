'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, LoginCredentials, User } from '@/lib/api/auth/auth';
import { apiClient } from '@/lib/api/client';
import {
  initializeTokenRefresh,
  stopTokenRefresh,
} from '@/utils/auth/tokenRefresh';
import {
  startSessionTimeout,
  stopMonitoring as stopSessionTimeout,
} from '@/utils/auth/sessionTimeout';
import { removeAuthToken } from '@/utils/auth/tokenManager';

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

  // Check auth status only on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleSessionTimeout = useCallback(async () => {
    console.log('[Auth] Session timeout - logging out user');

    // Stop monitoring
    stopTokenRefresh();
    stopSessionTimeout();

    // Clear auth data
    setUser(null);
    removeAuthToken();

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      localStorage.removeItem('user-permissions');
      localStorage.removeItem('user-permissions-timestamp');

      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));

      // Redirect to login with timeout reason
      router.push('/login?reason=session-timeout');
    }
  }, [router]);

  const handleSessionWarning = useCallback(() => {
    console.log('[Auth] Session will expire soon');
    // You can show a toast notification here if desired
    // For now, just log it
  }, []);

  // Initialize token refresh and session timeout when user changes
  useEffect(() => {
    if (user) {
      // Initialize token refresh monitoring
      initializeTokenRefresh();

      // Initialize session timeout monitoring
      startSessionTimeout({
        onTimeout: handleSessionTimeout,
        onWarning: handleSessionWarning,
      });
    }

    // Cleanup on unmount or when user changes
    return () => {
      stopTokenRefresh();
      stopSessionTimeout();
    };
  }, [user, handleSessionTimeout, handleSessionWarning]);

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
      } catch {
        // En cas d'erreur, essayer de charger depuis localStorage comme fallback
        const storedUser = localStorage.getItem('user-data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      }
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
        localStorage.setItem('auth-token', response.data?.accessToken);
        localStorage.setItem('user-data', JSON.stringify(response.data.user));
      }

      // Initialize automatic token refresh
      initializeTokenRefresh();

      // Start session timeout monitoring
      startSessionTimeout({
        onTimeout: handleSessionTimeout,
        onWarning: handleSessionWarning,
      });

      // Trigger permission refresh after successful login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:login'));
      }

      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Stop token refresh monitoring
      stopTokenRefresh();

      // Stop session timeout monitoring
      stopSessionTimeout();

      await authAPI.logout();
      setUser(null);

      // Supprimer le token des en-têtes
      apiClient.removeAuthToken();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
        // Clear permissions cache on logout
        localStorage.removeItem('user-permissions');
        localStorage.removeItem('user-permissions-timestamp');
      }

      // Trigger permission clear after logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      router.push('/login');
    } catch (error) {
      throw error;
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
