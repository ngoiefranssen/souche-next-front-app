'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  Menu,
  User,
  LogOut,
  CreditCard,
  HelpCircle,
  Shield,
  Languages,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI } from '@/lib/api/auth/auth';
import { removeAuthToken } from '@/utils/auth/tokenManager';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
}) => {
  const { user } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat(
        locale === 'fr' ? 'fr-FR' : 'en-US',
        options
      );
      const formattedDate = formatter.format(now);

      // Capitaliser le premier caractère
      setCurrentDateTime(
        formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
      );
    };

    // Mettre à jour immédiatement
    updateDateTime();

    // Mettre à jour toutes les secondes
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, [locale]);

  const handleLogout = async () => {
    setShowUserMenu(false);

    try {
      // Appeler directement le backend pour le logout
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Supprimer le token local et les données utilisateur
    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
    }

    // Rediriger vers la page de login
    window.location.href = `/${locale}/login`;
  };

  const handleLanguageChange = (langCode: string) => {
    // Remplacer la locale dans le pathname
    const segments = pathname.split('/');
    segments[1] = langCode;
    const newPathname = segments.join('/');

    router.push(newPathname);
    setShowLangMenu(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Menu burger (mobile) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Date et Heure */}
          <div className="hidden md:flex items-center px-4 py-2 text-gray-600 text-sm font-medium">
            {currentDateTime}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Languages className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium hidden sm:block">
                {languages.find(lang => lang.code === locale)?.name ||
                  'Language'}
              </span>
            </button>

            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                        locale === lang.code
                          ? 'bg-[#2B6A8E]/10 text-[#2B6A8E]'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{lang?.flag}</span>
                      <span className="text-sm font-medium">{lang?.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-[#2B6A8E] rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'J'}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#2B6A8E] rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          'J'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.firstName || user?.username || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <nav className="py-1">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      <span>Mon profil</span>
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      <span>Paramètres du compte</span>
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      <span>Abonnement et facturation</span>
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 my-1"></div>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      <span>Confidentialité et sécurité</span>
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 mr-3" />
                      <span>Aide et support</span>
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Se déconnecter</span>
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
