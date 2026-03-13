'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import {
  Column,
  ActionButton,
  PaginationConfig,
} from '@/components/ui/DataTable/types';
import { Permission } from '@/types/permission';
import { Badge } from '@/components/ui/Badge/Badge';
import { Edit, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionTableProps {
  permissions: Permission[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onEdit?: (permission: Permission) => void;
  onDelete?: (permission: Permission) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, unknown>) => void;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onSort,
  onFilter,
}) => {
  const { hasPermission } = usePermission();

  const columns: Column<Permission>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      filterable: true,
      render: value => (
        <span className="font-medium text-gray-900">{String(value)}</span>
      ),
    },
    {
      key: 'resource',
      label: 'Ressource',
      sortable: true,
      filterable: true,
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      filterable: true,
      render: value => <Badge variant="secondary">{String(value)}</Badge>,
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
  ];

  const actions: ActionButton<Permission>[] = [];

  if (onEdit && hasPermission('permissions:update')) {
    actions.push({
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'secondary',
    });
  }

  if (onDelete && hasPermission('permissions:delete')) {
    actions.push({
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'danger',
      show: permission => !permission.isSystem,
    });
  }

  return (
    <DataTable
      data={permissions}
      columns={columns}
      loading={loading}
      pagination={pagination}
      actions={actions}
      onSort={onSort}
      onFilter={onFilter}
      emptyMessage="Aucune permission trouvée"
      className="mt-4"
    />
  );
};
