/**
 * Unit tests for Permissions API service
 */

import { permissionsAPI } from '../permissions';
import { apiClient } from '../client';
import type { PermissionInput } from '@/types/permission';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const assertDefined = <T>(value: T | undefined): T => {
  expect(value).toBeDefined();
  if (value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
};

describe('Permissions API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /permissions without query params when no params provided', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/permissions');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /permissions with pagination params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            { id: 1, name: 'users:read', resource: 'users', action: 'read' },
            {
              id: 2,
              name: 'users:create',
              resource: 'users',
              action: 'create',
            },
          ],
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getAll({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/permissions?page=1&limit=10'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /permissions with search param', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await permissionsAPI.getAll({ search: 'users' });

      expect(apiClient.get).toHaveBeenCalledWith('/permissions?search=users');
    });

    it('should call GET /permissions with resource filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await permissionsAPI.getAll({ resource: 'roles' });

      expect(apiClient.get).toHaveBeenCalledWith('/permissions?resource=roles');
    });

    it('should call GET /permissions with action filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await permissionsAPI.getAll({ action: 'delete' });

      expect(apiClient.get).toHaveBeenCalledWith('/permissions?action=delete');
    });

    it('should call GET /permissions with category filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await permissionsAPI.getAll({
        category: 'user-management',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/permissions?category=user-management'
      );
    });

    it('should call GET /permissions with all params combined', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await permissionsAPI.getAll({
        page: 2,
        limit: 20,
        search: 'create',
        resource: 'users',
        action: 'create',
        category: 'user-management',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/permissions?search=create&resource=users&action=create&category=user-management'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should call GET /permissions/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          name: 'users:read',
          resource: 'users',
          action: 'read',
          description: 'Read user data',
          conditions: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/permissions/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Permission not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.getById(999)).rejects.toThrow(
        'Permission not found'
      );
    });
  });

  describe('create', () => {
    it('should call POST /permissions with permission data', async () => {
      const permissionData: PermissionInput = {
        name: 'users:update',
        resource: 'users',
        action: 'update',
        description: 'Update user information',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          ...permissionData,
          conditions: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.create(permissionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        permissionData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /permissions with ABAC conditions', async () => {
      const permissionData: PermissionInput = {
        name: 'users:update-own',
        resource: 'users',
        action: 'update',
        description: 'Update own user information',
        conditions: {
          ownerId: '${user.id}',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          ...permissionData,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await permissionsAPI.create(permissionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        permissionData
      );
    });

    it('should handle validation errors for invalid name format', async () => {
      const permissionData: PermissionInput = {
        name: 'invalid_format', // Should be resource:action
        resource: 'users',
        action: 'read',
      };

      const mockError = new Error(
        'Permission name must be in format resource:action'
      );
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.create(permissionData)).rejects.toThrow(
        'Permission name must be in format resource:action'
      );
    });

    it('should handle duplicate permission errors', async () => {
      const permissionData: PermissionInput = {
        name: 'users:read', // Already exists
        resource: 'users',
        action: 'read',
      };

      const mockError = new Error('Permission already exists');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.create(permissionData)).rejects.toThrow(
        'Permission already exists'
      );
    });
  });

  describe('update', () => {
    it('should call PUT /permissions/:id with updated data', async () => {
      const updateData: Partial<PermissionInput> = {
        description: 'Updated description',
        conditions: {
          department: 'engineering',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          name: 'users:read',
          resource: 'users',
          action: 'read',
          ...updateData,
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/permissions/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const updateData: Partial<PermissionInput> = {
        description: 'New description',
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await permissionsAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/permissions/1', updateData);
    });

    it('should handle 404 errors for non-existent permissions', async () => {
      const mockError = new Error('Permission not found');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(
        permissionsAPI.update(999, { description: 'Test' })
      ).rejects.toThrow('Permission not found');
    });
  });

  describe('delete', () => {
    it('should call DELETE /permissions/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: undefined,
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/permissions/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Permission not found');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.delete(999)).rejects.toThrow(
        'Permission not found'
      );
    });

    it('should handle constraint errors when permission is assigned', async () => {
      const mockError = new Error(
        'Cannot delete permission that is assigned to roles'
      );
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.delete(1)).rejects.toThrow(
        'Cannot delete permission that is assigned to roles'
      );
    });
  });

  describe('getByRoleId', () => {
    it('should call GET /permissions/role/:roleId with correct role ID', async () => {
      const mockResponse = {
        status: 'success',
        data: [
          { id: 1, name: 'users:read', resource: 'users', action: 'read' },
          { id: 2, name: 'users:create', resource: 'users', action: 'create' },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getByRoleId(1);

      expect(apiClient.get).toHaveBeenCalledWith('/permissions/role/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty permissions for a role', async () => {
      const mockResponse = {
        status: 'success',
        data: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getByRoleId(5);

      expect(result.data).toEqual([]);
    });

    it('should handle 404 errors for non-existent roles', async () => {
      const mockError = new Error('Role not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.getByRoleId(999)).rejects.toThrow(
        'Role not found'
      );
    });
  });

  describe('assign', () => {
    it('should call POST /permissions/assign with role and permission IDs', async () => {
      const assignData = {
        roleId: 1,
        permissionId: 2,
      };

      const mockResponse = {
        status: 'success',
        data: {
          roleId: 1,
          permissionId: 2,
          assignedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.assign(assignData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions/assign',
        assignData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle duplicate assignment errors', async () => {
      const assignData = {
        roleId: 1,
        permissionId: 2,
      };

      const mockError = new Error('Permission already assigned to this role');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.assign(assignData)).rejects.toThrow(
        'Permission already assigned to this role'
      );
    });

    it('should handle invalid role ID', async () => {
      const assignData = {
        roleId: 999,
        permissionId: 2,
      };

      const mockError = new Error('Role not found');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.assign(assignData)).rejects.toThrow(
        'Role not found'
      );
    });

    it('should handle invalid permission ID', async () => {
      const assignData = {
        roleId: 1,
        permissionId: 999,
      };

      const mockError = new Error('Permission not found');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.assign(assignData)).rejects.toThrow(
        'Permission not found'
      );
    });
  });

  describe('revoke', () => {
    it('should call POST /permissions/revoke with role and permission IDs', async () => {
      const revokeData = {
        roleId: 1,
        permissionId: 2,
      };

      const mockResponse = {
        status: 'success',
        data: undefined,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.revoke(revokeData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions/revoke',
        revokeData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle non-existent assignment errors', async () => {
      const revokeData = {
        roleId: 1,
        permissionId: 2,
      };

      const mockError = new Error('Permission not assigned to this role');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.revoke(revokeData)).rejects.toThrow(
        'Permission not assigned to this role'
      );
    });

    it('should handle invalid role ID', async () => {
      const revokeData = {
        roleId: 999,
        permissionId: 2,
      };

      const mockError = new Error('Role not found');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(permissionsAPI.revoke(revokeData)).rejects.toThrow(
        'Role not found'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle permission names with hyphens', async () => {
      const permissionData: PermissionInput = {
        name: 'employment-status:read',
        resource: 'employment-status',
        action: 'read',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await permissionsAPI.create(permissionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        permissionData
      );
    });

    it('should handle complex ABAC conditions', async () => {
      const permissionData: PermissionInput = {
        name: 'users:update-team',
        resource: 'users',
        action: 'update',
        conditions: {
          department: '${user.department}',
          level: { $gte: 3 },
          status: { $in: ['active', 'pending'] },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await permissionsAPI.create(permissionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        permissionData
      );
    });

    it('should handle empty conditions object', async () => {
      const permissionData: PermissionInput = {
        name: 'users:read',
        resource: 'users',
        action: 'read',
        conditions: {},
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await permissionsAPI.create(permissionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        permissionData
      );
    });

    it('should handle wildcard actions', async () => {
      const permissionData: PermissionInput = {
        name: 'users:*',
        resource: 'users',
        action: '*',
        description: 'All user operations',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await permissionsAPI.create(permissionData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/permissions',
        permissionData
      );
    });
  });

  describe('response parsing', () => {
    it('should correctly parse permission with ABAC conditions', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          name: 'users:update-own',
          resource: 'users',
          action: 'update',
          conditions: {
            ownerId: '${user.id}',
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getById(1);

      const data = assertDefined(result.data);
      expect(data.conditions).toEqual({ ownerId: '${user.id}' });
    });

    it('should correctly parse paginated response grouped by resource', async () => {
      const mockResponse = {
        success: true,
        count: 3,
        data: [
          { id: 1, name: 'users:read', resource: 'users', action: 'read' },
          {
            id: 2,
            name: 'users:create',
            resource: 'users',
            action: 'create',
          },
          { id: 3, name: 'roles:read', resource: 'roles', action: 'read' },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await permissionsAPI.getAll();

      expect(result.data).toHaveLength(3);
      expect(result.data.filter(p => p.resource === 'users')).toHaveLength(2);
      expect(result.data.filter(p => p.resource === 'roles')).toHaveLength(1);
    });
  });
});
