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
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await usersAPI.delete(selectedUser.id);

      showToast({
        message: 'Utilisateur supprimé avec succès',
        variant: 'success',
      });

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'utilisateur";
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
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
          onDelete={openDeleteModal}
          onFilter={handleFilter}
        />

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${selectedUser?.username}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
