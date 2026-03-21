'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { UserTable } from '@/components/features/users/UserTable';
import { ConfirmModal } from '@/components/ui/Modal/ConfirmModal';
import { Button } from '@/components/ui/Button/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Can } from '@/components/auth/Can';
import { useToast } from '@/hooks/useToast';
import { usersAPI } from '@/lib/api/users';
import type { UserListItem } from '@/types/user';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const locale = useLocale();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<'deactivate' | 'reactivate'>(
    'deactivate'
  );
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({
        page,
        limit,
        search: search || undefined,
      });

      setUsers(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      showToast({
        message: 'Erreur lors du chargement des utilisateurs',
        variant: 'error',
      });
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStatusChange = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      const nextStatus = statusAction === 'reactivate';
      await usersAPI.update(selectedUser.id, { isActive: nextStatus });

      showToast({
        message:
          statusAction === 'reactivate'
            ? 'Utilisateur réactivé avec succès'
            : 'Utilisateur désactivé avec succès',
        variant: 'success',
      });

      setIsStatusModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du statut de l'utilisateur";
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeactivateModal = (user: UserListItem) => {
    setSelectedUser(user);
    setStatusAction('deactivate');
    setIsStatusModalOpen(true);
  };

  const openReactivateModal = (user: UserListItem) => {
    setSelectedUser(user);
    setStatusAction('reactivate');
    setIsStatusModalOpen(true);
  };

  const handleFilter = (filters: Record<string, unknown>) => {
    const filterSearch =
      (filters.username as string) ||
      (filters.email as string) ||
      (filters.fullName as string) ||
      '';

    setSearch(filterSearch);
    setPage(1);
  };

  return (
    <ProtectedRoute permission="users:read">
      <div className="w-full px-1 sm:px-2 lg:px-2 py-2 sm:py-3">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Utilisateurs
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gérez les comptes utilisateurs de la plateforme
            </p>
          </div>

          <Can permission="users:create">
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              iconPosition="left"
              onClick={() => router.push(`/${locale}/settings/users/create`)}
              fullWidth
              className="sm:w-auto"
            >
              Créer un utilisateur
            </Button>
          </Can>
        </div>

        <UserTable
          users={users}
          loading={loading}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          onEdit={user =>
            router.push(`/${locale}/settings/users/${user.id}/edit`)
          }
          onManagePermissions={user =>
            router.push(`/${locale}/settings/users/${user.id}/permissions`)
          }
          onDeactivate={openDeactivateModal}
          onReactivate={openReactivateModal}
          onFilter={handleFilter}
        />

        <ConfirmModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleStatusChange}
          title={
            statusAction === 'reactivate'
              ? "Réactiver l'utilisateur"
              : "Désactiver l'utilisateur"
          }
          message={
            statusAction === 'reactivate'
              ? `Êtes-vous sûr de vouloir réactiver l'utilisateur "${selectedUser?.username}" ?`
              : `Êtes-vous sûr de vouloir désactiver l'utilisateur "${selectedUser?.username}" ? Il ne pourra plus accéder à l'application.`
          }
          confirmText={
            statusAction === 'reactivate' ? 'Réactiver' : 'Désactiver'
          }
          cancelText="Annuler"
          variant={statusAction === 'reactivate' ? 'info' : 'danger'}
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
