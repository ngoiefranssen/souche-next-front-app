/**
 * Employment Status API service
 * Handles all employment status-related API operations
 */

import { apiClient } from './client';
import type {
  EmploymentStatus,
  EmploymentStatusInput,
} from '@/types/employment-status';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

/**
 * Query parameters for employment status list
 */
export interface EmploymentStatusQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all employment statuses with pagination and filters
 */
export async function getAll(
  params: EmploymentStatusQueryParams = {}
): Promise<PaginatedResponse<EmploymentStatus>> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/employment-statut?${queryString}`
    : '/employment-statut';

  return apiClient.get<PaginatedResponse<EmploymentStatus>>(endpoint);
}

/**
 * Get a single employment status by ID
 */
export async function getById(
  id: number
): Promise<ApiResponse<EmploymentStatus>> {
  return apiClient.get<ApiResponse<EmploymentStatus>>(
    `/employment-statut/${id}`
  );
}

/**
 * Create a new employment status
 */
export async function create(
  data: EmploymentStatusInput
): Promise<ApiResponse<EmploymentStatus>> {
  return apiClient.post<ApiResponse<EmploymentStatus>>(
    '/employment-statut',
    data
  );
}

/**
 * Update an existing employment status
 */
export async function update(
  id: number,
  data: Partial<EmploymentStatusInput>
): Promise<ApiResponse<EmploymentStatus>> {
  return apiClient.put<ApiResponse<EmploymentStatus>>(
    `/employment-statut/${id}`,
    data
  );
}

/**
 * Delete an employment status
 */
export async function deleteEmploymentStatus(
  id: number
): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/employment-statut/${id}`);
}

export const employmentStatusAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmploymentStatus,
};
