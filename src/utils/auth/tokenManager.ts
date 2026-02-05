/**
 * Utilitaires pour gérer les tokens d'authentification
 */

/**
 * Récupère le token d'authentification depuis les cookies
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];

  return token || null;
};

/**
 * Stocke le token d'authentification dans un cookie
 * IMPORTANT: Cookie NON-httpOnly pour que le middleware Next.js puisse le lire
 */
export const setAuthToken = (
  token: string,
  maxAge: number = 60 * 60 * 24 * 7
): void => {
  if (typeof window === 'undefined') return;

  // Cookie NON-httpOnly accessible par le middleware Next.js
  // SameSite=Lax permet l'envoi du cookie lors de la navigation
  // Secure=true seulement en HTTPS
  const isSecure = window.location.protocol === 'https:';
  const cookieString = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

  document.cookie = cookieString;
};

/**
 * Supprime le token d'authentification
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;

  document.cookie =
    'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
};
