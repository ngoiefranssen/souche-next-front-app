'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Briefcase,
  History,
  Home,
  KeyRound,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

interface SettingsMenuItem {
  key: string;
  icon: LucideIcon;
  href: string;
}

const menuItems: SettingsMenuItem[] = [
  {
    key: 'dashboard',
    icon: Home,
    href: '/settings',
  },
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
  const t = useTranslations('breadcrumb');
  const locale = useLocale();
  const pathname = usePathname();

  const pathWithoutLocale = useMemo(
    () => pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, ''),
    [pathname]
  );

  const withLocale = (href: string) => `/${locale}${href}`;

  const isRouteActive = (href: string) =>
    pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`);

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <aside className="w-full lg:w-[300px] rounded-xl border border-[#E4E9F0] bg-white p-3 shadow-sm">
        <div className="mb-3 rounded-lg border border-[#B7CCE2] bg-[#F3F8FD] px-3 py-2 text-center text-sm font-semibold text-[#35648E]">
          Paramètres
        </div>

        <nav className="space-y-[2px]">
          {menuItems.map(item => {
            const active = isRouteActive(item.href);

            return (
              <Link
                key={item.key}
                href={withLocale(item.href)}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[15px] font-medium transition-colors ${
                  active
                    ? 'bg-[#D4D9E1] text-[#1F3651]'
                    : 'text-[#334D6B] hover:bg-[#F2F5F9]'
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${
                    active
                      ? 'text-[#6D86A3]'
                      : 'text-[#9AAEC3] group-hover:text-[#7A94AF]'
                  }`}
                />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </main>
    </div>
  );
}
