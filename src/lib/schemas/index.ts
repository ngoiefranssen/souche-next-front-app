/**
 * Export centralisé de tous les schémas de validation Zod
 * Permet des imports simplifiés dans les composants
 */

// User schemas
export {
  userCreateSchema,
  userUpdateSchema,
  userPasswordChangeSchema,
  type UserCreateInput,
  type UserUpdateInput,
  type UserPasswordChangeInput,
} from './user.schema';

// Role schemas
export { roleSchema, type RoleInput } from './role.schema';

// Profile schemas
export { profileSchema, type ProfileInput } from './profile.schema';

// Employment Status schemas
export {
  employmentStatusSchema,
  type EmploymentStatusInput,
} from './employment-status.schema';

// Permission schemas
export {
  permissionSchema,
  permissionAssignmentSchema,
  permissionRevocationSchema,
  type PermissionInput,
  type PermissionAssignmentInput,
  type PermissionRevocationInput,
} from './permission.schema';
