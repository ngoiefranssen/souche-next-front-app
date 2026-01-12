import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';
import { locales } from '../i18n/i18n.config';

export function withAuthMiddleware(
  middleware: CustomMiddleware
): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse
  ) => {
    const { pathname } = request.nextUrl;

    // Routes publiques (avec préfixes de locale)
    const publicRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/api/auth/login',
      '/api/auth/register',
    ];

    // Construire les patterns avec locales
    const publicPatterns = locales.flatMap(locale =>
      publicRoutes.map(route => `/${locale}${route}`)
    );

    // Vérifier si la route est publique
    const isPublicRoute = publicPatterns.some(
      pattern => pathname.startsWith(pattern) || pathname === '/'
    );

    if (isPublicRoute) {
      return middleware(request, event, response);
    }

    // Vérifier le token dans les cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Extraire la locale actuelle du pathname
      const locale =
        locales.find(loc => pathname.startsWith(`/${loc}/`)) || 'fr';

      // Rediriger vers la page de login avec la bonne locale
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
      // Ici vous pouvez vérifier la validité du token JWT
      // Pour l'instant, on laisse passer si le token existe
      return middleware(request, event, response);
    } catch (error) {
      console.error('Auth middleware error:', error);
      const locale =
        locales.find(loc => pathname.startsWith(`/${loc}/`)) || 'fr';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  };
}
