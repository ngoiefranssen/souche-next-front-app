export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export const defaultLocale = 'fr';
export const localePrefix = 'always' as const;
