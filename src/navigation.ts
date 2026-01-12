import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './i18n/i18n.config';

export const { Link, usePathname, useRouter } = createSharedPathnamesNavigation(
  {
    locales,
    localePrefix: 'always',
  }
);
