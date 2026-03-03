/**
 * Roles API service
 * Handles all role-related API operations
 */

import { apiClient } from './client';
import type { Role, RoleInput } from '@/types/role';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

/**
 * Query parameters for role list
 */
export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all roles with pagination and filters
 */
export async function getAll(
  params: RoleQueryParams = {}
): Promise<PaginatedResponse<Role>> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/roles?${queryString}` : '/roles';

  return apiClient.get<PaginatedResponse<Role>>(endpoint);
}

/**
 * Get a single role by ID
 */
export async function getById(id: number): Promise<ApiResponse<Role>> {
  return apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
}

/**
 * Create a new role
 */
export async function create(data: RoleInput): Promise<ApiResponse<Role>> {
  return apiClient.post<ApiResponse<Role>>('/roles', data);
}

/**
 * Update an existing role
 */
export async function update(
  id: number,
  data: Partial<RoleInput>
): Promise<ApiResponse<Role>> {
  return apiClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
}

/**
 * Delete a role
 */
export async function deleteRole(id: number): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/roles/${id}`);
}

export const rolesAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deleteRole,
};
