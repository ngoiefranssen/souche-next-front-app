'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

export interface SettingsSidebarItem {
  key: string;
  icon: LucideIcon;
  href: string;
}

interface SettingsSidebarProps {
  title: string;
  items: SettingsSidebarItem[];
  getItemLabel: (key: string) => string;
  className?: string;
}

export default function SettingsSidebar({
  title,
  items,
  getItemLabel,
  className,
}: SettingsSidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();

  const pathWithoutLocale = useMemo(
    () => pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, '') || '/',
    [pathname]
  );

  const withLocale = (href: string) => `/${locale}${href}`;

  const isRouteActive = (href: string) =>
    pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`);

  return (
    <aside
      className={[
        'w-full rounded-xl border border-[#E4E9F0] bg-white p-3 shadow-sm',
        'lg:w-[300px] lg:self-start lg:sticky lg:top-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 rounded-lg border border-[#B7CCE2] bg-[#F3F8FD] px-3 py-2 text-center text-sm font-semibold text-[#35648E]">
        {title}
      </div>

      <nav className="space-y-[2px]">
        {items.map(item => {
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
              <span className="truncate">{getItemLabel(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
