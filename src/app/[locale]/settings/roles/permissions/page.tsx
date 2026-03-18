'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleTable } from '@/components/features/roles/RoleTable';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/hooks/useToast';
import { rolesAPI } from '@/lib/api/roles';
import type { Role } from '@/types/role';

export default function RolePermissionsHubPage() {
  const router = useRouter();
  const locale = useLocale();
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rolesAPI.getAll({
        page,
        limit,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });

      setRoles(response.data);
      setTotal(response.pagination.total);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors du chargement des rôles';
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [limit, page, search, showToast, sortBy, sortOrder]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
  };

  const handleFilter = (filters: Record<string, unknown>) => {
    setSearch((filters.label as string) || '');
    setPage(1);
  };

  const openRolePermissions = (role: Role) => {
    router.push(`/${locale}/settings/roles/${role.id}/permissions`);
  };

  return (
    <ProtectedRoute permission="permissions:update">
      <div className="w-full px-1 sm:px-2 lg:px-2 py-2 sm:py-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Affectation des Permissions par Rôle
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Sélectionnez un rôle puis configurez ses permissions.
            </p>
          </div>

          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => router.push(`/${locale}/settings/permissions`)}
          >
            Retour aux permissions
          </Button>
        </div>

        <RoleTable
          roles={roles}
          loading={loading}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          onManagePermissions={openRolePermissions}
          onSort={handleSort}
          onFilter={handleFilter}
        />
      </div>
    </ProtectedRoute>
  );
}
