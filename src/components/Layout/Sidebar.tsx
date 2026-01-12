'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  ChevronRight,
  X,
  Zap,
  LogOut,
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Online Courses',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/courses',
    children: [
      {
        label: 'Dashboard',
        href: '/dashboard',
      },
    ],
  },
  {
    label: 'Membership',
    icon: <Users className="w-5 h-5" />,
    href: '/membership',
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    'Online Courses',
  ]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JULIA</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Panel Label */}
        <div className="px-4 py-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        {/* Menu Principal */}
        <nav className="px-2 flex-1 overflow-y-auto space-y-1">
          {menuItems.map(item => (
            <div key={item.label}>
              <button
                onClick={() => item.children && toggleExpand(item.label)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-colors
                  ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.children && (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      expandedItems.includes(item.label) ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sous-menu */}
              {item.children && expandedItems.includes(item.label) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`
                        block px-3 py-2 rounded-lg text-sm
                        transition-colors
                        ${
                          pathname === child.href
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Section du bas */}
        <div className="border-t border-gray-200">
          {/* User Menu Popover - Affiché au-dessus */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={toggleUserMenu} />

              {/* Menu Card */}
              <div className="absolute bottom-16 left-2 right-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                {/* Email en haut */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-700 font-medium">
                    delfranelegs373@gmail.com
                  </p>
                </div>

                {/* Menu Items */}
                <nav className="py-1">
                  <Link
                    href="/settings"
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-4 h-4" />
                      <span>Paramètres</span>
                    </div>
                    <span className="text-xs text-gray-400">⌘+Ctrl+,</span>
                  </Link>

                  <div className="h-px bg-gray-200 my-1"></div>

                  <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-4 h-4" />
                      <span>Mettre à niveau l&apos;abonnement</span>
                    </div>
                  </button>

                  <div className="h-px bg-gray-200 my-1"></div>

                  <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </div>
                  </button>
                </nav>
              </div>
            </>
          )}

          {/* User Profile Button - Toujours visible en bas */}
          <button
            onClick={toggleUserMenu}
            className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                J
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">Julia</span>
                <span className="text-xs text-gray-500">Forfait Free</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
