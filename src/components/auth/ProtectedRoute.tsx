'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

interface ProtectedRouteProps {
  /**
   * Le contenu à afficher si l'utilisateur a la permission
   */
  children: React.ReactNode;

  /**
   * La permission requise pour accéder à cette route
   * Format: "resource:action" (e.g., "users:read")
   * Si non spécifié, seule l'authentification est vérifiée
   */
  permission?: string;

  /**
   * Contenu de secours à afficher si l'utilisateur n'a pas la permission
   * Si non spécifié, redirige vers /403
   */
  fallback?: React.ReactNode;

  /**
   * URL de redirection si l'utilisateur n'a pas la permission
   * Par défaut: "/403"
   */
  redirectTo?: string;
}

/**
 * Composant pour protéger les routes par permission
 *
 * Ce composant vérifie si l'utilisateur a la permission requise avant d'afficher le contenu.
 * Si l'utilisateur n'a pas la permission, il peut soit afficher un fallback, soit rediriger
 * vers une page d'erreur 403.
 *
 * @example
 * ```tsx
 * // Protéger une route avec une permission spécifique
 * <ProtectedRoute permission="users:read">
 *   <UsersPage />
 * </ProtectedRoute>
 * ```
 *
 * @example
 * ```tsx
 * // Protéger une route avec un fallback personnalisé
 * <ProtectedRoute
 *   permission="users:create"
 *   fallback={<div>Vous n'avez pas accès à cette fonctionnalité</div>}
 * >
 *   <CreateUserForm />
 * </ProtectedRoute>
 * ```
 *
 * @example
 * ```tsx
 * // Protéger une route avec redirection personnalisée
 * <ProtectedRoute
 *   permission="admin:access"
 *   redirectTo="/dashboard"
 * >
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  fallback,
  redirectTo = '/403',
}) => {
  const router = useRouter();
  const { hasPermission, loading } = usePermission();

  // Afficher un skeleton pendant le chargement des permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl space-y-4 p-8">
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={400} />
        </div>
      </div>
    );
  }

  // Si aucune permission n'est spécifiée, afficher le contenu
  // (seule l'authentification est requise, gérée par le layout)
  if (!permission) {
    return <>{children}</>;
  }

  // Vérifier si l'utilisateur a la permission
  const hasAccess = hasPermission(permission);

  // Si l'utilisateur n'a pas la permission
  if (!hasAccess) {
    // Si un fallback est fourni, l'afficher
    if (fallback) {
      return <>{fallback}</>;
    }

    // Sinon, rediriger vers la page d'erreur 403
    router.push(redirectTo);

    // Afficher un skeleton pendant la redirection
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl space-y-4 p-8">
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={400} />
        </div>
      </div>
    );
  }

  // L'utilisateur a la permission, afficher le contenu
  return <>{children}</>;
};
