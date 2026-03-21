'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { RoleTable } from '@/components/features/roles/RoleTable';
import { RoleForm } from '@/components/features/roles/RoleForm';
import { FormModal } from '@/components/ui/Modal/FormModal';
import { ConfirmModal } from '@/components/ui/Modal/ConfirmModal';
import { Button } from '@/components/ui/Button/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Can } from '@/components/auth/Can';
import { useToast } from '@/hooks/useToast';
import { rolesAPI } from '@/lib/api/roles';
import type { Role, RoleInput } from '@/types/role';
import { Plus } from 'lucide-react';

/**
 * Page de gestion des rôles
 *
 * Cette page permet de:
 * - Lister tous les rôles avec pagination et tri
 * - Créer un nouveau rôle (modal)
 * - Modifier un rôle existant (modal)
 * - Supprimer un rôle (avec confirmation)
 *
 * Permissions requises:
 * - roles:read pour voir la page
 * - roles:create pour créer
 * - roles:update pour modifier
 * - roles:delete pour supprimer
 */
export default function RolesPage() {
  const router = useRouter();
  const locale = useLocale();
  const { showToast } = useToast();

  // État
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>('');

  // Charger les rôles
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
    } catch (error) {
      showToast({
        message: 'Erreur lors du chargement des rôles',
        variant: 'error',
      });
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, showToast]);

  // Charger les rôles au montage et lors des changements
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Créer un rôle
  const handleCreate = async (data: RoleInput) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      await rolesAPI.create(data);

      showToast({
        message: 'Rôle créé avec succès',
        variant: 'success',
      });

      setIsCreateModalOpen(false);
      loadRoles();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du rôle';
      setFormError(errorMessage);
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modifier un rôle
  const handleEdit = async (data: RoleInput) => {
    if (!selectedRole) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await rolesAPI.update(selectedRole.id, data);

      showToast({
        message: 'Rôle modifié avec succès',
        variant: 'success',
      });

      setIsEditModalOpen(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la modification du rôle';
      setFormError(errorMessage);
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un rôle
  const handleDelete = async () => {
    if (!selectedRole) return;

    try {
      setIsSubmitting(true);

      await rolesAPI.delete(selectedRole.id);

      showToast({
        message: 'Rôle supprimé avec succès',
        variant: 'success',
      });

      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du rôle';
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Ouvrir le modal de suppression
  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  // Ouvrir l'écran d'affectation des permissions
  const openPermissionsPage = (role: Role) => {
    router.push(`/${locale}/settings/roles/${role.id}/permissions`);
  };

  // Gestion du tri
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
  };

  // Gestion des filtres
  const handleFilter = (filters: Record<string, unknown>) => {
    setSearch((filters.label as string) || '');
    setPage(1); // Reset à la première page lors du filtrage
  };

  return (
    <ProtectedRoute permission="roles:read">
      <div className="w-full px-1 sm:px-2 lg:px-2 py-2 sm:py-3">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Rôles
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gérez les rôles et leurs permissions
            </p>
          </div>

          {/* Bouton Créer (si permission roles:create) */}
          <Can permission="roles:create">
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              iconPosition="left"
              onClick={() => {
                setFormError('');
                setIsCreateModalOpen(true);
              }}
              fullWidth
              className="sm:w-auto"
            >
              Créer un rôle
            </Button>
          </Can>
        </div>

        {/* Table des rôles */}
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
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onManagePermissions={openPermissionsPage}
          onSort={handleSort}
          onFilter={handleFilter}
        />

        {/* Modal de création */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Créer un rôle"
        >
          <RoleForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </FormModal>

        {/* Modal d'édition */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRole(null);
          }}
          title="Modifier le rôle"
        >
          {selectedRole && (
            <RoleForm
              initialData={{
                label: selectedRole.label,
                description: selectedRole.description || '',
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedRole(null);
              }}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}
        </FormModal>

        {/* Modal de confirmation de suppression */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer le rôle"
          message={`Êtes-vous sûr de vouloir supprimer le rôle "${selectedRole?.label}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
