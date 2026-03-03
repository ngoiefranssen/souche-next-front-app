/**
 * Cached Roles API service
 * Provides cached versions of role API calls for reference data
 * Cache TTL: 5 minutes
 */

import { rolesAPI, RoleQueryParams } from './roles';
import { getCached, invalidateCache } from '@/lib/utils/cache';
import type { Role, RoleInput } from '@/types/role';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'roles';

/**
 * Get all roles with caching
 * Results are cached for 5 minutes
 */
export async function getAllCached(
  params: RoleQueryParams = {}
): Promise<PaginatedResponse<Role>> {
  // Create cache key based on params
  const cacheKey = `${CACHE_KEY_PREFIX}:all:${JSON.stringify(params)}`;

  return getCached(cacheKey, () => rolesAPI.getAll(params), CACHE_TTL);
}

/**
 * Get a single role by ID with caching
 */
export async function getByIdCached(id: number): Promise<ApiResponse<Role>> {
  const cacheKey = `${CACHE_KEY_PREFIX}:${id}`;

  return getCached(cacheKey, () => rolesAPI.getById(id), CACHE_TTL);
}

/**
 * Create a new role and invalidate cache
 */
export async function createAndInvalidate(
  data: RoleInput
): Promise<ApiResponse<Role>> {
  const result = await rolesAPI.create(data);

  // Invalidate all role list caches
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Update a role and invalidate cache
 */
export async function updateAndInvalidate(
  id: number,
  data: Partial<RoleInput>
): Promise<ApiResponse<Role>> {
  const result = await rolesAPI.update(id, data);

  // Invalidate specific role and all list caches
  invalidateCache(`${CACHE_KEY_PREFIX}:${id}`);
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Delete a role and invalidate cache
 */
export async function deleteAndInvalidate(
  id: number
): Promise<ApiResponse<void>> {
  const result = await rolesAPI.delete(id);

  // Invalidate specific role and all list caches
  invalidateCache(`${CACHE_KEY_PREFIX}:${id}`);
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}:all`));

  return result;
}

/**
 * Manually invalidate all role caches
 * Useful when you know data has changed externally
 */
export function invalidateRoleCache(): void {
  invalidateCache(new RegExp(`^${CACHE_KEY_PREFIX}`));
}

export const cachedRolesAPI = {
  getAll: getAllCached,
  getById: getByIdCached,
  create: createAndInvalidate,
  update: updateAndInvalidate,
  delete: deleteAndInvalidate,
  invalidateCache: invalidateRoleCache,
};
