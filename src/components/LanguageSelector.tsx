'use client';

import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export const LanguageSelector: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageChange = (langCode: string) => {
    // Remplacer la locale dans le pathname
    const segments = pathname.split('/');
    segments[1] = langCode;
    const newPathname = segments.join('/');

    router.push(newPathname);
    setShowLangMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowLangMenu(!showLangMenu)}
        className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
      >
        <Languages className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-gray-700 font-medium">
          {languages.find(lang => lang.code === locale)?.name || 'Language'}
        </span>
      </button>

      {showLangMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowLangMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                  locale === lang.code
                    ? 'bg-[#2B6A8E]/10 text-[#2B6A8E]'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang?.flag}</span>
                <span className="text-sm font-medium">{lang?.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
