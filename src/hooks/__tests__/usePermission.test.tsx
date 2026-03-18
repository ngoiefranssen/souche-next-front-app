import { renderHook, waitFor } from '@testing-library/react';
import { usePermission } from '../usePermission';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { apiClient } from '@/lib/api/client';
import { getAuthToken } from '@/utils/auth/tokenManager';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('@/utils/auth/tokenManager', () => ({
  getAuthToken: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (getAuthToken as jest.Mock).mockReturnValue('test-token');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PermissionProvider>{children}</PermissionProvider>
  );

  describe('hasPermission', () => {
    it('should return true when user has the permission', async () => {
      const mockPermissions = ['users:read', 'users:create', 'roles:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:create')).toBe(true);
      expect(result.current.hasPermission('roles:read')).toBe(true);
    });

    it('should return false when user does not have the permission', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('users:delete')).toBe(false);
      expect(result.current.hasPermission('roles:create')).toBe(false);
    });

    it('should return false for empty permission string', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one of the permissions', async () => {
      const mockPermissions = ['users:read', 'roles:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(
        result.current.hasAnyPermission(['users:read', 'users:create'])
      ).toBe(true);
      expect(
        result.current.hasAnyPermission(['roles:read', 'roles:create'])
      ).toBe(true);
    });

    it('should return false when user has none of the permissions', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(
        result.current.hasAnyPermission(['users:create', 'users:delete'])
      ).toBe(false);
    });

    it('should return false for empty array', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasAnyPermission([])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all of the permissions', async () => {
      const mockPermissions = ['users:read', 'users:create', 'roles:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(
        result.current.hasAllPermissions(['users:read', 'users:create'])
      ).toBe(true);
      expect(result.current.hasAllPermissions(['users:read'])).toBe(true);
    });

    it('should return false when user is missing at least one permission', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(
        result.current.hasAllPermissions(['users:read', 'users:create'])
      ).toBe(false);
    });

    it('should return true for empty array', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });

  describe('permissions array', () => {
    it('should return the complete list of permissions', async () => {
      const mockPermissions = ['users:read', 'users:create', 'roles:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.permissions).toEqual(mockPermissions);
    });

    it('should return empty array when no permissions', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [],
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.permissions).toEqual([]);
    });
  });

  describe('loading state', () => {
    it('should start with loading true', () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: ['users:read'],
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after permissions are loaded', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: ['users:read'],
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false even when API fails', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.permissions).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should throw error when used outside PermissionProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePermission());
      }).toThrow('usePermissions must be used within a PermissionProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in permission strings', async () => {
      const mockPermissions = ['users:read', 'special-resource:action'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('special-resource:action')).toBe(
        true
      );
    });

    it('should handle duplicate permissions in the array', async () => {
      const mockPermissions = ['users:read', 'users:read', 'roles:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.permissions).toEqual(mockPermissions);
    });

    it('should normalize case for permission checks', async () => {
      const mockPermissions = ['users:read'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      // Wait for permissions to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('Users:Read')).toBe(true);
      expect(result.current.hasPermission('USERS:READ')).toBe(true);
    });

    it('should normalize backend resource aliases', async () => {
      const mockPermissions = ['profils:update', 'employment-statut:delete'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('profiles:update')).toBe(true);
      expect(result.current.hasPermission('employment-status:delete')).toBe(
        true
      );
    });

    it('should grant all permissions to super admin markers', async () => {
      const mockPermissions = ['super-admin'];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPermissions,
      });

      const { result } = renderHook(() => usePermission(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission('users:update')).toBe(true);
      expect(result.current.hasPermission('profiles:delete')).toBe(true);
      expect(result.current.hasPermission('permissions:create')).toBe(true);
    });
  });
});
