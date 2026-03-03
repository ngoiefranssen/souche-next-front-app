/**
 * Role type definitions
 * Corresponds to backend Role model
 */

/**
 * Complete role entity
 */
export interface Role {
  id: number;
  label: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    profiles: number;
  };
}

/**
 * Role input for create/update operations
 */
export interface RoleInput {
  label: string;
  description?: string;
}
