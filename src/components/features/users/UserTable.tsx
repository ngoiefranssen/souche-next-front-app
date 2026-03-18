'use client';

import React from 'react';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import {
  Column,
  ActionButton,
  PaginationConfig,
} from '@/components/ui/DataTable/types';
import { UserListItem } from '@/types/user';
import { Badge } from '@/components/ui/Badge/Badge';
import { Edit, KeyRound, Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface UserTableProps {
  users: UserListItem[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onEdit?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
  onManagePermissions?: (user: UserListItem) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, unknown>) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  pagination,
  onEdit,
  onDelete,
  onManagePermissions,
  onSort,
  onFilter,
}) => {
  const { hasPermission } = usePermission();

  const columns: Column<UserListItem>[] = [
    {
      key: 'username',
      label: "Nom d'utilisateur",
      sortable: true,
      filterable: true,
      render: value => (
        <span className="font-medium text-gray-900">{String(value)}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: value => <span className="text-gray-700">{String(value)}</span>,
    },
    {
      key: 'fullName',
      label: 'Nom complet',
      sortable: false,
      filterable: false,
      render: (_value, row) => (
        <span className="text-gray-700">{`${row.firstName} ${row.lastName}`}</span>
      ),
    },
    {
      key: 'profile',
      label: 'Profil',
      sortable: false,
      filterable: false,
      render: (_value, row) => (
        <Badge variant="secondary">
          {row.profile?.label || row.profileLabel || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'employmentStatus',
      label: "Statut d'emploi",
      sortable: false,
      filterable: false,
      render: (_value, row) => (
        <Badge variant="secondary">
          {row.employmentStatus?.label || row.employmentStatusLabel || 'N/A'}
        </Badge>
      ),
    },
  ];

  const actions: ActionButton<UserListItem>[] = [];

  if (onEdit && hasPermission('users:update')) {
    actions.push({
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'secondary',
    });
  }

  if (onManagePermissions && hasPermission('permissions:manage')) {
    actions.push({
      label: 'Permissions',
      icon: <KeyRound className="w-4 h-4" />,
      onClick: onManagePermissions,
      variant: 'secondary',
    });
  }

  if (onDelete && hasPermission('users:delete')) {
    actions.push({
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'danger',
    });
  }

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      pagination={pagination}
      actions={actions}
      onSort={onSort}
      onFilter={onFilter}
      emptyMessage="Aucun utilisateur trouvé"
      className="mt-2"
    />
  );
};
