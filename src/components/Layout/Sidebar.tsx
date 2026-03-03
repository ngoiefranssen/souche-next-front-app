'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Users,
  Shield,
  UserCircle,
  Briefcase,
  Key,
  FileText,
  Award,
  Settings,
  Menu,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface MenuItem {
  label: string;
  translationKey: string;
  icon: React.ReactNode;
  href: string;
  permission: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const { hasPermission, loading } = usePermission();

  // Define all menu items with their required permissions
  const allMenuItems: MenuItem[] = [
    {
      label: 'Users',
      translationKey: 'users',
      icon: <Users className="w-5 h-5" />,
      href: '/dashboard/users',
      permission: 'users:read',
    },
    {
      label: 'Roles',
      translationKey: 'roles',
      icon: <Shield className="w-5 h-5" />,
      href: '/dashboard/roles',
      permission: 'roles:read',
    },
    {
      label: 'Profiles',
      translationKey: 'profiles',
      icon: <UserCircle className="w-5 h-5" />,
      href: '/dashboard/profiles',
      permission: 'profiles:read',
    },
    {
      label: 'Employment Status',
      translationKey: 'employmentStatus',
      icon: <Briefcase className="w-5 h-5" />,
      href: '/dashboard/employment-status',
      permission: 'employment-status:read',
    },
    {
      label: 'Permissions',
      translationKey: 'permissions',
      icon: <Key className="w-5 h-5" />,
      href: '/dashboard/permissions',
      permission: 'permissions:read',
    },
    {
      label: 'Audit',
      translationKey: 'audit',
      icon: <FileText className="w-5 h-5" />,
      href: '/dashboard/audit',
      permission: 'audit:read',
    },
  ];

  // Add rewards section (always visible, no permission required)
  const rewardsItem: MenuItem = {
    label: 'Rewards',
    translationKey: 'rewards',
    icon: <Award className="w-5 h-5" />,
    href: '/rewards',
    permission: '', // No permission required
  };

  // Filter menu items based on user permissions
  const menuItems = [
    ...allMenuItems.filter(item => hasPermission(item.permission)),
    rewardsItem, // Always include rewards
  ];

  // Check if current path matches the menu item href
  const isActive = (href: string) => {
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/^\/(en|fr|ar)/, '');
    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
    );
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar minimaliste */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-24 bg-[#2B6A8E]
          transform transition-transform duration-300 ease-in-out
          flex flex-col items-center
          border-r border-[#255D7E]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label={t('menu')}
      >
        {/* Menu Button */}
        <div className="w-full flex flex-col items-center pt-4 pb-4">
          {/* Menu Hamburger */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group lg:hidden focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={t('menu')}
          >
            <Menu className="w-5 h-5 text-white/80 group-hover:text-white" />
          </button>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 w-full flex flex-col items-center py-1 space-y-0.5 overflow-y-auto">
          {loading ? (
            // Show skeleton loaders while permissions are loading
            <>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-full px-2 py-2 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
                  <div className="w-12 h-2 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </>
          ) : (
            // Show menu items based on permissions
            menuItems.map(item => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    w-full px-2 py-2 flex flex-col items-center justify-center gap-1
                    transition-all duration-200 group relative flex-shrink-0
                    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset
                    ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                  title={t(item.translationKey)}
                  aria-current={active ? 'page' : undefined}
                  onClick={onClose}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r" />
                  )}

                  <div
                    className={`
                    ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}
                  `}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`
                    text-[9px] font-medium text-center leading-tight
                    ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}
                  `}
                  >
                    {t(item.translationKey)}
                  </span>
                </Link>
              );
            })
          )}
        </nav>

        {/* Paramètres en bas */}
        <div className="w-full flex flex-col items-center py-4 border-t border-white/10">
          <Link
            href="/settings"
            className="w-full px-2 py-2 flex flex-col items-center justify-center gap-1 text-white/70 hover:bg-white/5 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset"
            title={t('settings')}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-medium text-center leading-tight">
              {t('settings')}
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};
