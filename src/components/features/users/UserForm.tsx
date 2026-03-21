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
  UserCircle,
  Eye,
  EyeOff,
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
 * - email, username, password, confirmPassword (création uniquement)
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
  type UserFormInput = Partial<UserCreateInput> & {
    profilePhoto?: File | null;
  };

  const isEditMode = !!initialData?.id;
  const schema = isEditMode ? userUpdateSchema : userCreateSchema;
  const defaultValues: UserFormInput = {
    email: initialData?.email ?? '',
    username: initialData?.username ?? '',
    password: '',
    confirmPassword: '',
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    phone: initialData?.phone ?? '',
    salary: initialData?.salary ?? (isEditMode ? undefined : 0),
    hireDate: initialData?.hireDate
      ? new Date(initialData.hireDate)
      : isEditMode
        ? undefined
        : new Date(),
    employmentStatusId:
      initialData?.employmentStatusId ?? (isEditMode ? undefined : 0),
    profileId: initialData?.profileId ?? (isEditMode ? undefined : 0),
    isActive: initialData?.isActive ?? true,
    profilePhoto: null,
  };

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<
    EmploymentStatus[]
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.profilePhoto || null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<UserFormInput>({
    resolver: zodResolver(schema),
    defaultValues,
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

  const handleFormSubmit = async (data: UserFormInput) => {
    try {
      if (isEditMode) {
        const { password, confirmPassword, profilePhoto, ...updateData } = data;
        void password;
        void confirmPassword;
        void profilePhoto;
        await onSubmit(updateData, photoFile || undefined);
        return;
      }

      await onSubmit(data as UserCreateInput, photoFile || undefined);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Erreur globale */}
      {error && <FormError message={error} />}

      {/* Section: Informations de connexion */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Informations de connexion
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <>
              <div className="w-full">
                <label
                  htmlFor="user-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe<span className="text-red-600 ml-1">*</span>
                </label>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    id="user-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    className={`
                      w-full px-3 py-2 pl-10 pr-10
                      border rounded-lg
                      text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-offset-0
                      transition-all duration-200
                      disabled:bg-gray-100 disabled:cursor-not-allowed
                      ${
                        errors.password?.message
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#2B6A8E] focus:border-[#2B6A8E]'
                      }
                    `}
                    aria-invalid={errors.password?.message ? 'true' : 'false'}
                    aria-describedby={
                      errors.password?.message
                        ? 'user-password-error'
                        : undefined
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(previous => !previous)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.password?.message && (
                  <p
                    id="user-password-error"
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="user-confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmer le mot de passe
                  <span className="text-red-600 ml-1">*</span>
                </label>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    id="user-confirm-password"
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    className={`
                      w-full px-3 py-2 pl-10 pr-10
                      border rounded-lg
                      text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-offset-0
                      transition-all duration-200
                      disabled:bg-gray-100 disabled:cursor-not-allowed
                      ${
                        errors.confirmPassword?.message
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#2B6A8E] focus:border-[#2B6A8E]'
                      }
                    `}
                    aria-invalid={
                      errors.confirmPassword?.message ? 'true' : 'false'
                    }
                    aria-describedby={
                      errors.confirmPassword?.message
                        ? 'user-confirm-password-error'
                        : undefined
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(previous => !previous)
                    }
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={
                      showConfirmPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showConfirmPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword?.message && (
                  <p
                    id="user-confirm-password-error"
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section: Informations personnelles */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            required={!isEditMode}
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
                  preview={Boolean(photoPreview)}
                  onChange={file => {
                    field.onChange(file);
                    handlePhotoChange(file);
                  }}
                  error={errors.profilePhoto?.message}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Section: Informations professionnelles */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Informations professionnelles
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="profileId"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Profil"
                {...field}
                value={field.value?.toString() || ''}
                onChange={e => {
                  const value = e.target.value;
                  field.onChange(value ? parseInt(value, 10) : undefined);
                }}
                error={errors.profileId?.message}
                required={!isEditMode}
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
                onChange={e => {
                  const value = e.target.value;
                  field.onChange(value ? parseInt(value, 10) : undefined);
                }}
                error={errors.employmentStatusId?.message}
                required={!isEditMode}
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
            required={!isEditMode}
            disabled={isSubmitting}
          />

          <Controller
            name="hireDate"
            control={control}
            render={({ field }) => (
              <FormDatePicker
                label="Date d'embauche"
                {...field}
                value={
                  field.value instanceof Date
                    ? field.value.toISOString().split('T')[0]
                    : ''
                }
                onChange={e =>
                  field.onChange(
                    e.target.value
                      ? new Date(`${e.target.value}T00:00:00`)
                      : undefined
                  )
                }
                error={errors.hireDate?.message}
                required={!isEditMode}
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
              />
            )}
          />
        </div>
      </div>

      {/* Section: Statut du compte */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Statut du compte
        </h3>
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('isActive')}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 text-[#2B6A8E] focus:ring-[#2B6A8E]"
          />
          <span className="text-sm font-medium text-gray-700">
            Compte actif (autorisé à se connecter)
          </span>
        </label>
        <p className="mt-2 text-sm text-gray-500">
          Si ce champ est désactivé, l&apos;utilisateur ne pourra plus accéder à
          l&apos;application.
        </p>
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
          disabled={isSubmitting || (isEditMode ? !isDirty : !isValid)}
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
