export const locales = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

export const defaultLocale = 'fr';
export const localePrefix = 'always' as const;
