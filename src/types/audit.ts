/**
 * Audit Log type definitions
 * Corresponds to backend AuditLog model
 */

/**
 * Complete audit log entry
 */
export interface AuditLog {
  id: string;
  userId?: number;
  email?: string;
  action: string;
  resource?: string;
  resourceId?: number | null;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  success?: boolean;
  errorMessage?: string | null;
  created_at?: string;
  timestamp?: string;
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
  stats: Array<{ action: string; count: number | string }>;
}
