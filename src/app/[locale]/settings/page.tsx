'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { usePermission } from '@/hooks/usePermission';

const SETTINGS_MODULES = [
  { href: '/settings/users', permission: 'users:read' },
  { href: '/settings/roles', permission: 'roles:read' },
  { href: '/settings/profiles', permission: 'profiles:read' },
  {
    href: '/settings/employment-status',
    permission: 'employment-status:read',
  },
  { href: '/settings/permissions', permission: 'permissions:read' },
  { href: '/settings/audit', permission: 'audit:read' },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { hasPermission, loading } = usePermission();

  useEffect(() => {
    if (loading) return;

    const firstAllowedModule = SETTINGS_MODULES.find(module =>
      hasPermission(module.permission)
    );

    if (firstAllowedModule) {
      router.replace(`/${locale}${firstAllowedModule.href}`);
      return;
    }

    router.replace(`/${locale}/403`);
  }, [hasPermission, loading, locale, router]);

  return (
    <div className="flex min-h-[30vh] items-center justify-center px-4">
      <div className="text-sm text-gray-500">Chargement des modules...</div>
    </div>
  );
}
