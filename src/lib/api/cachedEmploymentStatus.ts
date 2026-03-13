/**
 * Cached Employment Status API service
 * Provides cached versions of employment status API calls for reference data
 * Cache TTL: 5 minutes
 */

import {
  employmentStatusAPI,
  EmploymentStatusQueryParams,
} from './settings/employment-status';
import { getCached, invalidateCache } from '@/lib/utils/cache';
import type {
  EmploymentStatus,
  EmploymentStatusInput,
} from '@/types/employment-status';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'employment-status';

/**
 * Get all employment statuses with caching
 * Results are cached for 5 minutes
 */
export async function getAllCached(
  params: EmploymentStatusQueryParams = {}
): Promise<PaginatedResponse<EmploymentStatus>> {
  // Create cache key based on params
  const cacheKey = `${CACHE_KEY_PREFIX}:all:${JSON.stringify(params)}`;

  return getCached(
    cacheKey,
    () => employmentStatusAPI.getAll(params),
    CACHE_TTL
  );
}

/**
 * Get a single employment status by ID with caching
 */
export async function getByIdCached(
  id: number
): Promise<ApiResponse<EmploymentStatus>> {
  const cacheKey = `${CACHE_KEY_PREFIX}:${id}`;

  return getCached(cacheKey, () => employmentStatusAPI.getById(id), CACHE_TTL);
}

/**
 * Create a new employment status and invalidate cache
 */
export async function createAndInvalidate(
  data: EmploymentStatusInput
): Promise<ApiResponse<EmploymentStatus>> {
  const result = await employmentStatusAPI.create(data);

  // Invalidate all employment status list caches
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Update an employment status and invalidate cache
 */
export async function updateAndInvalidate(
  id: number,
  data: Partial<EmploymentStatusInput>
): Promise<ApiResponse<EmploymentStatus>> {
  const result = await employmentStatusAPI.update(id, data);

  // Invalidate specific employment status and all list caches
  invalidateCache(`${CACHE_KEY_PREFIX}:${id}`);
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Delete an employment status and invalidate cache
 */
export async function deleteAndInvalidate(
  id: number
): Promise<ApiResponse<void>> {
  const result = await employmentStatusAPI.delete(id);

  // Invalidate specific employment status and all list caches
  invalidateCache(`${CACHE_KEY_PREFIX}:${id}`);
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Manually invalidate all employment status caches
 * Useful when you know data has changed externally
 */
export function invalidateEmploymentStatusCache(): void {
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}`));
}

export const cachedEmploymentStatusAPI = {
  getAll: getAllCached,
  getById: getByIdCached,
  create: createAndInvalidate,
  update: updateAndInvalidate,
  delete: deleteAndInvalidate,
  invalidateCache: invalidateEmploymentStatusCache,
};
