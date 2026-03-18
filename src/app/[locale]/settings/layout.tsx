'use client';

import { useTranslations } from 'next-intl';
import {
  Briefcase,
  History,
  KeyRound,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import type { SettingsSidebarItem } from '@/components/Layout/SettingsSidebar';
import SettingsSidebar from '@/components/Layout/SettingsSidebar';

const menuItems: SettingsSidebarItem[] = [
  {
    key: 'users',
    icon: Users,
    href: '/settings/users',
  },
  {
    key: 'roles',
    icon: ShieldCheck,
    href: '/settings/roles',
  },
  {
    key: 'profiles',
    icon: UserCog,
    href: '/settings/profiles',
  },
  {
    key: 'employmentStatus',
    icon: Briefcase,
    href: '/settings/employment-status',
  },
  {
    key: 'permissions',
    icon: KeyRound,
    href: '/settings/permissions',
  },
  {
    key: 'audit',
    icon: History,
    href: '/settings/audit',
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const tBreadcrumb = useTranslations('breadcrumb');
  const tSidebar = useTranslations('sidebar');

  return (
    <div className="h-full">
      <SettingsSidebar
        title={tSidebar('settings')}
        items={menuItems}
        getItemLabel={tBreadcrumb}
        className="mb-3 lg:mb-0 lg:fixed lg:left-[96px] lg:top-[72px] lg:h-[calc(100vh-80px)] lg:overflow-y-auto lg:z-20"
      />

      <main className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-2 lg:ml-[312px] lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
