'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/components/ui/Form/FormField';
import { FormSelect } from '@/components/ui/Form/FormSelect';
import { FormTextarea } from '@/components/ui/Form/FormTextarea';
import { FormError } from '@/components/ui/Form/FormError';
import { Button } from '@/components/ui/Button/Button';
import type { PermissionInput } from '@/types/permission';
import { KeyRound, Database, ShieldCheck } from 'lucide-react';

const permissionSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(
      /^[a-z_]+:(read|create|update|delete|\*|execute|manage)$/i,
      'Format requis: resource:action (ex: users:read)'
    ),
  resource: z
    .string()
    .min(2, 'La ressource est requise')
    .max(50, 'La ressource ne peut pas dépasser 50 caractères'),
  action: z.enum([
    'read',
    'create',
    'update',
    'delete',
    '*',
    'execute',
    'manage',
  ]),
  description: z
    .string()
    .max(255, 'La description ne peut pas dépasser 255 caractères')
    .optional(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  initialData?: Partial<PermissionInput>;
  onSubmit: (data: PermissionInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: initialData?.name || '',
      resource: initialData?.resource || '',
      action: (initialData?.action as PermissionFormValues['action']) || 'read',
      description: initialData?.description || '',
    },
    mode: 'onChange',
  });

  const submit = async (data: PermissionFormValues) => {
    await onSubmit({
      name: data.name,
      resource: data.resource,
      action: data.action,
      description: data.description?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {error && <FormError message={error} />}

      <FormField
        label="Nom de permission"
        {...register('name')}
        error={errors.name?.message}
        icon={<KeyRound className="w-4 h-4" />}
        placeholder="users:read"
        required
        disabled={isSubmitting}
      />

      <FormField
        label="Ressource"
        {...register('resource')}
        error={errors.resource?.message}
        icon={<Database className="w-4 h-4" />}
        placeholder="users"
        required
        disabled={isSubmitting}
      />

      <Controller
        name="action"
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Action"
            {...field}
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            error={errors.action?.message}
            icon={<ShieldCheck className="w-4 h-4" />}
            required
            disabled={isSubmitting}
            options={[
              { value: 'read', label: 'Read' },
              { value: 'create', label: 'Create' },
              { value: 'update', label: 'Update' },
              { value: 'delete', label: 'Delete' },
              { value: 'manage', label: 'Manage' },
              { value: 'execute', label: 'Execute' },
              { value: '*', label: 'All (*)' },
            ]}
          />
        )}
      />

      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Description optionnelle"
        rows={3}
        disabled={isSubmitting}
      />

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
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
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          fullWidth
          className="sm:w-auto"
        >
          {initialData ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
