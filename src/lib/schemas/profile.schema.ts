import { z } from 'zod';

/**
 * Schema de validation pour les profils
 * Utilisé pour la création et la mise à jour des profils
 */
export const profileSchema = z.object({
  label: z
    .string()
    .min(2, 'Le libellé doit contenir au moins 2 caractères')
    .max(100, 'Le libellé ne peut pas dépasser 100 caractères')
    .regex(
      /^[a-zA-Z0-9\s_-]+$/,
      'Le libellé ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'
    ),

  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
});

/**
 * Type TypeScript inféré du schéma Zod
 */
export type ProfileInput = z.infer<typeof profileSchema>;
