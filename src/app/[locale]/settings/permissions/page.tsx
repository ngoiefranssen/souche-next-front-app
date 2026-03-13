'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PermissionTable,
  PermissionForm,
} from '@/components/features/permissions';
import { FormModal } from '@/components/ui/Modal/FormModal';
import { ConfirmModal } from '@/components/ui/Modal/ConfirmModal';
import { Button } from '@/components/ui/Button/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Can } from '@/components/auth/Can';
import { useToast } from '@/hooks/useToast';
import { permissionsAPI } from '@/lib/api/permissions';
import type { Permission, PermissionInput } from '@/types/permission';
import { Plus } from 'lucide-react';

export default function PermissionsPage() {
  const { showToast } = useToast();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await permissionsAPI.getAll({
        page,
        limit,
        search: search || undefined,
        resource: resource || undefined,
        action: action || undefined,
      });

      setPermissions(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      showToast({
        message: 'Erreur lors du chargement des permissions',
        variant: 'error',
      });
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, resource, action, showToast]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleCreate = async (data: PermissionInput) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      await permissionsAPI.create(data);

      showToast({
        message: 'Permission créée avec succès',
        variant: 'success',
      });

      setIsCreateModalOpen(false);
      await loadPermissions();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création de la permission';
      setFormError(errorMessage);
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: PermissionInput) => {
    if (!selectedPermission) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await permissionsAPI.update(selectedPermission.id, data);

      showToast({
        message: 'Permission modifiée avec succès',
        variant: 'success',
      });

      setIsEditModalOpen(false);
      setSelectedPermission(null);
      await loadPermissions();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la modification de la permission';
      setFormError(errorMessage);
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;

    try {
      setIsSubmitting(true);

      await permissionsAPI.delete(selectedPermission.id);

      showToast({
        message: 'Permission supprimée avec succès',
        variant: 'success',
      });

      setIsDeleteModalOpen(false);
      setSelectedPermission(null);
      await loadPermissions();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression de la permission';
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleSort = () => {
    // Sorting is currently managed server-side by backend defaults.
  };

  const handleFilter = (filters: Record<string, unknown>) => {
    setSearch((filters.name as string) || '');
    setResource((filters.resource as string) || '');
    setAction((filters.action as string) || '');
    setPage(1);
  };

  return (
    <ProtectedRoute permission="permissions:read">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Permissions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gérez les permissions applicatives et leur cycle de vie
            </p>
          </div>

          <Can permission="permissions:create">
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
              Créer une permission
            </Button>
          </Can>
        </div>

        <PermissionTable
          permissions={permissions}
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
          onSort={handleSort}
          onFilter={handleFilter}
        />

        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Créer une permission"
        >
          <PermissionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </FormModal>

        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPermission(null);
          }}
          title="Modifier la permission"
        >
          {selectedPermission && (
            <PermissionForm
              initialData={{
                name: selectedPermission.name,
                resource: selectedPermission.resource,
                action: selectedPermission.action,
                description: selectedPermission.description || '',
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedPermission(null);
              }}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}
        </FormModal>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedPermission(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer la permission"
          message={`Êtes-vous sûr de vouloir supprimer la permission "${selectedPermission?.name}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
