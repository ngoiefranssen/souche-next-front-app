/**
 * Profile type definitions
 * Corresponds to backend Profile model
 */

/**
 * Complete profile entity
 */
export interface Profile {
  id: number;
  label: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    users: number;
  };
}

/**
 * Profile input for create/update operations
 */
export interface ProfileInput {
  label: string;
  description?: string;
}
