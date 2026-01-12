import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { CustomMiddleware } from './chain';
import { locales, defaultLocale, localePrefix } from '../i18n/i18n.config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: true,
});

export function withI18nMiddleware(
  middleware: CustomMiddleware
): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse
  ) => {
    // Exécuter le middleware next-intl
    const intlResponse = intlMiddleware(request);

    // Si next-intl a déjà créé une réponse (redirection), la retourner
    if (intlResponse && intlResponse !== NextResponse.next()) {
      return intlResponse;
    }

    // Sinon, continuer avec le middleware suivant
    return middleware(request, event, response);
  };
}
