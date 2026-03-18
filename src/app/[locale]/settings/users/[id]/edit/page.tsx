'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/features/users/UserForm';
import { Button } from '@/components/ui/Button/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/useToast';
import { usersAPI } from '@/lib/api/users';
import SettingsFormPageLayout from '@/components/Layout/SettingsFormPageLayout';
import type {
  UserCreateInput,
  UserUpdateInput,
} from '@/lib/schemas/user.schema';
import type { User, UserFormData } from '@/types/user';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { showToast } = useToast();

  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (!Number.isFinite(userId) || userId <= 0) {
        showToast({
          message: 'Identifiant utilisateur invalide',
          variant: 'error',
        });
        router.push(`/${locale}/settings/users`);
        return;
      }

      try {
        setLoading(true);
        const response = await usersAPI.getById(userId);
        if (!response.data) {
          throw new Error('Utilisateur introuvable');
        }
        setUser(response.data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement de l'utilisateur";
        showToast({ message: errorMessage, variant: 'error' });
        router.push(`/${locale}/settings/users`);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, locale, router, showToast]);

  const handleUpdate = async (
    data: UserCreateInput | UserUpdateInput,
    photo?: File
  ) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      const updateData = data as UserUpdateInput;

      const payload: Partial<UserFormData> = {
        email: updateData.email,
        username: updateData.username,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        salary: updateData.salary,
        hireDate: updateData.hireDate,
        employmentStatusId: updateData.employmentStatusId,
        profileId: updateData.profileId,
        ...(photo ? { profilePhoto: photo } : {}),
      };

      await usersAPI.update(user.id, payload);

      showToast({
        message: 'Utilisateur modifié avec succès',
        variant: 'success',
      });

      router.push(`/${locale}/settings/users`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'utilisateur";
      setFormError(errorMessage);
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute permission="users:update">
        <div className="py-10 text-center text-gray-600">Chargement...</div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute permission="users:update">
      <SettingsFormPageLayout
        title="Modifier l'utilisateur"
        description={`Mise à jour du compte de ${user.firstName} ${user.lastName}`}
        action={
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => router.push(`/${locale}/settings/users`)}
            className="sm:w-auto"
          >
            Retour à la liste
          </Button>
        }
      >
        <UserForm
          initialData={{
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
            salary: user.salary || 0,
            hireDate: user.hireDate ? new Date(user.hireDate) : new Date(),
            employmentStatusId:
              user.employmentStatusId || user.employmentStatus?.id || 0,
            profileId: user.profileId || user.profile?.id || 0,
            profilePhoto: user.profilePhoto || undefined,
          }}
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/${locale}/settings/users`)}
          isSubmitting={isSubmitting}
          error={formError}
        />
      </SettingsFormPageLayout>
    </ProtectedRoute>
  );
}
