'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import {
  Column,
  ActionButton,
  PaginationConfig,
} from '@/components/ui/DataTable/types';
import { Role } from '@/types/role';
import { Badge } from '@/components/ui/Badge/Badge';
import { Edit, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface RoleTableProps {
  /**
   * Liste des rôles à afficher
   */
  roles: Role[];

  /**
   * Indique si les données sont en cours de chargement
   */
  loading?: boolean;

  /**
   * Configuration de la pagination
   */
  pagination?: PaginationConfig;

  /**
   * Callback appelé lors du clic sur le bouton Modifier
   */
  onEdit?: (role: Role) => void;

  /**
   * Callback appelé lors du clic sur le bouton Supprimer
   */
  onDelete?: (role: Role) => void;

  /**
   * Callback appelé lors du tri
   */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;

  /**
   * Callback appelé lors du filtrage
   */
  onFilter?: (filters: Record<string, unknown>) => void;
}

/**
 * Table d'affichage des rôles
 *
 * Ce composant affiche la liste des rôles avec pagination, tri, recherche
 * et actions (modifier, supprimer) basées sur les permissions.
 *
 * @example
 * ```tsx
 * <RoleTable
 *   roles={roles}
 *   loading={isLoading}
 *   pagination={{
 *     page: 1,
 *     limit: 10,
 *     total: 50,
 *     onPageChange: (page) => setPage(page),
 *     onLimitChange: (limit) => setLimit(limit),
 *   }}
 *   onEdit={(role) => handleEdit(role)}
 *   onDelete={(role) => handleDelete(role)}
 * />
 * ```
 */
export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onSort,
  onFilter,
}) => {
  const { hasPermission } = usePermission();

  // Définition des colonnes
  const columns: Column<Role>[] = [
    {
      key: 'label',
      label: 'Libellé',
      sortable: true,
      filterable: true,
      render: value => (
        <span className="font-medium text-gray-900">{String(value)}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      filterable: false,
      render: value => (
        <span className="text-gray-600">
          {value ? (
            String(value)
          ) : (
            <span className="text-gray-400 italic">Aucune description</span>
          )}
        </span>
      ),
    },
    {
      key: '_count',
      label: 'Nombre de profils',
      sortable: false,
      filterable: false,
      align: 'center',
      render: (value, row) => {
        const count = row._count?.profiles ?? 0;
        return (
          <Badge variant={count > 0 ? 'success' : 'secondary'}>
            {count} {count > 1 ? 'profils' : 'profil'}
          </Badge>
        );
      },
    },
  ];

  // Définition des actions
  const actions: ActionButton<Role>[] = [];

  // Action Modifier (si permission roles:update)
  if (onEdit && hasPermission('roles:update')) {
    actions.push({
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'secondary',
    });
  }

  // Action Supprimer (si permission roles:delete)
  if (onDelete && hasPermission('roles:delete')) {
    actions.push({
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'danger',
      // Désactiver la suppression si le rôle est utilisé par des profils
      show: role => (role._count?.profiles ?? 0) === 0,
    });
  }

  return (
    <DataTable
      data={roles}
      columns={columns}
      loading={loading}
      pagination={pagination}
      actions={actions}
      onSort={onSort}
      onFilter={onFilter}
      emptyMessage="Aucun rôle trouvé"
      className="mt-4"
    />
  );
};
