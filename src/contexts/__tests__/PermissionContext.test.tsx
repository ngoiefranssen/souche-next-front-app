import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PermissionProvider, usePermissions } from '../PermissionContext';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// Mock the error logger
jest.mock('@/lib/utils/errorLogger', () => ({
  logError: jest.fn(),
}));

// Test component that uses the permission context
const TestComponent = () => {
  const {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="permissions">{JSON.stringify(permissions)}</div>
      <div data-testid="has-users-read">
        {hasPermission('users:read').toString()}
      </div>
      <div data-testid="has-any">
        {hasAnyPermission(['users:read', 'users:write']).toString()}
      </div>
      <div data-testid="has-all">
        {hasAllPermissions(['users:read', 'roles:read']).toString()}
      </div>
    </div>
  );
};

describe('PermissionContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should fetch and provide permissions', async () => {
    // Mock API response
    const mockPermissions = ['users:read', 'users:write', 'roles:read'];
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockPermissions,
    });

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.getByTestId('permissions')).toHaveTextContent(
        JSON.stringify(mockPermissions)
      );
    });

    // Verify API was called
    expect(apiClient.get).toHaveBeenCalledWith('/users/me/permissions');
  });

  it('should correctly check hasPermission', async () => {
    const mockPermissions = ['users:read', 'users:write'];
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockPermissions,
    });

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-users-read')).toHaveTextContent('true');
    });
  });

  it('should correctly check hasAnyPermission', async () => {
    const mockPermissions = ['users:read'];
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockPermissions,
    });

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    await waitFor(() => {
      // Has users:read, so should return true
      expect(screen.getByTestId('has-any')).toHaveTextContent('true');
    });
  });

  it('should correctly check hasAllPermissions', async () => {
    const mockPermissions = ['users:read', 'roles:read'];
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockPermissions,
    });

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    await waitFor(() => {
      // Has both users:read and roles:read
      expect(screen.getByTestId('has-all')).toHaveTextContent('true');
    });
  });

  it('should use cached permissions when cache is valid', async () => {
    const mockPermissions = ['users:read', 'users:write'];

    // Set up cache
    localStorage.setItem('user-permissions', JSON.stringify(mockPermissions));
    localStorage.setItem('user-permissions-timestamp', Date.now().toString());

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permissions')).toHaveTextContent(
        JSON.stringify(mockPermissions)
      );
    });

    // API should not be called when cache is valid
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should fetch new permissions when cache is expired', async () => {
    const cachedPermissions = ['users:read'];
    const freshPermissions = ['users:read', 'users:write', 'roles:read'];

    // Set up expired cache (6 minutes ago)
    const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
    localStorage.setItem('user-permissions', JSON.stringify(cachedPermissions));
    localStorage.setItem(
      'user-permissions-timestamp',
      sixMinutesAgo.toString()
    );

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: freshPermissions,
    });

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permissions')).toHaveTextContent(
        JSON.stringify(freshPermissions)
      );
    });

    // API should be called when cache is expired
    expect(apiClient.get).toHaveBeenCalledWith('/users/me/permissions');
  });

  it('should handle API errors gracefully', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <PermissionProvider>
        <TestComponent />
      </PermissionProvider>
    );

    await waitFor(() => {
      // Should show empty permissions on error
      expect(screen.getByTestId('permissions')).toHaveTextContent('[]');
    });
  });

  it('should throw error when usePermissions is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePermissions must be used within a PermissionProvider');

    consoleSpy.mockRestore();
  });
});
