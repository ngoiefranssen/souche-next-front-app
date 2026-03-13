/**
 * Profiles API service
 * Handles all profile-related API operations
 */

import { apiClient } from '../client';
import type { Profile, ProfileInput } from '@/types/profile';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

/**
 * Query parameters for profile list
 */
export interface ProfileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface BackendProfile {
  id: number;
  label: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  _count?: {
    users: number;
  };
}

interface BackendProfileListResponse {
  status: 'success';
  data: BackendProfile[];
  pagination: PaginatedResponse<Profile>['pagination'];
}

const toProfile = (profile: BackendProfile): Profile => ({
  id: profile.id,
  label: profile.label,
  description: profile.description,
  createdAt: profile.created_at || '',
  updatedAt: profile.updated_at || '',
  deletedAt: profile.deleted_at || null,
  _count: profile._count,
});

/**
 * Get all profiles with pagination and filters
 */
export async function getAll(
  params: ProfileQueryParams = {}
): Promise<PaginatedResponse<Profile>> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('orderBy', params.sortBy);
  if (params.sortOrder)
    queryParams.append('order', params.sortOrder.toUpperCase());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/profils/list/default?${queryString}`
    : '/profils/list/default';

  const response = await apiClient.get<BackendProfileListResponse>(endpoint);

  return {
    status: 'success',
    data: response.data.map(toProfile),
    pagination: response.pagination,
  };
}

/**
 * Get a single profile by ID
 */
export async function getById(id: number): Promise<ApiResponse<Profile>> {
  const response = await apiClient.get<{
    status: 'success';
    data: BackendProfile;
  }>(`/profils/${id}`);

  return {
    status: 'success',
    data: toProfile(response.data),
  };
}

/**
 * Create a new profile
 */
export async function create(
  data: ProfileInput
): Promise<ApiResponse<Profile>> {
  const response = await apiClient.post<{
    status: 'success';
    data: BackendProfile;
  }>('/profils/create', data);

  return {
    status: 'success',
    data: toProfile(response.data),
  };
}

/**
 * Update an existing profile
 */
export async function update(
  id: number,
  data: Partial<ProfileInput>
): Promise<ApiResponse<Profile>> {
  const response = await apiClient.patch<{
    status: 'success';
    data: BackendProfile;
  }>(`/profils/${id}`, data);

  return {
    status: 'success',
    data: toProfile(response.data),
  };
}

/**
 * Delete a profile
 */
export async function deleteProfile(id: number): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/profils/${id}`);
}

export const profilesAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deleteProfile,
};
