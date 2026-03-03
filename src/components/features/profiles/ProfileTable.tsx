'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import {
  Column,
  ActionButton,
  PaginationConfig,
} from '@/components/ui/DataTable/types';
import { Profile } from '@/types/profile';
import { Badge } from '@/components/ui/Badge/Badge';
import { Edit, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface ProfileTableProps {
  profiles: Profile[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onEdit?: (profile: Profile) => void;
  onDelete?: (profile: Profile) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, unknown>) => void;
}

/**
 * Table d'affichage des profils
 *
 * Ce composant affiche la liste des profils avec pagination, tri, recherche
 * et actions (modifier, supprimer) basées sur les permissions.
 */
export const ProfileTable: React.FC<ProfileTableProps> = ({
  profiles,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onSort,
  onFilter,
}) => {
  const { hasPermission } = usePermission();

  const columns: Column<Profile>[] = [
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
      label: "Nombre d'utilisateurs",
      sortable: true,
      filterable: false,
      align: 'center',
      render: (value, row) => {
        const count = row._count?.users ?? 0;
        return (
          <Badge variant={count > 0 ? 'success' : 'secondary'}>
            {count} {count > 1 ? 'utilisateurs' : 'utilisateur'}
          </Badge>
        );
      },
    },
  ];

  const actions: ActionButton<Profile>[] = [];

  if (onEdit && hasPermission('profiles:update')) {
    actions.push({
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'secondary',
    });
  }

  if (onDelete && hasPermission('profiles:delete')) {
    actions.push({
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'danger',
      show: profile => (profile._count?.users ?? 0) === 0,
    });
  }

  return (
    <DataTable
      data={profiles}
      columns={columns}
      loading={loading}
      pagination={pagination}
      actions={actions}
      onSort={onSort}
      onFilter={onFilter}
      emptyMessage="Aucun profil trouvé"
      className="mt-4"
    />
  );
};
