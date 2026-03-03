import { useEffect, useState } from 'react';

/**
 * Breakpoints standard pour le responsive design
 */
export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Hook pour détecter les media queries et gérer le responsive design
 * Utilise window.matchMedia pour écouter les changements de taille d'écran
 *
 * @param query - La media query à écouter (ex: "(min-width: 768px)")
 * @returns true si la media query correspond, false sinon
 *
 * @example
 * ```tsx
 * // Utilisation avec une query personnalisée
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 *
 * // Utilisation avec les breakpoints prédéfinis
 * const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
 * const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`);
 *
 * return (
 *   <div>
 *     {isMobile && <MobileMenu />}
 *     {isDesktop && <DesktopSidebar />}
 *   </div>
 * );
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Initialiser avec false pour éviter les problèmes de SSR
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Vérifier si window est disponible (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    // Créer le media query matcher
    const mediaQuery = window.matchMedia(query);

    // Mettre à jour l'état initial
    setMatches(mediaQuery.matches);

    // Fonction de callback pour les changements
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Écouter les changements
    // Utiliser addEventListener pour la compatibilité moderne
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange);
    }

    // Nettoyer l'écouteur
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback pour les anciens navigateurs
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook pour détecter si l'écran est mobile
 * @returns true si la largeur est inférieure au breakpoint tablet
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
}

/**
 * Hook pour détecter si l'écran est tablette
 * @returns true si la largeur est entre tablet et desktop
 */
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`
  );
}

/**
 * Hook pour détecter si l'écran est desktop
 * @returns true si la largeur est supérieure ou égale au breakpoint desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
}

/**
 * Hook pour détecter si l'écran est wide (grand écran)
 * @returns true si la largeur est supérieure ou égale au breakpoint wide
 */
export function useIsWide(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.wide}px)`);
}

/**
 * Hook pour obtenir le type d'écran actuel
 * @returns 'mobile' | 'tablet' | 'desktop' | 'wide'
 *
 * @example
 * ```tsx
 * const screenType = useScreenType();
 *
 * return (
 *   <div>
 *     {screenType === 'mobile' && <MobileLayout />}
 *     {screenType === 'tablet' && <TabletLayout />}
 *     {screenType === 'desktop' && <DesktopLayout />}
 *   </div>
 * );
 * ```
 */
export function useScreenType(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const isWide = useIsWide();
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();

  if (isWide) return 'wide';
  if (isDesktop) return 'desktop';
  if (isTablet) return 'tablet';
  return 'mobile';
}

/**
 * Hook pour détecter la préférence de mouvement réduit (accessibilité)
 * @returns true si l'utilisateur préfère un mouvement réduit
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 *
 * return (
 *   <div className={prefersReducedMotion ? 'no-animation' : 'with-animation'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook pour détecter la préférence de thème sombre
 * @returns true si l'utilisateur préfère le thème sombre
 *
 * @example
 * ```tsx
 * const prefersDarkMode = usePrefersDarkMode();
 *
 * return (
 *   <div className={prefersDarkMode ? 'dark' : 'light'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}
