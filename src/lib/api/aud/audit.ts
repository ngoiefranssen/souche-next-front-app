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
  severity?: string;
  startDate?: string;
  endDate?: string;
}

interface BackendAuditLogsResponse {
  status: 'success';
  data: {
    logs: AuditLog[];
    pagination: PaginatedResponse<AuditLog>['pagination'];
  };
}

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
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/audit/logs?${queryString}` : '/audit/logs';

  const response = await apiClient.get<BackendAuditLogsResponse>(endpoint);

  return {
    status: 'success',
    data: response.data.logs,
    pagination: {
      ...response.data.pagination,
      hasNextPage:
        response.data.pagination.page < response.data.pagination.totalPages,
      hasPreviousPage: response.data.pagination.page > 1,
    },
  };
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

  const response = await apiClient.get<{ status: 'success'; data: AuditStats }>(
    endpoint
  );

  return {
    status: 'success',
    data: response.data,
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
