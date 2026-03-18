/**
 * Audit API service
 * Handles all audit log-related API operations
 */

import { apiClient } from '../client';
import type { AuditLog, AuditStats } from '@/types/audit';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

/**
 * Query parameters for audit log list
 */
export interface AuditQueryParams {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  resource?: string;
  success?: boolean;
  severity?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface BackendAuditLog {
  id?: string | number;
  userId?: number;
  user_id?: number;
  email?: string | null;
  action?: string | null;
  resource?: string | null;
  resourceId?: number | null;
  resource_id?: number | null;
  details?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  ip_address?: string | null;
  userAgent?: string | null;
  user_agent?: string | null;
  severity?: 'info' | 'warning' | 'error' | 'critical' | null;
  success?: boolean | null;
  errorMessage?: string | null;
  error_message?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
  user?: {
    id?: number;
    username?: string;
    email?: string;
  } | null;
}

interface BackendAuditLogsPayload {
  logs?: BackendAuditLog[];
  items?: BackendAuditLog[];
  pagination?: PaginatedResponse<AuditLog>['pagination'];
}

interface BackendAuditLogsResponse {
  status?: 'success' | 'error';
  success?: boolean;
  data?: BackendAuditLogsPayload | BackendAuditLog[];
  logs?: BackendAuditLog[];
  pagination?: PaginatedResponse<AuditLog>['pagination'];
}

const toAuditLog = (log: BackendAuditLog): AuditLog => {
  const createdAt = log.created_at || log.createdAt || log.timestamp;
  const email = log.email || log.user?.email;

  return {
    id: String(log.id ?? ''),
    userId: log.userId ?? log.user_id,
    email: email || undefined,
    action: String(log.action || ''),
    resource: log.resource || undefined,
    resourceId: log.resourceId ?? log.resource_id,
    details: log.details || undefined,
    metadata: log.metadata || undefined,
    ipAddress: log.ipAddress || log.ip_address || undefined,
    userAgent: log.userAgent || log.user_agent || undefined,
    severity: log.severity || undefined,
    success: typeof log.success === 'boolean' ? log.success : undefined,
    errorMessage: log.errorMessage || log.error_message || null,
    created_at: createdAt || undefined,
    timestamp: log.timestamp || createdAt || undefined,
    user:
      log.user && log.user.id
        ? {
            id: log.user.id,
            username: log.user.username || '',
            email: log.user.email || '',
          }
        : undefined,
  };
};

const normalizeLogsResponse = (
  response: BackendAuditLogsResponse,
  requestedPage: number,
  requestedLimit: number
): PaginatedResponse<AuditLog> => {
  const payload =
    Array.isArray(response.data) || !response.data
      ? undefined
      : (response.data as BackendAuditLogsPayload);

  const rawLogs =
    payload?.logs ||
    payload?.items ||
    (Array.isArray(response.data) ? response.data : undefined) ||
    response.logs ||
    [];

  const mappedLogs = rawLogs.map(toAuditLog);
  const pagination = payload?.pagination ||
    response.pagination || {
      total: mappedLogs.length,
      page: requestedPage,
      limit: requestedLimit,
      totalPages: Math.max(1, Math.ceil(mappedLogs.length / requestedLimit)),
    };

  return {
    status: 'success',
    data: mappedLogs,
    pagination: {
      ...pagination,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPreviousPage: pagination.page > 1,
    },
  };
};

/**
 * Get all audit logs with pagination and filters
 */
export async function getAll(
  params: AuditQueryParams = {}
): Promise<PaginatedResponse<AuditLog>> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.userId) queryParams.append('userId', params.userId.toString());
  if (params.action) queryParams.append('action', params.action);
  if (params.resource) queryParams.append('resource', params.resource);
  if (typeof params.success === 'boolean') {
    queryParams.append('success', params.success.toString());
  }
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const requestedPage = params.page || 1;
  const requestedLimit = params.limit || 10;
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/audit/logs?${queryString}` : '/audit/logs';

  const response = await apiClient.get<BackendAuditLogsResponse>(endpoint);
  return normalizeLogsResponse(response, requestedPage, requestedLimit);
}

/**
 * Get audit statistics
 */
export async function getStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AuditStats>> {
  const queryParams = new URLSearchParams();

  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/audit/stats?${queryString}` : '/audit/stats';

  const response = await apiClient.get<{
    status?: 'success' | 'error';
    success?: boolean;
    data?: AuditStats | { stats?: AuditStats['stats'] } | AuditStats['stats'];
    stats?: AuditStats['stats'];
  }>(endpoint);

  const rawData = response.data;
  const statsArray = Array.isArray(rawData)
    ? rawData
    : Array.isArray(
          (rawData as { stats?: AuditStats['stats'] } | undefined)?.stats
        )
      ? (rawData as { stats: AuditStats['stats'] }).stats || []
      : Array.isArray(response.stats)
        ? response.stats
        : [];

  return {
    status: 'success',
    data: {
      stats: statsArray,
    },
  };
}

/**
 * Get a single audit log by ID
 * Note: Backend does not expose a dedicated /audit/:id route,
 * so this performs a best-effort lookup in the latest logs.
 */
export async function getById(
  id: string | number
): Promise<ApiResponse<AuditLog>> {
  const response = await getAll({ page: 1, limit: 100 });
  const item = response.data.find(log => String(log.id) === String(id));

  if (!item) {
    throw new Error('Audit log not found');
  }

  return {
    status: 'success',
    data: item,
  };
}

export const auditAPI = {
  getAll,
  getById,
  getStats,
};
