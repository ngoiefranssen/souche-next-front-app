/**
 * Permission type definitions
 * Corresponds to backend Permission model
 */

/**
 * Complete permission entity
 */
export interface Permission {
  id: number;
  name: string; // Format: "resource:action" (e.g., "users:create")
  resource: string;
  action: string;
  description: string | null;
  category?: string | null;
  priority?: number | null;
  isSystem?: boolean;
  conditions: Record<string, unknown> | null; // ABAC conditions
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Permission assignment to role
 */
export interface PermissionAssignment {
  roleId: number;
  permissionId: number;
  assignedAt: string;
}

/**
 * Permission input for create/update operations
 */
export interface PermissionInput {
  name: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  priority?: number;
  conditions?: Record<string, unknown>;
}
