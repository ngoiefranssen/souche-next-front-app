'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Award,
  Clock,
  ThumbsUp,
  Settings,
  HelpCircle,
  Menu,
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    label: 'Utilisateurs',
    icon: <Users className="w-5 h-5" />,
    href: '/users',
  },
  {
    label: 'Récompenses',
    icon: <Award className="w-5 h-5" />,
    href: '/rewards',
  },
  {
    label: 'Historique',
    icon: <Clock className="w-5 h-5" />,
    href: '/history',
  },
  {
    label: 'Favoris',
    icon: <ThumbsUp className="w-5 h-5" />,
    href: '/favorites',
  },
  {
    label: 'Paramètres',
    icon: <Settings className="w-5 h-5" />,
    href: '/settings',
  },
  {
    label: 'Aide',
    icon: <HelpCircle className="w-5 h-5" />,
    href: '/help',
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
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
      >
        {/* Menu Button */}
        <div className="w-full flex flex-col items-center pt-4 pb-4">
          {/* Menu Hamburger */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-white/80 group-hover:text-white" />
          </button>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 w-full flex flex-col items-center py-1 space-y-0.5 overflow-hidden">
          {menuItems.map(item => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  w-full px-2 py-2 flex flex-col items-center justify-center gap-1
                  transition-all duration-200 group relative flex-shrink-0
                  ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                `}
                title={item.label}
              >
                <div
                  className={`
                  ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                `}
                >
                  {item.icon}
                </div>
                <span
                  className={`
                  text-[9px] font-medium text-center leading-tight
                  ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Paramètres en bas */}
        <div className="w-full flex flex-col items-center py-4 border-t border-white/10">
          <Link
            href="/settings"
            className="w-full px-2 py-2 flex flex-col items-center justify-center gap-1 text-white/70 hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-medium text-center leading-tight">
              Paramètres
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};
