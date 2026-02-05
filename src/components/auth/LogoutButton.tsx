'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authAPI } from '@/lib/api/auth/auth';
import { removeAuthToken } from '@/utils/auth/tokenManager';

interface LogoutButtonProps {
  variant?: 'default' | 'danger';
  showIcon?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function LogoutButton({
  variant = 'danger',
  showIcon = true,
  fullWidth = false,
  className = '',
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('common');

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Appeler directement l'API backend de logout
      await authAPI.logout();

      // Supprimer le token local et les données utilisateur
      removeAuthToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
      }

      // Rediriger vers la page de login
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Même en cas d'erreur, supprimer le token et rediriger vers login
      removeAuthToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
      }
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `
    flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
    transition-colors disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {showIcon && <LogOut className="w-4 h-4" />}
      <span>{isLoading ? t('loggingOut') : t('logout')}</span>
    </button>
  );
}
