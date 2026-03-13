'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateInput,
  type UserUpdateInput,
} from '@/lib/schemas/user.schema';
import { FormField } from '@/components/ui/Form/FormField';
import { FormSelect } from '@/components/ui/Form/FormSelect';
import { FormDatePicker } from '@/components/ui/Form/FormDatePicker';
import { FormFileUpload } from '@/components/ui/Form/FormFileUpload';
import { FormError } from '@/components/ui/Form/FormError';
import { Button } from '@/components/ui/Button/Button';
import { profilesAPI } from '@/lib/api/settings/profiles';
import { employmentStatusAPI } from '@/lib/api/settings/employment-status';
import type { Profile } from '@/types/profile';
import type { EmploymentStatus } from '@/types/employment-status';
import {
  Mail,
  User,
  Lock,
  Phone,
  DollarSign,
  Calendar,
  Briefcase,
  UserCircle,
} from 'lucide-react';

interface UserFormProps {
  /**
   * Données initiales pour l'édition
   * Si non fourni, le formulaire est en mode création
   */
  initialData?: Partial<UserUpdateInput> & {
    id?: number;
    profilePhoto?: string;
  };

  /**
   * Callback appelé lors de la soumission du formulaire
   */
  onSubmit: (
    data: UserCreateInput | UserUpdateInput,
    photo?: File
  ) => Promise<void>;

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
 * Formulaire de création/édition d'utilisateur
 *
 * Ce composant gère la création et l'édition des utilisateurs avec validation Zod.
 * Il contient >4 champs donc il est conçu pour être utilisé sur une page dédiée.
 *
 * Champs:
 * - email, username, password (création uniquement)
 * - firstName, lastName, phone
 * - profilePhoto (upload avec prévisualisation)
 * - salary, hireDate
 * - employmentStatusId, profileId (selects chargés depuis le backend)
 */
export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}) => {
  const isEditMode = !!initialData?.id;
  const schema = isEditMode ? userUpdateSchema : userCreateSchema;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<
    EmploymentStatus[]
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.profilePhoto || null
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<UserCreateInput | UserUpdateInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      salary: 0,
      hireDate: new Date(),
      employmentStatusId: 0,
      profileId: 0,
    },
    mode: 'onChange',
  });

  // Charger les options pour les selects
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [profilesResponse, statusesResponse] = await Promise.all([
          profilesAPI.getAll({ limit: 100 }),
          employmentStatusAPI.getAll({ limit: 100 }),
        ]);

        setProfiles(profilesResponse.data);
        setEmploymentStatuses(statusesResponse.data);
      } catch (error) {
        console.error('Error loading form options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleFormSubmit = async (data: UserCreateInput | UserUpdateInput) => {
    try {
      await onSubmit(data, photoFile || undefined);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(initialData?.profilePhoto || null);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Chargement du formulaire...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Erreur globale */}
      {error && <FormError message={error} />}

      {/* Section: Informations de connexion */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations de connexion
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Email"
            {...register('email')}
            error={errors.email?.message}
            icon={<Mail className="w-4 h-4" />}
            placeholder="utilisateur@example.com"
            type="email"
            required
            disabled={isSubmitting}
            autoComplete="email"
          />

          <FormField
            label="Nom d'utilisateur"
            {...register('username')}
            error={errors.username?.message}
            icon={<User className="w-4 h-4" />}
            placeholder="nom_utilisateur"
            required
            disabled={isSubmitting}
            autoComplete="username"
          />

          {!isEditMode && (
            <FormField
              label="Mot de passe"
              {...register('password')}
              error={errors.password?.message}
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              type="password"
              required
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          )}
        </div>
      </div>

      {/* Section: Informations personnelles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Prénom"
            {...register('firstName')}
            error={errors.firstName?.message}
            icon={<UserCircle className="w-4 h-4" />}
            placeholder="Jean"
            required
            disabled={isSubmitting}
            autoComplete="given-name"
          />

          <FormField
            label="Nom"
            {...register('lastName')}
            error={errors.lastName?.message}
            icon={<UserCircle className="w-4 h-4" />}
            placeholder="Dupont"
            required
            disabled={isSubmitting}
            autoComplete="family-name"
          />

          <FormField
            label="Téléphone"
            {...register('phone')}
            error={errors.phone?.message}
            icon={<Phone className="w-4 h-4" />}
            placeholder="+33612345678"
            type="tel"
            required
            disabled={isSubmitting}
            autoComplete="tel"
          />

          <div className="md:col-span-2">
            <Controller
              name="profilePhoto"
              control={control}
              render={({ field }) => (
                <FormFileUpload
                  label="Photo de profil"
                  accept="image/*"
                  maxSize={5}
                  preview={photoPreview}
                  onChange={file => {
                    field.onChange(file);
                    handlePhotoChange(file);
                  }}
                  error={errors.profilePhoto?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Section: Informations professionnelles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations professionnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="profileId"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Profil"
                {...field}
                value={field.value?.toString() || ''}
                onChange={e => field.onChange(parseInt(e.target.value, 10))}
                error={errors.profileId?.message}
                icon={<Briefcase className="w-4 h-4" />}
                required
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Sélectionner un profil' },
                  ...profiles.map(p => ({
                    value: p.id.toString(),
                    label: p.label,
                  })),
                ]}
              />
            )}
          />

          <Controller
            name="employmentStatusId"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Statut d'emploi"
                {...field}
                value={field.value?.toString() || ''}
                onChange={e => field.onChange(parseInt(e.target.value, 10))}
                error={errors.employmentStatusId?.message}
                icon={<Briefcase className="w-4 h-4" />}
                required
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Sélectionner un statut' },
                  ...employmentStatuses.map(s => ({
                    value: s.id.toString(),
                    label: s.label,
                  })),
                ]}
              />
            )}
          />

          <FormField
            label="Salaire"
            {...register('salary', { valueAsNumber: true })}
            error={errors.salary?.message}
            icon={<DollarSign className="w-4 h-4" />}
            placeholder="50000"
            type="number"
            step="0.01"
            required
            disabled={isSubmitting}
          />

          <Controller
            name="hireDate"
            control={control}
            render={({ field }) => (
              <FormDatePicker
                label="Date d'embauche"
                {...field}
                value={field.value}
                onChange={field.onChange}
                error={errors.hireDate?.message}
                icon={<Calendar className="w-4 h-4" />}
                required
                disabled={isSubmitting}
                maxDate={new Date()}
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
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
          {isEditMode ? 'Mettre à jour' : "Créer l'utilisateur"}
        </Button>
      </div>
    </form>
  );
};
