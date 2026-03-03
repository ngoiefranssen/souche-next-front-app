/**
 * Audit API service
 * Handles all audit log-related API operations
 */

import { apiClient } from './client';
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
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  if (params.resource) queryParams.append('resource', params.resource);
  if (params.success !== undefined)
    queryParams.append('success', params.success.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/audit?${queryString}` : '/audit';

  return apiClient.get<PaginatedResponse<AuditLog>>(endpoint);
}

/**
 * Get a single audit log by ID
 */
export async function getById(id: number): Promise<ApiResponse<AuditLog>> {
  return apiClient.get<ApiResponse<AuditLog>>(`/audit/${id}`);
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

  return apiClient.get<ApiResponse<AuditStats>>(endpoint);
}

export const auditAPI = {
  getAll,
  getById,
  getStats,
};
