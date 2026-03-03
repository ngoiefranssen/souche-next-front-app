/**
 * Permissions API service
 * Handles all permission-related API operations
 */

import { apiClient } from './client';
import type {
  Permission,
  PermissionInput,
  PermissionAssignment,
} from '@/types/permission';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

/**
 * Query parameters for permission list
 */
export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  action?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all permissions with pagination and filters
 */
export async function getAll(
  params: PermissionQueryParams = {}
): Promise<PaginatedResponse<Permission>> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.resource) queryParams.append('resource', params.resource);
  if (params.action) queryParams.append('action', params.action);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/permissions?${queryString}` : '/permissions';

  return apiClient.get<PaginatedResponse<Permission>>(endpoint);
}

/**
 * Get a single permission by ID
 */
export async function getById(id: number): Promise<ApiResponse<Permission>> {
  return apiClient.get<ApiResponse<Permission>>(`/permissions/${id}`);
}

/**
 * Create a new permission
 */
export async function create(
  data: PermissionInput
): Promise<ApiResponse<Permission>> {
  return apiClient.post<ApiResponse<Permission>>('/permissions', data);
}

/**
 * Update an existing permission
 */
export async function update(
  id: number,
  data: Partial<PermissionInput>
): Promise<ApiResponse<Permission>> {
  return apiClient.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
}

/**
 * Delete a permission
 */
export async function deletePermission(id: number): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/permissions/${id}`);
}

/**
 * Get permissions for a specific role
 */
export async function getByRoleId(
  roleId: number
): Promise<ApiResponse<Permission[]>> {
  return apiClient.get<ApiResponse<Permission[]>>(
    `/permissions/role/${roleId}`
  );
}

/**
 * Assign a permission to a role
 */
export async function assign(data: {
  roleId: number;
  permissionId: number;
}): Promise<ApiResponse<PermissionAssignment>> {
  return apiClient.post<ApiResponse<PermissionAssignment>>(
    '/permissions/assign',
    data
  );
}

/**
 * Revoke a permission from a role
 */
export async function revoke(data: {
  roleId: number;
  permissionId: number;
}): Promise<ApiResponse<void>> {
  return apiClient.post<ApiResponse<void>>('/permissions/revoke', data);
}

export const permissionsAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deletePermission,
  getByRoleId,
  assign,
  revoke,
};
