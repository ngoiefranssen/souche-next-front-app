/**
 * API services index
 * Central export point for all API services
 */

export { apiClient } from './client';
export { usersAPI } from './users';
export { rolesAPI } from './roles';
export { profilesAPI } from './profiles';
export { employmentStatusAPI } from './employment-status';
export { permissionsAPI } from './permissions';
export { auditAPI } from './audit';

// Re-export types for convenience
export type { UserQueryParams } from './users';
export type { RoleQueryParams } from './roles';
export type { ProfileQueryParams } from './profiles';
export type { EmploymentStatusQueryParams } from './employment-status';
export type { PermissionQueryParams } from './permissions';
export type { AuditQueryParams } from './audit';
