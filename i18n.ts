import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './src/i18n/i18n.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Valider que la locale est supportée
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./src/locales/${locale}.json`)).default,
  };
});
