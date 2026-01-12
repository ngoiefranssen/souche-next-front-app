'use client';

import { useLocale } from 'next-intl';
import { Globe, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from '@/navigation';
import { Locale } from '../i18n/i18n.config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  // Validation que la locale est valide
  const isValidLocale = (locale: string): locale is Locale => {
    return ['en', 'fr'].includes(locale);
  };

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== locale && isValidLocale(newLocale)) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  const currentLang = languages.find(lang => lang.code === locale);

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium">
          {currentLang?.flag} {currentLang?.name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLocaleChange(lang.code)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
              locale === lang.code
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.name}</span>
            {locale === lang.code && (
              <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
