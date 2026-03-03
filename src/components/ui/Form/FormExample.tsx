'use client';

/**
 * Exemple d'utilisation des composants de formulaire
 * Ce fichier démontre comment utiliser tous les composants Form avec React Hook Form
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Phone } from 'lucide-react';
import {
  FormField,
  FormSelect,
  FormTextarea,
  FormDatePicker,
  FormFileUpload,
  FormError,
} from './index';
import { Button } from '../Button';

// Schéma de validation Zod
const exampleSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z.string().min(3, 'Minimum 3 caractères'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Numéro invalide'),
  profileId: z.number().positive('Profil requis'),
  description: z.string().optional(),
  hireDate: z.string().min(1, 'Date requise'),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

export const FormExample: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
  });

  const onSubmit = async (data: ExampleFormData) => {
    try {
      setSubmitError('');
      console.log('Form data:', data);
      console.log('File:', file);

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Formulaire soumis avec succès!');
    } catch {
      setSubmitError('Une erreur est survenue lors de la soumission.');
    }
  };

  const profileOptions = [
    { label: 'Administrateur', value: 1 },
    { label: 'Utilisateur', value: 2 },
    { label: 'Gestionnaire', value: 3 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Exemple de Formulaire
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && <FormError message={submitError} />}

        {/* FormField avec icône */}
        <FormField
          label="Email"
          type="email"
          placeholder="exemple@email.com"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          helperText="Votre adresse email professionnelle"
          required
          {...register('email')}
        />

        {/* FormField simple */}
        <FormField
          label="Nom d'utilisateur"
          type="text"
          placeholder="johndoe"
          icon={<User className="w-5 h-5" />}
          error={errors.username?.message}
          required
          {...register('username')}
        />

        {/* FormField avec validation téléphone */}
        <FormField
          label="Téléphone"
          type="tel"
          placeholder="+33612345678"
          icon={<Phone className="w-5 h-5" />}
          error={errors.phone?.message}
          required
          {...register('phone')}
        />

        {/* FormSelect */}
        <FormSelect
          label="Profil"
          placeholder="Sélectionnez un profil"
          options={profileOptions}
          error={errors.profileId?.message}
          required
          {...register('profileId', { valueAsNumber: true })}
        />

        {/* FormTextarea */}
        <FormTextarea
          label="Description"
          placeholder="Entrez une description..."
          rows={4}
          error={errors.description?.message}
          helperText="Optionnel - Décrivez votre rôle"
          {...register('description')}
        />

        {/* FormDatePicker */}
        <FormDatePicker
          label="Date d'embauche"
          error={errors.hireDate?.message}
          required
          {...register('hireDate')}
        />

        {/* FormFileUpload */}
        <FormFileUpload
          label="Photo de profil"
          accept="image/*"
          maxSize={5}
          preview={true}
          onChange={setFile}
          value={file}
          helperText="Format: JPG, PNG (max 5MB)"
        />

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            fullWidth
          >
            Soumettre
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            Réinitialiser
          </Button>
        </div>
      </form>
    </div>
  );
};
