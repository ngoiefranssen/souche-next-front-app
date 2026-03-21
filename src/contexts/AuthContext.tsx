'use client';

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
import { removeAuthToken, setAuthToken } from '@/utils/auth/tokenManager';
import React from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  // Check auth status only on mount
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleSessionTimeout = React.useCallback(async () => {
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

  const handleSessionWarning = React.useCallback(() => {
    console.log('[Auth] Session will expire soon');
    // You can show a toast notification here if desired
    // For now, just log it
  }, []);

  // Initialize token refresh and session timeout when user changes
  React.useEffect(() => {
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
        // Token/cookie invalide ou expiré: on nettoie l'état local
        removeAuthToken();
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
        localStorage.removeItem('user-permissions');
        localStorage.removeItem('user-permissions-timestamp');
        setUser(null);
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
        if (response.data?.accessToken) {
          setAuthToken(response.data.accessToken);
          localStorage.setItem('auth-token', response.data.accessToken);
        }
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
    // Stop token refresh monitoring
    stopTokenRefresh();

    // Stop session timeout monitoring
    stopSessionTimeout();

    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('[Auth] Logout API failed, fallback to local logout', error);
    }

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
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
