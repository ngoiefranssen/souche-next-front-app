import { z } from 'zod';

/**
 * Schema de validation pour les permissions
 * Utilisé pour la création et la mise à jour des permissions
 * Supporte les conditions ABAC (Attribute-Based Access Control)
 */
export const permissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom de la permission est requis')
    .regex(
      /^[a-z-]+:[a-z-]+$/,
      'Le nom doit suivre le format "resource:action" (ex: users:create, roles:read)'
    )
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  resource: z
    .string()
    .min(2, 'La ressource doit contenir au moins 2 caractères')
    .max(50, 'La ressource ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-z-]+$/,
      'La ressource ne peut contenir que des lettres minuscules et des tirets'
    ),

  action: z
    .string()
    .min(2, "L'action doit contenir au moins 2 caractères")
    .max(50, "L'action ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-z-]+$/,
      "L'action ne peut contenir que des lettres minuscules et des tirets"
    ),

  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),

  conditions: z
    .record(z.unknown())
    .optional()
    .nullable()
    .refine(
      val => {
        if (!val) return true;
        try {
          // Vérifier que c'est un objet JSON valide
          JSON.stringify(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Les conditions doivent être un objet JSON valide' }
    ),
});

/**
 * Schema de validation pour l'assignment de permissions aux rôles
 */
export const permissionAssignmentSchema = z.object({
  roleId: z
    .number()
    .int("L'ID du rôle doit être un entier")
    .positive("L'ID du rôle doit être positif"),

  permissionId: z
    .number()
    .int("L'ID de la permission doit être un entier")
    .positive("L'ID de la permission doit être positif"),
});

/**
 * Schema de validation pour la révocation de permissions des rôles
 */
export const permissionRevocationSchema = z.object({
  roleId: z
    .number()
    .int("L'ID du rôle doit être un entier")
    .positive("L'ID du rôle doit être positif"),

  permissionId: z
    .number()
    .int("L'ID de la permission doit être un entier")
    .positive("L'ID de la permission doit être positif"),
});

/**
 * Types TypeScript inférés des schémas Zod
 */
export type PermissionInput = z.infer<typeof permissionSchema>;
export type PermissionAssignmentInput = z.infer<
  typeof permissionAssignmentSchema
>;
export type PermissionRevocationInput = z.infer<
  typeof permissionRevocationSchema
>;
