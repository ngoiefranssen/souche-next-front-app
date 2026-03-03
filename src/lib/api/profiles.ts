/**
 * Profiles API service
 * Handles all profile-related API operations
 */

import { apiClient } from './client';
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
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/profils?${queryString}` : '/profils';

  return apiClient.get<PaginatedResponse<Profile>>(endpoint);
}

/**
 * Get a single profile by ID
 */
export async function getById(id: number): Promise<ApiResponse<Profile>> {
  return apiClient.get<ApiResponse<Profile>>(`/profils/${id}`);
}

/**
 * Create a new profile
 */
export async function create(
  data: ProfileInput
): Promise<ApiResponse<Profile>> {
  return apiClient.post<ApiResponse<Profile>>('/profils', data);
}

/**
 * Update an existing profile
 */
export async function update(
  id: number,
  data: Partial<ProfileInput>
): Promise<ApiResponse<Profile>> {
  return apiClient.put<ApiResponse<Profile>>(`/profils/${id}`, data);
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
