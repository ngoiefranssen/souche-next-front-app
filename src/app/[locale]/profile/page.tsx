'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  RotateCcw,
  Save,
  Upload,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/Form/FormField';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { usersAPI } from '@/lib/api/users';
import type { User as AuthUser } from '@/lib/api/auth/auth';
import type { UserFormData } from '@/types/user';

type AccountTab = 'profile' | 'security';

type ProfileFormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
};

type SecurityFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SecurityErrors = Partial<Record<keyof SecurityFormState, string>>;

type PasswordVisibilityState = {
  current: boolean;
  next: boolean;
  confirm: boolean;
};

const emptySecurityForm: SecurityFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const toProfileState = (user: AuthUser | null): ProfileFormState => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  username: user?.username || '',
  email: user?.email || '',
  phone: user?.phone || '',
});

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  placeholder,
  visible,
  onToggle,
  onChange,
  error,
  autoComplete,
}) => {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border px-3 py-2 pr-10 text-gray-900 outline-none transition-all focus:ring-2 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-[#2B6A8E] focus:ring-[#2B6A8E]'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-2 inline-flex items-center justify-center text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
          aria-label={
            visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() =>
    toProfileState(user)
  );
  const [initialProfileForm, setInitialProfileForm] =
    useState<ProfileFormState>(() => toProfileState(user));
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.profilePhoto || null
  );
  const [initialAvatarPreview, setInitialAvatarPreview] = useState<
    string | null
  >(user?.profilePhoto || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [securityForm, setSecurityForm] =
    useState<SecurityFormState>(emptySecurityForm);
  const [securityErrors, setSecurityErrors] = useState<SecurityErrors>({});
  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordVisibilityState>({
      current: false,
      next: false,
      confirm: false,
    });
  const [isSubmittingSecurity, setIsSubmittingSecurity] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const nextState = toProfileState(user);
    setProfileForm(nextState);
    setInitialProfileForm(nextState);
    setAvatarPreview(user?.profilePhoto || null);
    setInitialAvatarPreview(user?.profilePhoto || null);
    setAvatarFile(null);
  }, [user]);

  const handleProfileInputChange = (
    key: keyof ProfileFormState,
    value: string
  ) => {
    setProfileForm(previous => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleAvatarSelection = (file: File | null) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(initialAvatarPreview);
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast({
        message: 'Veuillez choisir un fichier image valide (JPG, PNG, GIF).',
        variant: 'error',
      });
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      showToast({
        message: 'La taille maximale autorisée est de 5 MB.',
        variant: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setAvatarFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileReset = () => {
    setProfileForm(initialProfileForm);
    setAvatarFile(null);
    setAvatarPreview(initialAvatarPreview);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) {
      showToast({
        message: 'Utilisateur introuvable. Veuillez vous reconnecter.',
        variant: 'error',
      });
      return;
    }

    try {
      setIsSubmittingProfile(true);

      const payload: Partial<UserFormData> = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      };

      if (avatarFile) {
        payload.profilePhoto = avatarFile;
      }

      const response = await usersAPI.update(user.id, payload);
      const persistedAvatar =
        response.data?.profilePhoto || avatarPreview || initialAvatarPreview;

      setInitialProfileForm(profileForm);
      setInitialAvatarPreview(persistedAvatar);
      setAvatarPreview(persistedAvatar);
      setAvatarFile(null);

      if (typeof window !== 'undefined') {
        try {
          const rawStoredUser = localStorage.getItem('user-data');
          if (rawStoredUser) {
            const storedUser = JSON.parse(rawStoredUser) as Record<
              string,
              unknown
            >;
            const updatedStoredUser = {
              ...storedUser,
              ...profileForm,
              profilePhoto: persistedAvatar || storedUser.profilePhoto,
            };
            localStorage.setItem(
              'user-data',
              JSON.stringify(updatedStoredUser)
            );
          }
        } catch {
          // Non bloquant: on laisse la mise à jour serveur comme source de vérité
        }
      }

      showToast({
        message: 'Profil mis à jour avec succès.',
        variant: 'success',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du profil.';

      showToast({
        message,
        variant: 'error',
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const updateSecurityField = (
    key: keyof SecurityFormState,
    value: string
  ): void => {
    setSecurityForm(previous => ({
      ...previous,
      [key]: value,
    }));

    if (securityErrors[key]) {
      setSecurityErrors(previous => {
        const next = { ...previous };
        delete next[key];
        return next;
      });
    }
  };

  const validateSecurityForm = (): SecurityErrors => {
    const errors: SecurityErrors = {};

    if (!securityForm.currentPassword.trim()) {
      errors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!securityForm.newPassword.trim()) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (securityForm.newPassword.length < 8) {
      errors.newPassword =
        'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!securityForm.confirmPassword.trim()) {
      errors.confirmPassword = 'Veuillez confirmer le nouveau mot de passe';
    } else if (securityForm.confirmPassword !== securityForm.newPassword) {
      errors.confirmPassword = 'La confirmation ne correspond pas';
    }

    return errors;
  };

  const handleSecurityReset = () => {
    setSecurityForm(emptySecurityForm);
    setSecurityErrors({});
    setPasswordVisibility({
      current: false,
      next: false,
      confirm: false,
    });
  };

  const handleSecuritySubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) {
      showToast({
        message: 'Utilisateur introuvable. Veuillez vous reconnecter.',
        variant: 'error',
      });
      return;
    }

    const errors = validateSecurityForm();
    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
      return;
    }

    try {
      setIsSubmittingSecurity(true);

      await usersAPI.update(user.id, {
        password: securityForm.newPassword,
      });

      handleSecurityReset();

      showToast({
        message: 'Mot de passe mis à jour avec succès.',
        variant: 'success',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du mot de passe.';

      showToast({
        message,
        variant: 'error',
      });
    } finally {
      setIsSubmittingSecurity(false);
    }
  };

  const userInitial =
    user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U';

  const profileTabClassName =
    activeTab === 'profile'
      ? 'border-emerald-500 text-emerald-600'
      : 'border-transparent text-gray-500 hover:text-gray-700';

  const securityTabClassName =
    activeTab === 'security'
      ? 'border-emerald-500 text-emerald-600'
      : 'border-transparent text-gray-500 hover:text-gray-700';

  return (
    <div className="w-full px-1 py-2 sm:px-2 sm:py-3 lg:px-2">
      <div className="px-4 pt-4 sm:px-6">
        <div className="flex items-end gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${profileTabClassName}`}
          >
            <User className="h-4 w-4" />
            <span>Profil du compte</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`inline-flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${securityTabClassName}`}
          >
            <Lock className="h-4 w-4" />
            <span>Sécurité</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <h2 className="text-base font-semibold text-gray-800">
                      Profile
                    </h2>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Photo de profil"
                          className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-700">
                          {userInitial}
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={event => {
                        const file = event.target.files?.[0] || null;
                        handleAvatarSelection(file);
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        className="!bg-[#0C6984] hover:!bg-[#09566c] focus:!ring-[#0C6984]"
                        icon={<Upload className="h-4 w-4" />}
                        iconPosition="left"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choisir l&apos;image
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="!bg-[#82AFC1] !text-white hover:!bg-[#6f9bab] focus:!ring-[#82AFC1]"
                        icon={<X className="h-4 w-4" />}
                        iconPosition="left"
                        onClick={handleProfileReset}
                      >
                        Annuler
                      </Button>
                    </div>

                    <div
                      className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500"
                      onDragOver={event => {
                        event.preventDefault();
                      }}
                      onDrop={event => {
                        event.preventDefault();
                        const droppedFile =
                          event.dataTransfer.files?.[0] || null;
                        handleAvatarSelection(droppedFile);
                      }}
                    >
                      Glisser et déposez ici.
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-8">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <h2 className="text-base font-semibold text-gray-800">
                      Modifier les détails du compte
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                    <FormField
                      label="Nom"
                      value={profileForm.lastName}
                      onChange={event =>
                        handleProfileInputChange('lastName', event.target.value)
                      }
                      placeholder="Votre nom"
                      required
                      disabled={isSubmittingProfile}
                    />

                    <FormField
                      label="Prénom"
                      value={profileForm.firstName}
                      onChange={event =>
                        handleProfileInputChange(
                          'firstName',
                          event.target.value
                        )
                      }
                      placeholder="Votre prénom"
                      required
                      disabled={isSubmittingProfile}
                    />

                    <FormField
                      label="Nom d'utilisateur"
                      value={profileForm.username}
                      onChange={event =>
                        handleProfileInputChange('username', event.target.value)
                      }
                      placeholder="Votre nom d'utilisateur"
                      required
                      disabled={isSubmittingProfile}
                      autoComplete="username"
                    />

                    <FormField
                      label="E-mail"
                      type="email"
                      value={profileForm.email}
                      onChange={event =>
                        handleProfileInputChange('email', event.target.value)
                      }
                      placeholder="votre.email@example.com"
                      required
                      disabled={isSubmittingProfile}
                      autoComplete="email"
                    />

                    <div className="md:col-span-2">
                      <FormField
                        label="Numéro de téléphone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={event =>
                          handleProfileInputChange('phone', event.target.value)
                        }
                        placeholder="0900000000"
                        required
                        disabled={isSubmittingProfile}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={<RotateCcw className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleProfileReset}
                className="!bg-amber-500 !text-white hover:!bg-amber-600 focus:!ring-amber-500"
              >
                Réinitialiser
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={isSubmittingProfile}
                icon={<Save className="h-4 w-4" />}
                iconPosition="left"
                className="!bg-[#0C6984] hover:!bg-[#09566c] focus:!ring-[#0C6984]"
              >
                Modifier le profil
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <h2 className="text-base font-semibold text-gray-800">
                      Changer le mot de passe
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                    <FormField
                      label="Nom d'utilisateur"
                      value={user?.username || ''}
                      readOnly
                      className="bg-gray-50"
                    />

                    <PasswordField
                      id="current-password"
                      label="Mot de passe actuel"
                      value={securityForm.currentPassword}
                      placeholder="Entrez votre mot de passe actuel"
                      visible={passwordVisibility.current}
                      onToggle={() =>
                        setPasswordVisibility(previous => ({
                          ...previous,
                          current: !previous.current,
                        }))
                      }
                      onChange={value =>
                        updateSecurityField('currentPassword', value)
                      }
                      error={securityErrors.currentPassword}
                      autoComplete="current-password"
                    />

                    <PasswordField
                      id="new-password"
                      label="Nouveau mot de passe"
                      value={securityForm.newPassword}
                      placeholder="Écrire le mot de passe"
                      visible={passwordVisibility.next}
                      onToggle={() =>
                        setPasswordVisibility(previous => ({
                          ...previous,
                          next: !previous.next,
                        }))
                      }
                      onChange={value =>
                        updateSecurityField('newPassword', value)
                      }
                      error={securityErrors.newPassword}
                      autoComplete="new-password"
                    />

                    <PasswordField
                      id="confirm-password"
                      label="Entrez à nouveau le mot de passe"
                      value={securityForm.confirmPassword}
                      placeholder="Écrire le mot de passe"
                      visible={passwordVisibility.confirm}
                      onToggle={() =>
                        setPasswordVisibility(previous => ({
                          ...previous,
                          confirm: !previous.confirm,
                        }))
                      }
                      onChange={value =>
                        updateSecurityField('confirmPassword', value)
                      }
                      error={securityErrors.confirmPassword}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={<RotateCcw className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleSecurityReset}
                className="!bg-amber-500 !text-white hover:!bg-amber-600 focus:!ring-amber-500"
              >
                Réinitialiser
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmittingSecurity}
                icon={<Save className="h-4 w-4" />}
                iconPosition="left"
                className="!bg-[#0C6984] hover:!bg-[#09566c] focus:!ring-[#0C6984]"
              >
                Modifier le mot de passe
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
