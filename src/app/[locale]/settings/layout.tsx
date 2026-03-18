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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <SettingsSidebar
        title={tSidebar('settings')}
        items={menuItems}
        getItemLabel={tBreadcrumb}
      />

      <main className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </main>
    </div>
  );
}
