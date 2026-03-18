'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { apiClient } from '@/lib/api/client';
import { logError } from '@/lib/utils/errorLogger';
import { getAuthToken } from '@/utils/auth/tokenManager';

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
  clearPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

// Cache configuration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = 'user-permissions';
const CACHE_TIMESTAMP_KEY = 'user-permissions-timestamp';

const RESOURCE_ALIASES: Record<string, string> = {
  user: 'users',
  users: 'users',
  role: 'roles',
  roles: 'roles',
  profil: 'profiles',
  profils: 'profiles',
  profile: 'profiles',
  profiles: 'profiles',
  permission: 'permissions',
  permissions: 'permissions',
  'employment-status': 'employment-status',
  'employment-statut': 'employment-status',
  employment_status: 'employment-status',
  employmentstatus: 'employment-status',
  'audit-log': 'audit',
  'audit-logs': 'audit',
  audit: 'audit',
  audits: 'audit',
};

const ACTION_ALIASES: Record<string, string> = {
  read: 'read',
  list: 'read',
  view: 'read',
  show: 'read',
  get: 'read',
  create: 'create',
  add: 'create',
  new: 'create',
  post: 'create',
  update: 'update',
  edit: 'update',
  modify: 'update',
  patch: 'update',
  put: 'update',
  write: 'update',
  delete: 'delete',
  remove: 'delete',
  destroy: 'delete',
  manage: 'manage',
  all: '*',
  '*': '*',
};

const SUPER_ADMIN_TOKENS = new Set([
  'super-admin',
  'super_admin',
  'superadmin',
  'administrator',
  'root',
]);

const SUPER_ADMIN_PERMISSIONS = new Set([
  '*',
  '*:*',
  'system:*',
  'all:*',
  'admin:*',
  'root:*',
  'super-admin:*',
  'super_admin:*',
  'superadmin:*',
]);

const normalizeToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/\/+/g, ':')
    .replace(/\.{1,}/g, ':')
    .replace(/-{2,}/g, '-');

const normalizeResource = (resource: string): string => {
  const normalized = normalizeToken(resource).replace(/:/g, '-');
  return RESOURCE_ALIASES[normalized] || normalized;
};

const normalizeAction = (action: string): string => {
  const normalized = normalizeToken(action).replace(/:/g, '-');
  return ACTION_ALIASES[normalized] || normalized;
};

const normalizePermission = (permission: string): string => {
  const raw = normalizeToken(permission);
  if (!raw) return '';

  if (SUPER_ADMIN_TOKENS.has(raw) || SUPER_ADMIN_PERMISSIONS.has(raw)) {
    return raw;
  }

  const [resourcePart, actionPart] = raw.includes(':')
    ? raw.split(':', 2)
    : [raw, ''];

  if (!actionPart) {
    return normalizeResource(resourcePart);
  }

  return `${normalizeResource(resourcePart)}:${normalizeAction(actionPart)}`;
};

const parseNormalizedPermission = (
  permission: string
): { resource: string; action: string } => {
  if (!permission.includes(':')) {
    return { resource: permission, action: '' };
  }

  const [resource, action] = permission.split(':', 2);
  return { resource, action };
};

