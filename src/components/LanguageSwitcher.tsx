'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { localeNames } from '@/i18n/i18n.config';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Remplacer la locale dans le pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    router.push(newPathname);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => {
          const nextLocale = locale === 'fr' ? 'en' : 'fr';
          handleLocaleChange(nextLocale);
        }}
      >
        <Globe className="w-4 h-4" />
        <span>{localeNames[locale as keyof typeof localeNames]}</span>
      </button>
    </div>
  );
}
