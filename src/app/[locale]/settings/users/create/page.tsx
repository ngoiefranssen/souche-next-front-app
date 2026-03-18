'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import type { UserFormData } from '@/types/user';

export default function CreateUserPage() {
  const router = useRouter();
  const locale = useLocale();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreate = async (
    data: UserCreateInput | UserUpdateInput,
    photo?: File
  ) => {
    try {
      setIsSubmitting(true);
      setFormError('');

      const createData = data as UserCreateInput;

      const payload: UserFormData = {
        email: createData.email,
        username: createData.username,
        password: createData.password,
        firstName: createData.firstName,
        lastName: createData.lastName,
        phone: createData.phone,
        salary: createData.salary,
        hireDate: createData.hireDate,
        employmentStatusId: createData.employmentStatusId,
        profileId: createData.profileId,
        ...(photo ? { profilePhoto: photo } : {}),
      };

      await usersAPI.create(payload);

      showToast({
        message: 'Utilisateur créé avec succès',
        variant: 'success',
      });

      router.push(`/${locale}/settings/users`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'utilisateur";
      setFormError(errorMessage);
      showToast({ message: errorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute permission="users:create">
      <SettingsFormPageLayout
        title="Créer un utilisateur"
        description="Renseignez les informations du nouvel utilisateur"
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
          onSubmit={handleCreate}
          onCancel={() => router.push(`/${locale}/settings/users`)}
          isSubmitting={isSubmitting}
          error={formError}
        />
      </SettingsFormPageLayout>
    </ProtectedRoute>
  );
}
