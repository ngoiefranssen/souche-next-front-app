/**
 * Users API service
 * Handles all user-related API operations
 */

import { apiClient } from '../client';
import type { User, UserListItem, UserFormData } from '@/types/user';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

/**
 * Query parameters for user list
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  profileId?: number;
  employmentStatusId?: number;
}

interface BackendUserListItem {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone?: string | null;
  profilePhoto?: string | null;
  profileId?: number | null;
  profileLabel?: string | null;
  employmentStatusId?: number | null;
  employmentStatusLabel?: string | null;
  hireDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendListUsersResponse {
  status: 'success';
  data: BackendUserListItem[];
  pagination: PaginatedResponse<UserListItem>['pagination'];
}

interface BackendUserResponse {
  status: 'success';
  data: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    phone?: string | null;
    profilePhoto?: string | null;
    salary?: number | null;
    hireDate?: string | null;
    employmentStatusId?: number | null;
    profileId?: number | null;
    employmentStatus?: {
      id: number;
      label: string;
      description?: string | null;
    } | null;
    profile?: {
      id: number;
      label: string;
      description?: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  };
}

const toUserListItem = (item: BackendUserListItem): UserListItem => ({
  id: item.id,
  email: item.email,
  username: item.username,
  firstName: item.firstName,
  lastName: item.lastName,
  isActive: item.isActive,
  phone: item.phone,
  profilePhoto: item.profilePhoto,
  profileId: item.profileId,
  employmentStatusId: item.employmentStatusId,
  profileLabel: item.profileLabel,
  employmentStatusLabel: item.employmentStatusLabel,
  hireDate: item.hireDate,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  profile: item.profileId
    ? {
        id: item.profileId,
        label: item.profileLabel || 'N/A',
      }
    : null,
  employmentStatus: item.employmentStatusId
    ? {
        id: item.employmentStatusId,
        label: item.employmentStatusLabel || 'N/A',
      }
    : null,
});

const toUser = (payload: BackendUserResponse['data']): User => ({
  id: payload.id,
  email: payload.email,
  username: payload.username,
  firstName: payload.firstName,
  lastName: payload.lastName,
  isActive: payload.isActive,
  phone: payload.phone,
  profilePhoto: payload.profilePhoto,
  salary: payload.salary,
  hireDate: payload.hireDate,
  employmentStatusId: payload.employmentStatusId,
  profileId: payload.profileId,
  employmentStatus: payload.employmentStatus
    ? {
        id: payload.employmentStatus.id,
        label: payload.employmentStatus.label,
        description: payload.employmentStatus.description || null,
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
      }
    : null,
  profile: payload.profile
    ? {
        id: payload.profile.id,
        label: payload.profile.label,
        description: payload.profile.description || null,
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
      }
    : null,
  createdAt: payload.createdAt,
  updatedAt: payload.updatedAt,
});

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const buildUserPayload = (
  data: Partial<UserFormData>,
  includeRequiredFields: boolean
): FormData => {
  const formData = new FormData();

  const appendString = (key: string, value?: string | number | null) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  };
  const appendBoolean = (key: string, value?: boolean) => {
    if (value === undefined) return;
    formData.append(key, value ? 'true' : 'false');
  };

  if (includeRequiredFields || data.email !== undefined) {
    appendString('email', data.email);
  }
  if (includeRequiredFields || data.username !== undefined) {
    appendString('username', data.username);
  }
  if (includeRequiredFields || data.password !== undefined) {
    appendString('password', data.password);
  }
  if (includeRequiredFields || data.firstName !== undefined) {
    appendString('first_name', data.firstName);
  }
  if (includeRequiredFields || data.lastName !== undefined) {
    appendString('last_name', data.lastName);
  }
  if (includeRequiredFields || data.phone !== undefined) {
    appendString('phone', data.phone);
  }
  if (includeRequiredFields || data.salary !== undefined) {
    appendString('salary', data.salary);
  }
  if ((includeRequiredFields || data.hireDate !== undefined) && data.hireDate) {
    appendString('hire_date', toDateOnly(data.hireDate));
  }
  if (includeRequiredFields || data.employmentStatusId !== undefined) {
    appendString('employment_status_id', data.employmentStatusId);
  }
  if (includeRequiredFields || data.profileId !== undefined) {
    appendString('profile_id', data.profileId);
  }
  if (includeRequiredFields || data.isActive !== undefined) {
    appendBoolean('is_active', data.isActive);
  }

  if (data.profilePhoto instanceof File) {
    formData.append('profile_photo', data.profilePhoto);
  }

  return formData;
};

/**
 * Get all users with pagination and filters
 */
export async function getAll(
  params: UserQueryParams = {}
): Promise<PaginatedResponse<UserListItem>> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.profileId)
    queryParams.append('profil', params.profileId.toString());
  if (params.employmentStatusId)
    queryParams.append('statut', params.employmentStatusId.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/users/all/data/default?${queryString}`
    : '/users/all/data/default';

  const response = await apiClient.get<BackendListUsersResponse>(endpoint);

  return {
    status: 'success',
    data: response.data.map(toUserListItem),
    pagination: response.pagination,
  };
}

/**
 * Get a single user by ID
 */
export async function getById(id: number): Promise<ApiResponse<User>> {
  const response = await apiClient.get<BackendUserResponse>(
    `/users/one/data/${id}`
  );

  return {
    status: 'success',
    data: toUser(response.data),
  };
}

/**
 * Create a new user
 */
export async function create(data: UserFormData): Promise<ApiResponse<User>> {
  const payload = buildUserPayload(data, true);

  const response = await apiClient.post<BackendUserResponse>(
    '/users/register/default',
    payload
  );

  return {
    status: 'success',
    message: response.status,
    data: toUser(response.data),
  };
}

/**
 * Update an existing user
 */
export async function update(
  id: number,
  data: Partial<UserFormData>
): Promise<ApiResponse<User>> {
  const payload = buildUserPayload(data, false);

  const response = await apiClient.patch<BackendUserResponse>(
    `/users/updated/data/${id}`,
    payload
  );

  if (!response.data) {
    return {
      status: 'success',
      message: response.status,
    };
  }

  return {
    status: 'success',
    message: response.status,
    data: toUser(response.data),
  };
}

/**
 * Delete a user
 */
export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/users/removeded/one/data/${id}`);
}

/**
 * Get current user's permissions
 */
export async function getMyPermissions(): Promise<ApiResponse<string[]>> {
  return apiClient.get<ApiResponse<string[]>>('/users/me/permissions');
}

export const usersAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deleteUser,
  getMyPermissions,
};
