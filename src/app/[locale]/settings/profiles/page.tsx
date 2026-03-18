'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProfileTable } from '@/components/features/profiles/ProfileTable';
import { ProfileForm } from '@/components/features/profiles/ProfileForm';
import { FormModal } from '@/components/ui/Modal/FormModal';
import { ConfirmModal } from '@/components/ui/Modal/ConfirmModal';
import { Button } from '@/components/ui/Button/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Can } from '@/components/auth/Can';
import { useToast } from '@/hooks/useToast';
import { profilesAPI } from '@/lib/api/settings/profiles';
import type { Profile, ProfileInput } from '@/types/profile';
import { Plus } from 'lucide-react';

/**
 * Page de gestion des profils
 *
 * Permissions requises:
 * - profiles:read pour voir la page
 * - profiles:create pour créer
 * - profiles:update pour modifier
 * - profiles:delete pour supprimer
 */
export default function ProfilesPage() {
  const { showToast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
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
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profilesAPI.getAll({
        page,
        limit,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });

      setProfiles(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      showToast({
        message: 'Erreur lors du chargement des profils',
        variant: 'error',
      });
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, showToast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleCreate = async (data: ProfileInput) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      await profilesAPI.create(data);

      showToast({
        message: 'Profil créé avec succès',
        variant: 'success',
      });

      setIsCreateModalOpen(false);
      loadProfiles();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du profil';
      setFormError(errorMessage);
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: ProfileInput) => {
    if (!selectedProfile) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await profilesAPI.update(selectedProfile.id, data);

      showToast({
        message: 'Profil modifié avec succès',
        variant: 'success',
      });

      setIsEditModalOpen(false);
      setSelectedProfile(null);
      loadProfiles();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la modification du profil';
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
    if (!selectedProfile) return;

    try {
      setIsSubmitting(true);

      await profilesAPI.delete(selectedProfile.id);

      showToast({
        message: 'Profil supprimé avec succès',
        variant: 'success',
      });

      setIsDeleteModalOpen(false);
      setSelectedProfile(null);
      loadProfiles();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du profil';
      showToast({
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (profile: Profile) => {
    setSelectedProfile(profile);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (profile: Profile) => {
    setSelectedProfile(profile);
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
    <ProtectedRoute permission="profiles:read">
      <div className="mx-auto w-full max-w-4xl px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Profils
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gérez les profils utilisateurs
            </p>
          </div>

          <Can permission="profiles:create">
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
              Créer un profil
            </Button>
          </Can>
        </div>

        <ProfileTable
          profiles={profiles}
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
          title="Créer un profil"
        >
          <ProfileForm
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
            setSelectedProfile(null);
          }}
          title="Modifier le profil"
        >
          {selectedProfile && (
            <ProfileForm
              initialData={{
                label: selectedProfile.label,
                description: selectedProfile.description || '',
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedProfile(null);
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
            setSelectedProfile(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer le profil"
          message={`Êtes-vous sûr de vouloir supprimer le profil "${selectedProfile?.label}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
