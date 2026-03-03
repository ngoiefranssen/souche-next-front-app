/**
 * Users API service
 * Handles all user-related API operations
 */

import { apiClient } from './client';
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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
    queryParams.append('profileId', params.profileId.toString());
  if (params.employmentStatusId)
    queryParams.append(
      'employmentStatusId',
      params.employmentStatusId.toString()
    );
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/users?${queryString}` : '/users';

  return apiClient.get<PaginatedResponse<UserListItem>>(endpoint);
}

/**
 * Get a single user by ID
 */
export async function getById(id: number): Promise<ApiResponse<User>> {
  return apiClient.get<ApiResponse<User>>(`/users/${id}`);
}

/**
 * Create a new user
 */
export async function create(data: UserFormData): Promise<ApiResponse<User>> {
  // If there's a profile photo, use FormData
  if (data.profilePhoto) {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('username', data.username);
    if (data.password) formData.append('password', data.password);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('phone', data.phone);
    formData.append('salary', data.salary.toString());
    formData.append('hireDate', data.hireDate.toISOString());
    formData.append('employmentStatusId', data.employmentStatusId.toString());
    formData.append('profileId', data.profileId.toString());
    formData.append('profilePhoto', data.profilePhoto);

    return apiClient.post<ApiResponse<User>>('/users', formData, {
      headers: {
        // Remove Content-Type to let browser set it with boundary
        'Content-Type': undefined as any,
      },
    });
  }

  // Otherwise, use JSON
  const jsonData = {
    email: data.email,
    username: data.username,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    salary: data.salary,
    hireDate: data.hireDate.toISOString(),
    employmentStatusId: data.employmentStatusId,
    profileId: data.profileId,
  };

  return apiClient.post<ApiResponse<User>>('/users', jsonData);
}

/**
 * Update an existing user
 */
export async function update(
  id: number,
  data: Partial<UserFormData>
): Promise<ApiResponse<User>> {
  // If there's a profile photo, use FormData
  if (data.profilePhoto) {
    const formData = new FormData();
    if (data.email) formData.append('email', data.email);
    if (data.username) formData.append('username', data.username);
    if (data.password) formData.append('password', data.password);
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.phone) formData.append('phone', data.phone);
    if (data.salary !== undefined)
      formData.append('salary', data.salary.toString());
    if (data.hireDate) formData.append('hireDate', data.hireDate.toISOString());
    if (data.employmentStatusId)
      formData.append('employmentStatusId', data.employmentStatusId.toString());
    if (data.profileId) formData.append('profileId', data.profileId.toString());
    formData.append('profilePhoto', data.profilePhoto);

    return apiClient.put<ApiResponse<User>>(`/users/${id}`, formData, {
      headers: {
        'Content-Type': undefined as any,
      },
    });
  }

  // Otherwise, use JSON
  const jsonData: any = {};
  if (data.email) jsonData.email = data.email;
  if (data.username) jsonData.username = data.username;
  if (data.password) jsonData.password = data.password;
  if (data.firstName) jsonData.firstName = data.firstName;
  if (data.lastName) jsonData.lastName = data.lastName;
  if (data.phone) jsonData.phone = data.phone;
  if (data.salary !== undefined) jsonData.salary = data.salary;
  if (data.hireDate) jsonData.hireDate = data.hireDate.toISOString();
  if (data.employmentStatusId)
    jsonData.employmentStatusId = data.employmentStatusId;
  if (data.profileId) jsonData.profileId = data.profileId;

  return apiClient.put<ApiResponse<User>>(`/users/${id}`, jsonData);
}

/**
 * Delete a user
 */
export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/users/${id}`);
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
