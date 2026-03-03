'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleSchema, type RoleInput } from '@/lib/schemas/role.schema';
import { FormField } from '@/components/ui/Form/FormField';
import { FormTextarea } from '@/components/ui/Form/FormTextarea';
import { FormError } from '@/components/ui/Form/FormError';
import { Button } from '@/components/ui/Button/Button';
import { Tag } from 'lucide-react';

interface RoleFormProps {
  /**
   * Données initiales pour l'édition
   * Si non fourni, le formulaire est en mode création
   */
  initialData?: RoleInput;

  /**
   * Callback appelé lors de la soumission du formulaire
   */
  onSubmit: (data: RoleInput) => Promise<void>;

  /**
   * Callback appelé lors de l'annulation
   */
  onCancel?: () => void;

  /**
   * Indique si le formulaire est en cours de soumission
   */
  isSubmitting?: boolean;

  /**
   * Message d'erreur global du formulaire
   */
  error?: string;
}

/**
 * Formulaire de création/édition de rôle
 *
 * Ce composant gère la création et l'édition des rôles avec validation Zod.
 * Il contient 2 champs (label, description) donc il est conçu pour être utilisé dans un modal.
 *
 * @example
 * ```tsx
 * // Mode création
 * <RoleForm
 *   onSubmit={async (data) => {
 *     await rolesAPI.create(data);
 *   }}
 *   onCancel={() => setIsModalOpen(false)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Mode édition
 * <RoleForm
 *   initialData={{ label: 'Admin', description: 'Administrateur système' }}
 *   onSubmit={async (data) => {
 *     await rolesAPI.update(roleId, data);
 *   }}
 *   onCancel={() => setIsModalOpen(false)}
 * />
 * ```
 */
export const RoleForm: React.FC<RoleFormProps> = ({
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
  } = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData || {
      label: '',
      description: '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: RoleInput) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // L'erreur est gérée par le composant parent
      console.error('Form submission error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Erreur globale */}
      {error && <FormError message={error} />}

      {/* Champ Label */}
      <FormField
        label="Libellé"
        {...register('label')}
        error={errors.label?.message}
        icon={<Tag className="w-4 h-4" />}
        placeholder="Ex: Administrateur, Manager, Employé"
        required
        disabled={isSubmitting}
        autoComplete="off"
      />

      {/* Champ Description */}
      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Description du rôle (optionnel)"
        rows={3}
        disabled={isSubmitting}
      />

      {/* Actions */}
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
