'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EmploymentStatusTable } from '@/components/features/employment-status/EmploymentStatusTable';
import { EmploymentStatusForm } from '@/components/features/employment-status/EmploymentStatusForm';
import { FormModal } from '@/components/ui/Modal/FormModal';
import { ConfirmModal } from '@/components/ui/Modal/ConfirmModal';
import { Button } from '@/components/ui/Button/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Can } from '@/components/auth/Can';
import { useToast } from '@/hooks/useToast';
import { employmentStatusAPI } from '@/lib/api/settings/employment-status';
import type {
  EmploymentStatus,
  EmploymentStatusInput,
} from '@/types/employment-status';
import { Plus } from 'lucide-react';

/**
 * Page de gestion des statuts d'emploi
 *
 * Permissions requises:
 * - employment-status:read pour voir la page
 * - employment-status:create pour créer
 * - employment-status:update pour modifier
 * - employment-status:delete pour supprimer
 */
export default function EmploymentStatusPage() {
  const { showToast } = useToast();

  const [employmentStatuses, setEmploymentStatuses] = useState<
    EmploymentStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const loadEmploymentStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employmentStatusAPI.getAll({
        page,
        limit,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });

      setEmploymentStatuses(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      showToast({
        message: "Erreur lors du chargement des statuts d'emploi",
        variant: 'error',
      });
      console.error('Error loading employment statuses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, showToast]);

  useEffect(() => {
    loadEmploymentStatuses();
  }, [loadEmploymentStatuses]);

  const handleCreate = async (data: EmploymentStatusInput) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      await employmentStatusAPI.create(data);

      showToast({
        message: "Statut d'emploi créé avec succès",
        variant: 'success',
      });

      setIsCreateModalOpen(false);
      loadEmploymentStatuses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du statut';
      setFormError(errorMessage);
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: EmploymentStatusInput) => {
    if (!selectedStatus) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await employmentStatusAPI.update(selectedStatus.id, data);

      showToast({
        message: "Statut d'emploi modifié avec succès",
        variant: 'success',
      });

      setIsEditModalOpen(false);
      setSelectedStatus(null);
      loadEmploymentStatuses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la modification du statut';
      setFormError(errorMessage);
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStatus) return;

    try {
      setIsSubmitting(true);

      await employmentStatusAPI.delete(selectedStatus.id);

      showToast({
        message: "Statut d'emploi supprimé avec succès",
        variant: 'success',
      });

      setIsDeleteModalOpen(false);
      setSelectedStatus(null);
      loadEmploymentStatuses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du statut';
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (status: EmploymentStatus) => {
    setSelectedStatus(status);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (status: EmploymentStatus) => {
    setSelectedStatus(status);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
  };

  const handleFilter = (filters: Record<string, unknown>) => {
    setSearch((filters.label as string) || '');
    setPage(1);
  };

  return (
    <ProtectedRoute permission="employment-status:read">
      <div className="mx-auto w-full max-w-4xl px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Statuts d&apos;Emploi
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gérez les statuts d&apos;emploi (CDI, CDD, Stage, etc.)
            </p>
          </div>

          <Can permission="employment-status:create">
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
              Créer un statut
            </Button>
          </Can>
        </div>

        <EmploymentStatusTable
          employmentStatuses={employmentStatuses}
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
          title="Créer un statut d'emploi"
        >
          <EmploymentStatusForm
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
            setSelectedStatus(null);
          }}
          title="Modifier le statut d'emploi"
        >
          {selectedStatus && (
            <EmploymentStatusForm
              initialData={{
                label: selectedStatus.label,
                description: selectedStatus.description || '',
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedStatus(null);
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
            setSelectedStatus(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer le statut d'emploi"
          message={`Êtes-vous sûr de vouloir supprimer le statut "${selectedStatus?.label}" ? Cette action est irréversible et ne peut être effectuée que si aucun utilisateur n'utilise ce statut.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
