/**
 * Cached Profiles API service
 * Provides cached versions of profile API calls for reference data
 * Cache TTL: 5 minutes
 */

import { profilesAPI, ProfileQueryParams } from './profiles';
import { getCached, invalidateCache } from '@/lib/utils/cache';
import type { Profile, ProfileInput } from '@/types/profile';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'profiles';

/**
 * Get all profiles with caching
 * Results are cached for 5 minutes
 */
export async function getAllCached(
  params: ProfileQueryParams = {}
): Promise<PaginatedResponse<Profile>> {
  // Create cache key based on params
  const cacheKey = `${CACHE_KEY_PREFIX}:all:${JSON.stringify(params)}`;

  return getCached(cacheKey, () => profilesAPI.getAll(params), CACHE_TTL);
}

/**
 * Get a single profile by ID with caching
 */
export async function getByIdCached(id: number): Promise<ApiResponse<Profile>> {
  const cacheKey = `${CACHE_KEY_PREFIX}:${id}`;

  return getCached(cacheKey, () => profilesAPI.getById(id), CACHE_TTL);
}

/**
 * Create a new profile and invalidate cache
 */
export async function createAndInvalidate(
  data: ProfileInput
): Promise<ApiResponse<Profile>> {
  const result = await profilesAPI.create(data);

  // Invalidate all profile list caches
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Update a profile and invalidate cache
 */
export async function updateAndInvalidate(
  id: number,
  data: Partial<ProfileInput>
): Promise<ApiResponse<Profile>> {
  const result = await profilesAPI.update(id, data);

  // Invalidate specific profile and all list caches
  invalidateCache(`${CACHE_KEY_PREFIX}:${id}`);
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Delete a profile and invalidate cache
 */
export async function deleteAndInvalidate(
  id: number
): Promise<ApiResponse<void>> {
  const result = await profilesAPI.delete(id);

  // Invalidate specific profile and all list caches
  invalidateCache(`${CACHE_KEY_PREFIX}:${id}`);
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Manually invalidate all profile caches
 * Useful when you know data has changed externally
 */
export function invalidateProfileCache(): void {
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}`));
}

export const cachedProfilesAPI = {
  getAll: getAllCached,
  getById: getByIdCached,
  create: createAndInvalidate,
  update: updateAndInvalidate,
  delete: deleteAndInvalidate,
  invalidateCache: invalidateProfileCache,
};
