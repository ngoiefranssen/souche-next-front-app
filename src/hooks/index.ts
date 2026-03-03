/**
 * Hooks utilitaires pour l'application
 *
 * Ce module exporte tous les hooks personnalisés utilisés dans l'application.
 */

export { useDebounce } from './useDebounce';
export {
  useToast,
  type ToastVariant,
  type ToastOptions,
  type UseToastReturn,
} from './useToast';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsWide,
  useScreenType,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  BREAKPOINTS,
} from './useMediaQuery';
export { usePermission, type UsePermissionReturn } from './usePermission';
