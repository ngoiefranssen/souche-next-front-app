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

interface BackendEmploymentStatus {
  id: number;
  label: string;
  description: string | null;
  _count?: {
    users: number;
  };
}

interface BackendEmploymentStatusListResponse {
  status: 'success';
  data: BackendEmploymentStatus[];
  pagination: PaginatedResponse<EmploymentStatus>['pagination'];
}

const toEmploymentStatus = (
  status: BackendEmploymentStatus
): EmploymentStatus => ({
  id: status.id,
  label: status.label,
  description: status.description,
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
  _count: status._count,
});

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
  if (params.sortBy) queryParams.append('orderBy', params.sortBy);
  if (params.sortOrder)
    queryParams.append('order', params.sortOrder.toUpperCase());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/employment-statut/list/default?${queryString}`
    : '/employment-statut/list/default';

  const response =
    await apiClient.get<BackendEmploymentStatusListResponse>(endpoint);

  return {
    status: 'success',
    data: response.data.map(toEmploymentStatus),
    pagination: response.pagination,
  };
}

/**
 * Get a single employment status by ID
 */
export async function getById(
  id: number
): Promise<ApiResponse<EmploymentStatus>> {
  const response = await apiClient.get<{
    status: 'success';
    data: BackendEmploymentStatus;
  }>(`/employment-statut/one/${id}`);

  return {
    status: 'success',
    data: toEmploymentStatus(response.data),
  };
}

/**
 * Create a new employment status
 */
export async function create(
  data: EmploymentStatusInput
): Promise<ApiResponse<EmploymentStatus>> {
  const response = await apiClient.post<{
    status: 'success';
    data: BackendEmploymentStatus;
  }>('/employment-statut/create', data);

  return {
    status: 'success',
    data: toEmploymentStatus(response.data),
  };
}

/**
 * Update an existing employment status
 */
export async function update(
  id: number,
  data: Partial<EmploymentStatusInput>
): Promise<ApiResponse<EmploymentStatus>> {
  const response = await apiClient.patch<{
    status: 'success';
    data: BackendEmploymentStatus;
  }>(`/employment-statut/mod/${id}`, data);

  return {
    status: 'success',
    data: toEmploymentStatus(response.data),
  };
}

/**
 * Delete an employment status
 */
export async function deleteEmploymentStatus(
  id: number
): Promise<ApiResponse<void>> {
  return apiClient.delete<ApiResponse<void>>(`/employment-statut/move/${id}`);
}

export const employmentStatusAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmploymentStatus,
};
