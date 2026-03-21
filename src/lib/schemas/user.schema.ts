import { z } from 'zod';

/**
 * Schema de validation pour la création d'un utilisateur
 * Valide tous les champs requis avec les règles métier appropriées
 */
const userCreateBaseSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),

  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
    ),

  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),

  confirmPassword: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),

  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),

  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  phone: z
    .string()
    .regex(
      /^\+?[0-9]{8,20}$/,
      'Le numéro de téléphone doit contenir entre 8 et 20 chiffres'
    ),

  salary: z
    .number()
    .positive('Le salaire doit être un nombre positif')
    .min(0, 'Le salaire ne peut pas être négatif'),

  hireDate: z
    .date({
      required_error: "La date d'embauche est requise",
      invalid_type_error: 'Format de date invalide',
    })
    .max(new Date(), "La date d'embauche ne peut pas être dans le futur"),

  employmentStatusId: z
    .number()
    .int("L'ID du statut d'emploi doit être un entier")
    .positive("L'ID du statut d'emploi doit être positif"),

  profileId: z
    .number()
    .int("L'ID du profil doit être un entier")
    .positive("L'ID du profil doit être positif"),
});

export const userCreateSchema = userCreateBaseSchema.refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  }
);

/**
 * Schema de validation pour la mise à jour d'un utilisateur
 * Tous les champs sont optionnels sauf le mot de passe qui est exclu
 */
export const userUpdateSchema = userCreateBaseSchema
  .partial()
  .omit({ password: true, confirmPassword: true });

/**
 * Schema de validation pour le changement de mot de passe
 */
export const userPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),

    newPassword: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),

    confirmPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

/**
 * Types TypeScript inférés des schémas Zod
 */
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserPasswordChangeInput = z.infer<typeof userPasswordChangeSchema>;
