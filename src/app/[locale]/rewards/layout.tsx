'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  BellRing,
  Briefcase,
  ChevronDown,
  Gauge,
  History,
  Home,
  KeyRound,
  List,
  MessageSquare,
  Send,
  Settings,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

interface RewardsMenuItem {
  key: string;
  icon: LucideIcon;
  href?: string;
  chevron?: 'down';
}

const menuItems: RewardsMenuItem[] = [
  {
    key: 'resellerOverview',
    icon: Home,
    href: '/rewards/reseller-overview',
  },
  {
    key: 'clientList',
    icon: List,
    href: '/rewards/client-list',
  },
  {
    key: 'resellerUsers',
    icon: Users,
  },
  {
    key: 'resellerRolesPermissions',
    icon: UserCog,
  },
  {
    key: 'clientRolesPermissions',
    icon: KeyRound,
  },
  {
    key: 'loginEmailSmsHistory',
    icon: History,
    chevron: 'down',
  },
  {
    key: 'clientPaymentReminders',
    icon: BellRing,
  },
  {
    key: 'dataForwarding',
    icon: Send,
  },
  {
    key: 'highAssetUsage',
    icon: Gauge,
    href: '/rewards/analytics',
  },
  {
    key: 'tools',
    icon: Wrench,
  },
  {
    key: 'gprsSms',
    icon: MessageSquare,
    href: '/rewards/gprs-sms',
    chevron: 'down',
  },
  {
    key: 'manageSubResellers',
    icon: Briefcase,
    href: '/rewards/control-room',
  },
  {
    key: 'resellerSettings',
    icon: Settings,
    href: '/rewards/reports',
  },
];

interface RewardsLayoutProps {
  children: React.ReactNode;
}

export default function RewardsLayout({ children }: RewardsLayoutProps) {
  const t = useTranslations('rewardsNav');
  const locale = useLocale();
  const pathname = usePathname();

  const pathWithoutLocale = useMemo(
    () => pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, ''),
    [pathname]
  );

  const isRouteActive = (href?: string) =>
    !!href &&
    (pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`));

  const withLocale = (href: string) => `/${locale}${href}`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <aside className="w-full lg:w-[310px] rounded-xl border border-[#E4E9F0] bg-white p-3 shadow-sm">
        <nav className="space-y-[2px]">
          {menuItems.map(item => {
            const active = isRouteActive(item.href);
            const itemClasses = `group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[15px] font-medium transition-colors ${
              active
                ? 'bg-[#D4D9E1] text-[#1F3651]'
                : 'text-[#334D6B] hover:bg-[#F2F5F9]'
            }`;
            const iconClasses = `h-4 w-4 shrink-0 ${
              active
                ? 'text-[#6D86A3]'
                : 'text-[#9AAEC3] group-hover:text-[#7A94AF]'
            }`;

            if (!item.href) {
              return (
                <button key={item.key} type="button" className={itemClasses}>
                  <item.icon className={iconClasses} />
                  <span className="truncate">
                    {t(`items.${item.key}.label`)}
                  </span>
                  {item.chevron === 'down' && (
                    <ChevronDown className="ml-auto h-4 w-4 text-[#4C6786]" />
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.key}
                href={withLocale(item.href)}
                className={itemClasses}
              >
                <item.icon className={iconClasses} />
                <span className="truncate">{t(`items.${item.key}.label`)}</span>
                {item.chevron === 'down' && (
                  <ChevronDown className="ml-auto h-4 w-4 text-[#4C6786]" />
                )}
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