const hasGlobalPermission = (permissionSet: Set<string>): boolean => {
  for (const wildcard of SUPER_ADMIN_PERMISSIONS) {
    if (permissionSet.has(wildcard)) {
      return true;
    }
  }

  for (const token of SUPER_ADMIN_TOKENS) {
    if (permissionSet.has(token)) {
      return true;
    }
  }

  return false;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizedPermissionSet = useMemo(
    () =>
      new Set(permissions.map(permission => normalizePermission(permission))),
    [permissions]
  );

  const hasPermissionMatch = useCallback(
    (requiredPermission: string): boolean => {
      const normalizedRequired = normalizePermission(requiredPermission);
      if (!normalizedRequired) {
        return false;
      }

      // Super admin/global wildcard permissions
      if (hasGlobalPermission(normalizedPermissionSet)) {
        return true;
      }

      // Exact permission after backend/frontend normalization
      if (normalizedPermissionSet.has(normalizedRequired)) {
        return true;
      }

      // Resource wildcard (e.g. "users:*" or "users:manage")
      const { resource } = parseNormalizedPermission(normalizedRequired);
      if (!resource) {
        return false;
      }

      return (
        normalizedPermissionSet.has(`${resource}:*`) ||
        normalizedPermissionSet.has(`${resource}:manage`)
      );
    },
    [normalizedPermissionSet]
  );

  const hasAuthToken = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return Boolean(getAuthToken());
  }, []);

  /**
   * Check if cached permissions are still valid
   */
  const isCacheValid = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge < CACHE_DURATION;
  }, []);

  /**
   * Load permissions from cache
   */
  const loadFromCache = useCallback((): string[] | null => {
    if (typeof window === 'undefined') return null;

    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (error) {
      logError(error as Error, { context: 'loadFromCache' });
      return null;
    }
  }, []);

  /**
   * Save permissions to cache
   */
  const saveToCache = useCallback((perms: string[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(perms));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      logError(error as Error, { context: 'saveToCache' });
    }
  }, []);

  /**
   * Clear permissions cache
   */
  const clearCache = useCallback((): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  }, []);

  /**
   * Fetch permissions from backend
   */
  const fetchPermissions = useCallback(async (): Promise<string[]> => {
    if (!hasAuthToken()) {
      return [];
    }

    try {
      // Call GET /api/v1/users/me/permissions
      const response = await apiClient.get<{ data: string[] }>(
        '/users/me/permissions'
      );
      return response.data || [];
    } catch (error) {
      logError(error as Error, { context: 'fetchPermissions' });

      // If authentication error, clear cache and return empty array
      if (error instanceof Error && error.message.includes('401')) {
        clearCache();
        return [];
      }

      // For other errors, try to use cached data as fallback
      const cached = loadFromCache();
      return cached || [];
    }
  }, [clearCache, hasAuthToken, loadFromCache]);

  /**
   * Refresh permissions from backend
   * This function can be called manually to force a refresh
   */
  const refreshPermissions = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      if (!hasAuthToken()) {
        setPermissions([]);
        clearCache();
        return;
      }

      const perms = await fetchPermissions();
      setPermissions(perms);
      saveToCache(perms);
    } finally {
      setLoading(false);
    }
  }, [clearCache, fetchPermissions, hasAuthToken, saveToCache]);

  /**
   * Clear permissions from state and cache
   * This should be called on logout
   */
  const clearPermissions = useCallback((): void => {
    setPermissions([]);
    clearCache();
  }, [clearCache]);

  /**
   * Load permissions on mount
   * Use cache if valid, otherwise fetch from backend
   */
  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);

      try {
        // Skip protected permission calls when user is not authenticated
        if (!hasAuthToken()) {
          setPermissions([]);
          clearCache();
          setLoading(false);
          return;
        }

        // Check if we have valid cached permissions
        if (isCacheValid()) {
          const cached = loadFromCache();
          if (cached) {
            setPermissions(cached);
            setLoading(false);
            return;
          }
        }

        // Cache is invalid or doesn't exist, fetch from backend
        const perms = await fetchPermissions();
        setPermissions(perms);
        saveToCache(perms);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [
    clearCache,
    fetchPermissions,
    hasAuthToken,
    isCacheValid,
    loadFromCache,
    saveToCache,
  ]);

  /**
   * Listen for auth events to refresh or clear permissions
   */
  useEffect(() => {
    const handleLogin = () => {
      // Refresh permissions after login
      refreshPermissions();
    };

    const handleLogout = () => {
      // Clear permissions after logout
      clearPermissions();
    };

    // Add event listeners
    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);

    // Cleanup
    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [refreshPermissions, clearPermissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return hasPermissionMatch(permission);
    },
    [hasPermissionMatch]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      return perms.some(permission => hasPermissionMatch(permission));
    },
    [hasPermissionMatch]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      return perms.every(permission => hasPermissionMatch(permission));
    },
    [hasPermissionMatch]
  );

  const value: PermissionContextType = {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
    clearPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Hook to access permission context
 * Must be used within a PermissionProvider
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
