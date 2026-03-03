/**
 * Hook pour vérifier les permissions utilisateur
 *
 * Ce hook est un wrapper autour de usePermissions du PermissionContext,
 * fournissant une API simple pour vérifier les permissions dans les composants.
 *
 * @example
 * ```tsx
 * const { hasPermission, loading } = usePermission();
 *
 * if (loading) return <Skeleton />;
 *
 * if (hasPermission('users:create')) {
 *   return <CreateUserButton />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * const { hasAnyPermission } = usePermission();
 *
 * // Afficher si l'utilisateur a au moins une des permissions
 * if (hasAnyPermission(['users:read', 'users:create'])) {
 *   return <UsersSection />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * const { hasAllPermissions } = usePermission();
 *
 * // Afficher seulement si l'utilisateur a toutes les permissions
 * if (hasAllPermissions(['users:read', 'users:update'])) {
 *   return <EditUserForm />;
 * }
 * ```
 */

import { usePermissions } from '@/contexts/PermissionContext';

export interface UsePermissionReturn {
  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param permission - La permission à vérifier (format: "resource:action")
   * @returns true si l'utilisateur a la permission, false sinon
   */
  hasPermission: (permission: string) => boolean;

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   * @param permissions - Tableau de permissions à vérifier
   * @returns true si l'utilisateur a au moins une permission, false sinon
   */
  hasAnyPermission: (permissions: string[]) => boolean;

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   * @param permissions - Tableau de permissions à vérifier
   * @returns true si l'utilisateur a toutes les permissions, false sinon
   */
  hasAllPermissions: (permissions: string[]) => boolean;

  /**
   * Liste complète des permissions de l'utilisateur
   */
  permissions: string[];

  /**
   * Indique si les permissions sont en cours de chargement
   */
  loading: boolean;
}

/**
 * Hook pour accéder au système de permissions
 *
 * Ce hook doit être utilisé dans un composant enfant de PermissionProvider.
 * Il fournit des méthodes pour vérifier les permissions de l'utilisateur connecté.
 *
 * @throws {Error} Si utilisé en dehors d'un PermissionProvider
 * @returns {UsePermissionReturn} Objet contenant les méthodes et états de permission
 */
export const usePermission = (): UsePermissionReturn => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
    loading,
  } = usePermissions();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
    loading,
  };
};
