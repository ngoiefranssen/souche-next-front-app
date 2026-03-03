'use client';

import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface CanProps {
  /**
   * La permission requise pour afficher le contenu
   * Format: "resource:action" (e.g., "users:create")
   */
  permission: string;

  /**
   * Le contenu à afficher si l'utilisateur a la permission
   */
  children: React.ReactNode;

  /**
   * Contenu de secours à afficher si l'utilisateur n'a pas la permission
   * Si non spécifié, rien n'est affiché
   */
  fallback?: React.ReactNode;
}

/**
 * Composant pour le rendu conditionnel basé sur les permissions
 *
 * Ce composant affiche son contenu uniquement si l'utilisateur a la permission requise.
 * Il est utile pour masquer des boutons, des sections ou des fonctionnalités
 * auxquelles l'utilisateur n'a pas accès.
 *
 * @example
 * ```tsx
 * // Afficher un bouton uniquement si l'utilisateur peut créer des utilisateurs
 * <Can permission="users:create">
 *   <button>Créer un utilisateur</button>
 * </Can>
 * ```
 *
 * @example
 * ```tsx
 * // Afficher un message alternatif si l'utilisateur n'a pas la permission
 * <Can
 *   permission="users:delete"
 *   fallback={<span className="text-gray-400">Suppression non autorisée</span>}
 * >
 *   <button className="text-red-600">Supprimer</button>
 * </Can>
 * ```
 *
 * @example
 * ```tsx
 * // Masquer une section entière
 * <Can permission="admin:access">
 *   <div className="admin-panel">
 *     <h2>Panneau d'administration</h2>
 *     <AdminSettings />
 *   </div>
 * </Can>
 * ```
 */
export const Can: React.FC<CanProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission, loading } = usePermission();

  // Pendant le chargement, ne rien afficher pour éviter un flash de contenu
  if (loading) {
    return null;
  }

  // Vérifier si l'utilisateur a la permission
  const hasAccess = hasPermission(permission);

  // Si l'utilisateur a la permission, afficher le contenu
  if (hasAccess) {
    return <>{children}</>;
  }

  // Sinon, afficher le fallback (ou null si non spécifié)
  return <>{fallback}</>;
};
