'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  employmentStatusSchema,
  type EmploymentStatusInput,
} from '@/lib/schemas/employment-status.schema';
import { FormField } from '@/components/ui/Form/FormField';
import { FormTextarea } from '@/components/ui/Form/FormTextarea';
import { FormError } from '@/components/ui/Form/FormError';
import { Button } from '@/components/ui/Button/Button';
import { Tag, FileText } from 'lucide-react';

interface EmploymentStatusFormProps {
  initialData?: EmploymentStatusInput;
  onSubmit: (data: EmploymentStatusInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export const EmploymentStatusForm: React.FC<EmploymentStatusFormProps> = ({
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
  } = useForm<EmploymentStatusInput>({
    resolver: zodResolver(employmentStatusSchema),
    defaultValues: initialData || {
      label: '',
      description: '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: EmploymentStatusInput) => {
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
        placeholder="Ex: CDI, CDD, Stage, Freelance"
        required
        disabled={isSubmitting}
        autoComplete="off"
      />

      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        icon={<FileText className="w-4 h-4" />}
        placeholder="Description du statut d'emploi (optionnel)"
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
