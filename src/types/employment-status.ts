/**
 * Employment Status type definitions
 * Corresponds to backend EmploymentStatus model
 */

/**
 * Complete employment status entity
 */
export interface EmploymentStatus {
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
 * Employment status input for create/update operations
 */
export interface EmploymentStatusInput {
  label: string;
  description?: string;
}
