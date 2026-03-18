/**
 * Permissions API service
 * Handles all permission-related API operations
 */

import { apiClient } from '../client';
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
  category?: string;
}

interface BackendPermission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
  category?: string | null;
  priority?: number | null;
  isSystem?: boolean;
  conditions?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface BackendPermissionsResponse {
  success: boolean;
  count: number;
  data: BackendPermission[];
}

const toPermission = (permission: BackendPermission): Permission => ({
  id: permission.id,
  name: permission.name,
  resource: permission.resource,
  action: permission.action,
  description: permission.description || null,
  category: permission.category || null,
  priority: permission.priority ?? null,
  isSystem: permission.isSystem,
  conditions: permission.conditions || null,
  createdAt: permission.createdAt || permission.created_at,
  updatedAt: permission.updatedAt || permission.updated_at,
  deletedAt: permission.deleted_at || null,
});

/**
 * Get all permissions with pagination and filters
 */
export async function getAll(
  params: PermissionQueryParams = {}
): Promise<PaginatedResponse<Permission>> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.resource) queryParams.append('resource', params.resource);
  if (params.action) queryParams.append('action', params.action);
  if (params.category) queryParams.append('category', params.category);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/permissions?${queryString}` : '/permissions';

  const response = await apiClient.get<BackendPermissionsResponse>(endpoint);

  const page = params.page || 1;
  const limit = params.limit || 10;
  const start = (page - 1) * limit;
  const mapped = response.data.map(toPermission);
  const pagedData = mapped.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(mapped.length / limit));

  return {
    status: 'success',
    data: pagedData,
    pagination: {
      page,
      limit,
      total: mapped.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Get permissions grouped by category
 */
export async function getByCategory(): Promise<
  ApiResponse<Record<string, Permission[]>>
> {
  const response = await apiClient.get<{
    success: boolean;
    data: Record<string, BackendPermission[]>;
  }>('/permissions/by-category');

  const grouped = Object.entries(response.data).reduce<
    Record<string, Permission[]>
  >((acc, [category, permissions]) => {
    acc[category] = permissions.map(toPermission);
    return acc;
  }, {});

  return {
    status: 'success',
    data: grouped,
  };
}

/**
 * Get a single permission by ID
 */
export async function getById(id: number): Promise<ApiResponse<Permission>> {
  const response = await apiClient.get<{
    success: boolean;
    data: BackendPermission;
  }>(`/permissions/${id}`);

  return {
    status: 'success',
    data: toPermission(response.data),
  };
}

/**
 * Create a new permission
 */
export async function create(
  data: PermissionInput
): Promise<ApiResponse<Permission>> {
  const response = await apiClient.post<{
    success: boolean;
    data: BackendPermission;
  }>('/permissions', data);

  return {
    status: 'success',
    data: toPermission(response.data),
  };
}

/**
 * Update an existing permission
 */
export async function update(
  id: number,
  data: Partial<PermissionInput>
): Promise<ApiResponse<Permission>> {
  const response = await apiClient.put<{
    success: boolean;
    data: BackendPermission;
  }>(`/permissions/${id}`, data);

  return {
    status: 'success',
    data: toPermission(response.data),
  };
}

/**
 * Delete a permission
 */
export async function deletePermission(id: number): Promise<ApiResponse<void>> {
  await apiClient.delete<{ success: boolean; message: string }>(
    `/permissions/${id}`
  );

  return { status: 'success' };
}

/**
 * Get permissions for a specific role
 */
export async function getByRoleId(
  roleId: number
): Promise<ApiResponse<Permission[]>> {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      role: string;
      permissions: BackendPermission[];
    };
  }>(`/permissions/role/${roleId}`);

  return {
    status: 'success',
    data: response.data.permissions.map(toPermission),
  };
}

/**
 * Get direct permissions for a specific user
 */
export async function getByUserId(
  userId: number
): Promise<ApiResponse<Permission[]>> {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      user: string;
      permissions: BackendPermission[];
    };
  }>(`/permissions/user/${userId}`);

  return {
    status: 'success',
    data: response.data.permissions.map(toPermission),
  };
}

/**
 * Assign a permission to a role
 */
export async function assign(data: {
  roleId: number;
  permissionId: number;
}): Promise<ApiResponse<PermissionAssignment>> {
  await apiClient.post<{ success: boolean; message: string }>(
    '/permissions/assign',
    data
  );

  return {
    status: 'success',
    data: {
      roleId: data.roleId,
      permissionId: data.permissionId,
      assignedAt: new Date().toISOString(),
    },
  };
}

/**
 * Assign a permission directly to a user
 */
export async function assignToUser(data: {
  userId: number;
  permissionId: number;
}): Promise<
  ApiResponse<{ userId: number; permissionId: number; assignedAt: string }>
> {
  await apiClient.post<{ success: boolean; message: string }>(
    '/permissions/assign-user',
    data
  );

  return {
    status: 'success',
    data: {
      userId: data.userId,
      permissionId: data.permissionId,
      assignedAt: new Date().toISOString(),
    },
  };
}

/**
 * Revoke a permission from a role
 */
export async function revoke(data: {
  roleId: number;
  permissionId: number;
}): Promise<ApiResponse<void>> {
  await apiClient.post<{ success: boolean; message: string }>(
    '/permissions/revoke',
    data
  );

  return { status: 'success' };
}

/**
 * Revoke a direct permission from a user
 */
export async function revokeFromUser(data: {
  userId: number;
  permissionId: number;
}): Promise<ApiResponse<void>> {
  await apiClient.post<{ success: boolean; message: string }>(
    '/permissions/revoke-user',
    data
  );

  return { status: 'success' };
}

export const permissionsAPI = {
  getAll,
  getByCategory,
  getById,
  create,
  update,
  delete: deletePermission,
  getByRoleId,
  getByUserId,
  assign,
  assignToUser,
  revoke,
  revokeFromUser,
};
