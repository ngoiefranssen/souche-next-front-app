'use client';

import React from 'react';
import {
  Bell,
  Menu as MenuIcon,
  User,
  LogOut,
  Languages,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI } from '@/lib/api/auth/auth';
import { removeAuthToken } from '@/utils/auth/tokenManager';
import {
  AppMenu,
  AppMenuButton,
  AppMenuItem,
  AppMenuItems,
} from '@/components/ui/Headless';
import { Breadcrumb } from './Breadcrumb';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
}) => {
  const { user } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
    }

    window.location.href = `/${locale}/login`;
  };

  const handleLanguageChange = (langCode: string) => {
    const segments = pathname.split('/');
    segments[1] = langCode;
    const newPathname = segments.join('/');

    router.push(newPathname);
  };

  const activeLanguageLabel =
    languages.find(lang => lang.code === locale)?.name || 'Language';

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#356ca5]"
            aria-label="Ouvrir le menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center px-4 py-2">
            <Breadcrumb />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <AppMenu className="relative">
            <AppMenuButton className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#356ca5]">
              <Languages className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium hidden sm:block">
                {activeLanguageLabel}
              </span>
            </AppMenuButton>

            <AppMenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 focus:outline-none">
              {languages.map(lang => (
                <AppMenuItem key={lang.code}>
                  {({ focus }) => {
                    const isActiveLanguage = locale === lang.code;

                    return (
                      <button
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2 text-left flex items-center space-x-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5] focus:ring-inset ${
                          isActiveLanguage
                            ? 'bg-[#2B6A8E]/10 text-[#2B6A8E]'
                            : 'text-gray-700'
                        } ${focus && !isActiveLanguage ? 'bg-gray-50' : ''}`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    );
                  }}
                </AppMenuItem>
              ))}
            </AppMenuItems>
          </AppMenu>

          <button
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <AppMenu className="relative">
            <AppMenuButton className="flex items-center space-x-2 p-1 pr-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5]">
              <div className="w-8 h-8 bg-[#2B6A8E] rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'J'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </AppMenuButton>

            <AppMenuItems className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20 focus:outline-none">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#2B6A8E] rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.charAt(0) ||
                      user?.username?.charAt(0) ||
                      'J'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.profile?.label || 'No role'}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="py-1">
                <AppMenuItem>
                  {({ focus, close }) => (
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        router.push(`/${locale}/profile`);
                      }}
                      className={`w-full flex items-center px-4 py-2.5 text-sm text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5] focus:ring-inset ${
                        focus ? 'bg-gray-50' : ''
                      }`}
                    >
                      <User className="w-4 h-4 mr-3" />
                      <span>Mon profil</span>
                    </button>
                  )}
                </AppMenuItem>

                <div className="h-px bg-gray-200 my-1"></div>

                <AppMenuItem>
                  {({ focus, close }) => (
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        void handleLogout();
                      }}
                      className={`w-full flex items-center px-4 py-2.5 text-sm text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5] focus:ring-inset ${
                        focus ? 'bg-red-50' : ''
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Déconnexion</span>
                    </button>
                  )}
                </AppMenuItem>
              </nav>
            </AppMenuItems>
          </AppMenu>
        </div>
      </div>
    </header>
  );
};
