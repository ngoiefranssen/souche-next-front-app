import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/i18n.config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // D'abord, exécuter le middleware next-intl
  const intlResponse = intlMiddleware(request);

  if (intlResponse && intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // Routes publiques
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const publicPatterns = locales.flatMap(locale =>
    publicRoutes.map(route => `/${locale}${route}`)
  );

  const isPublicRoute = publicPatterns.some(pattern =>
    pathname.startsWith(pattern)
  );

  // Vérifier l'authentification - chercher soit auth-token soit sessionId
  const authToken = request.cookies.get('auth-token')?.value;
  const sessionId = request.cookies.get('sessionId')?.value;
  const token = authToken || sessionId;

  // Si l'utilisateur est déjà connecté et tente d'accéder à une route publique, rediriger vers le dashboard
  if (isPublicRoute && token) {
    const localeMatch = pathname.match(/^\/(en|fr|ar)/);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  if (isPublicRoute) {
    return intlResponse || NextResponse.next();
  }

  // Vérifier l'authentification pour les routes protégées
  if (!token) {
    const localeMatch = pathname.match(/^\/(en|fr|ar)/);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse || NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/(en|fr|ar)/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
