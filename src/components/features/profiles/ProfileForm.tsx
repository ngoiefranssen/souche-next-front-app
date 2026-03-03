'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '@/lib/schemas/profile.schema';
import { FormField } from '@/components/ui/Form/FormField';
import { FormTextarea } from '@/components/ui/Form/FormTextarea';
import { FormError } from '@/components/ui/Form/FormError';
import { Button } from '@/components/ui/Button/Button';
import { Tag, FileText } from 'lucide-react';

interface ProfileFormProps {
  initialData?: ProfileInput;
  onSubmit: (data: ProfileInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

/**
 * Formulaire de création/édition de profil
 *
 * Ce composant gère la création et l'édition des profils avec validation Zod.
 * Il contient 2 champs (label, description) donc il est conçu pour être utilisé dans un modal.
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {
      label: '',
      description: '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ProfileInput) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && <FormError message={error} />}

      <FormField
        label="Libellé"
        {...register('label')}
        error={errors.label?.message}
        icon={<Tag className="w-4 h-4" />}
        placeholder="Ex: Développeur, Designer, Manager"
        required
        disabled={isSubmitting}
        autoComplete="off"
      />

      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        icon={<FileText className="w-4 h-4" />}
        placeholder="Description du profil (optionnel)"
        rows={3}
        disabled={isSubmitting}
      />

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            fullWidth
            className="sm:w-auto"
          >
            Annuler
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isValid}
          loading={isSubmitting}
          fullWidth
          className="sm:w-auto"
        >
          {initialData ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
