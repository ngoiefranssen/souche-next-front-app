/**
 * Roles API service
 * Handles all role-related API operations
 */

import { apiClient } from '../client';
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

interface BackendRole {
  id: number;
  label: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  _count?: {
    profiles: number;
  };
}

interface BackendRoleListResponse {
  status: 'success';
  data: BackendRole[];
  pagination: PaginatedResponse<Role>['pagination'];
}

const toRole = (role: BackendRole): Role => ({
  id: role.id,
  label: role.label,
  description: role.description,
  createdAt: role.created_at || '',
  updatedAt: role.updated_at || '',
  deletedAt: null,
  _count: role._count,
});

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
  if (params.sortBy) queryParams.append('orderBy', params.sortBy);
  if (params.sortOrder)
    queryParams.append('order', params.sortOrder.toUpperCase());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/roles/list/default?${queryString}`
    : '/roles/list/default';

  const response = await apiClient.get<BackendRoleListResponse>(endpoint);

  return {
    status: 'success',
    data: response.data.map(toRole),
    pagination: response.pagination,
  };
}

/**
 * Get a single role by ID
 */
export async function getById(id: number): Promise<ApiResponse<Role>> {
  const response = await apiClient.get<{
    status: 'success';
    data: BackendRole;
  }>(`/roles/${id}`);

  return {
    status: 'success',
    data: toRole(response.data),
  };
}

/**
 * Create a new role
 */
export async function create(data: RoleInput): Promise<ApiResponse<Role>> {
  const response = await apiClient.post<{
    status: 'success';
    data: BackendRole;
  }>('/roles/create', data);

  return {
    status: 'success',
    data: toRole(response.data),
  };
}

/**
 * Update an existing role
 */
export async function update(
  id: number,
  data: Partial<RoleInput>
): Promise<ApiResponse<Role>> {
  const response = await apiClient.patch<{
    status: 'success';
    data: BackendRole;
  }>(`/roles/${id}`, data);

  return {
    status: 'success',
    data: toRole(response.data),
  };
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
