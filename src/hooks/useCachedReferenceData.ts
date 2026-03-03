/**
 * Hook for fetching and caching reference data
 * Automatically caches profiles, roles, and employment statuses for 5 minutes
 *
 * @example
 * const { profiles, roles, statuses, loading, error, refetch } = useCachedReferenceData();
 */

import { useState, useEffect, useCallback } from 'react';
import { cachedProfilesAPI } from '@/lib/api/cachedProfiles';
import { cachedRolesAPI } from '@/lib/api/cachedRoles';
import { cachedEmploymentStatusAPI } from '@/lib/api/cachedEmploymentStatus';
import type { Profile } from '@/types/profile';
import type { Role } from '@/types/role';
import type { EmploymentStatus } from '@/types/employment-status';

interface ReferenceData {
  profiles: Profile[];
  roles: Role[];
  statuses: EmploymentStatus[];
}

interface UseCachedReferenceDataReturn {
  profiles: Profile[];
  roles: Role[];
  statuses: EmploymentStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch all reference data with caching
 * Data is cached for 5 minutes to reduce API calls
 */
export function useCachedReferenceData(): UseCachedReferenceDataReturn {
  const [data, setData] = useState<ReferenceData>({
    profiles: [],
    roles: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reference data in parallel
      // These calls will use cached data if available
      const [profilesResponse, rolesResponse, statusesResponse] =
        await Promise.all([
          cachedProfilesAPI.getAll({ limit: 100 }), // Get all profiles
          cachedRolesAPI.getAll({ limit: 100 }), // Get all roles
          cachedEmploymentStatusAPI.getAll({ limit: 100 }), // Get all statuses
        ]);

      setData({
        profiles: profilesResponse.data,
        roles: rolesResponse.data,
        statuses: statusesResponse.data,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch reference data';
      setError(errorMessage);
      console.error('Error fetching reference data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    profiles: data.profiles,
    roles: data.roles,
    statuses: data.statuses,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching only profiles with caching
 */
export function useCachedProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cachedProfilesAPI.getAll({ limit: 100 });
      setProfiles(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch profiles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, refetch: fetchProfiles };
}

/**
 * Hook for fetching only roles with caching
 */
export function useCachedRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cachedRolesAPI.getAll({ limit: 100 });
      setRoles(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch roles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, error, refetch: fetchRoles };
}

/**
 * Hook for fetching only employment statuses with caching
 */
export function useCachedEmploymentStatuses() {
  const [statuses, setStatuses] = useState<EmploymentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cachedEmploymentStatusAPI.getAll({ limit: 100 });
      setStatuses(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch employment statuses';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, loading, error, refetch: fetchStatuses };
}
