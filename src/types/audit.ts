/**
 * Audit Log type definitions
 * Corresponds to backend AuditLog model
 */

/**
 * Complete audit log entry
 */
export interface AuditLog {
  id: number;
  userId: number;
  action: string; // "CREATE", "UPDATE", "DELETE", "READ"
  resource: string; // "users", "roles", etc.
  resourceId: number | null;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage: string | null;
  timestamp: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

/**
 * Audit statistics
 */
export interface AuditStats {
  totalLogs: number;
  successRate: number;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  topUsers: Array<{ userId: number; username: string; count: number }>;
}
