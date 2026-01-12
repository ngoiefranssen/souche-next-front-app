import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, Locale } from './i18n.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`../lib/messages/${locale}.json`)).default;
    return {
      locale,
      messages,
      timeZone: 'UTC',
    };
  } catch {
    notFound();
  }
});
