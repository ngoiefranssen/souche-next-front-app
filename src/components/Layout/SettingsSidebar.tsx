'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { usePermission } from '@/hooks/usePermission';

export interface SettingsSidebarItem {
  key: string;
  icon?: LucideIcon;
  href: string;
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  children?: SettingsSidebarItem[];
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
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermission();

  const pathWithoutLocale = useMemo(
    () => pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, '') || '/',
    [pathname]
  );

  const withLocale = (href: string) => `/${locale}${href}`;

  const visibleItems = useMemo(() => {
    const canAccessItem = (item: SettingsSidebarItem): boolean => {
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }

      if (
        item.anyPermissions &&
        item.anyPermissions.length > 0 &&
        !hasAnyPermission(item.anyPermissions)
      ) {
        return false;
      }

      if (
        item.allPermissions &&
        item.allPermissions.length > 0 &&
        !hasAllPermissions(item.allPermissions)
      ) {
        return false;
      }

      return true;
    };

    const filterItemsByAccess = (
      source: SettingsSidebarItem[]
    ): SettingsSidebarItem[] =>
      source.reduce<SettingsSidebarItem[]>((result, item) => {
        if (!canAccessItem(item)) {
          return result;
        }

        const nextItem: SettingsSidebarItem = {
          ...item,
        };

        if (item.children && item.children.length > 0) {
          nextItem.children = filterItemsByAccess(item.children);
        }

        result.push(nextItem);
        return result;
      }, []);

    return filterItemsByAccess(items);
  }, [items, hasPermission, hasAnyPermission, hasAllPermissions]);

  const isRouteActive = (href: string) =>
    pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`);

  const isItemActive = (item: SettingsSidebarItem): boolean => {
    if (isRouteActive(item.href)) {
      return true;
    }

    if (!item.children || item.children.length === 0) {
      return false;
    }

    return item.children.some(child => isItemActive(child));
  };

  return (
    <aside
      className={[
        'w-full h-full rounded-xl border border-[#E4E9F0] bg-white p-3 shadow-sm',
        'lg:w-[300px] lg:self-stretch',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 rounded-lg border border-[#B7CCE2] bg-[#F3F8FD] px-3 py-2 text-center text-sm font-semibold text-[#35648E]">
        {title}
      </div>

      <nav className="space-y-[2px]">
        {loading ? (
          <div className="space-y-2 px-1 py-1" aria-hidden="true">
            <div className="h-9 animate-pulse rounded-md bg-gray-100" />
            <div className="h-9 animate-pulse rounded-md bg-gray-100" />
            <div className="h-9 animate-pulse rounded-md bg-gray-100" />
          </div>
        ) : (
          visibleItems.map(item => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <div key={item.key} className="space-y-[2px]">
                <Link
                  href={withLocale(item.href)}
                  className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[15px] font-medium transition-colors ${
                    active
                      ? 'bg-[#D4D9E1] text-[#1F3651]'
                      : 'text-[#334D6B] hover:bg-[#F2F5F9]'
                  }`}
                >
                  {Icon ? (
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active
                          ? 'text-[#6D86A3]'
                          : 'text-[#9AAEC3] group-hover:text-[#7A94AF]'
                      }`}
                    />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{getItemLabel(item.key)}</span>
                </Link>

                {item.children && item.children.length > 0 ? (
                  <div className="ml-6 space-y-[2px] border-l border-[#E4E9F0] pl-2">
                    {item.children.map(child => {
                      const childActive = isItemActive(child);

                      return (
                        <Link
                          key={child.key}
                          href={withLocale(child.href)}
                          className={`group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors ${
                            childActive
                              ? 'bg-[#E9EDF3] text-[#1F3651]'
                              : 'text-[#4D6380] hover:bg-[#F6F8FB]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              childActive
                                ? 'bg-[#5B7899]'
                                : 'bg-[#B6C5D6] group-hover:bg-[#8EA4BE]'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {getItemLabel(child.key)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
