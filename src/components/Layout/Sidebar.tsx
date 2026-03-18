'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlignJustify, LineChart, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarItem {
  key: 'dashboard';
  href: string;
  icon: LucideIcon;
}

const sidebarItems: SidebarItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: LineChart,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('sidebar');

  const pathWithoutLocale =
    pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, '') || '/';

  const withLocale = (href: string) => `/${locale}${href}`;
  const isActive = (href: string) =>
    pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[88px] shrink-0
          bg-gradient-to-b from-[#4C89C4] via-[#3B77B2] to-[#2E629A]
          shadow-[inset_-1px_0_0_rgba(255,255,255,0.14)]
          text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col items-center px-[8px] py-[10px]
        `}
      >
        <div className="flex w-full flex-col items-center gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] text-white/95 transition-colors hover:bg-white/10 lg:pointer-events-none"
            aria-label={t('menu')}
          >
            <AlignJustify className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>

        <nav className="mt-[8px] flex w-full flex-1 flex-col items-center gap-[2px] overflow-y-auto pb-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sidebarItems.map(item => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={withLocale(item.href)}
                className={`
                  group flex w-[70px] min-h-[44px] flex-col items-center justify-center gap-[4px] rounded-[10px] px-[4px] py-[5px] text-center
                  transition-colors duration-150
                  ${active ? 'bg-transparent' : 'hover:bg-white/10'}
                `}
                onClick={onClose}
              >
                <Icon
                  className={`h-[14px] w-[14px] ${active ? 'text-white' : 'text-white/90 group-hover:text-white'}`}
                  strokeWidth={2}
                />
                <span
                  className={`max-w-[64px] font-serif text-[10px] font-medium leading-[1.05] tracking-[0.01em] ${active ? 'text-white' : 'text-white/90 group-hover:text-white'}`}
                >
                  {t(`items.${item.key}`)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex w-full flex-col items-center pb-[2px] pt-[4px]">
          <Link
            href={withLocale('/settings/users')}
            className="group flex w-[70px] min-h-[44px] flex-col items-center justify-center gap-[4px] rounded-[10px] px-[4px] py-[5px] text-center transition-colors duration-150 hover:bg-white/10"
            onClick={onClose}
          >
            <Settings
              className="h-[14px] w-[14px] text-white/90 group-hover:text-white"
              strokeWidth={2}
            />
            <span className="max-w-[64px] font-serif text-[10px] font-medium leading-[1.05] tracking-[0.01em] text-white/90 group-hover:text-white">
              {t('settings')}
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};
