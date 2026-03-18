/**
 * Unit tests for Roles API service
 */

import { rolesAPI } from '../roles';
import { apiClient } from '../client';
import type { RoleInput } from '@/types/role';

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

describe('Roles API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /roles without query params when no params provided', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/roles');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /roles with pagination params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            { id: 1, label: 'Admin', description: 'Administrator role' },
            { id: 2, label: 'User', description: 'Standard user role' },
          ],
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.getAll({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/roles?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /roles with search param', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await rolesAPI.getAll({ search: 'admin' });

      expect(apiClient.get).toHaveBeenCalledWith('/roles?search=admin');
    });

    it('should call GET /roles with sort params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await rolesAPI.getAll({
        sortBy: 'label',
        sortOrder: 'asc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/roles?sortBy=label&sortOrder=asc'
      );
    });

    it('should call GET /roles with all params combined', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await rolesAPI.getAll({
        page: 2,
        limit: 20,
        search: 'manager',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/roles?page=2&limit=20&search=manager&sortBy=createdAt&sortOrder=desc'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should call GET /roles/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          label: 'Admin',
          description: 'Administrator role',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/roles/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Role not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.getById(999)).rejects.toThrow('Role not found');
    });

    it('should handle different role IDs', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.getById(5);
      expect(apiClient.get).toHaveBeenCalledWith('/roles/5');

      await rolesAPI.getById(100);
      expect(apiClient.get).toHaveBeenCalledWith('/roles/100');
    });
  });

  describe('create', () => {
    it('should call POST /roles with role data', async () => {
      const roleData: RoleInput = {
        label: 'Manager',
        description: 'Manager role with limited permissions',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          ...roleData,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.create(roleData);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', roleData);
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /roles with only required fields', async () => {
      const roleData: RoleInput = {
        label: 'Viewer',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 2,
          label: 'Viewer',
          description: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await rolesAPI.create(roleData);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', roleData);
    });

    it('should handle validation errors', async () => {
      const roleData: RoleInput = {
        label: 'A', // Too short
      };

      const mockError = new Error('Label must be at least 2 characters');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.create(roleData)).rejects.toThrow(
        'Label must be at least 2 characters'
      );
    });

    it('should handle duplicate label errors', async () => {
      const roleData: RoleInput = {
        label: 'Admin', // Already exists
        description: 'Duplicate admin role',
      };

      const mockError = new Error('Role with this label already exists');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.create(roleData)).rejects.toThrow(
        'Role with this label already exists'
      );
    });

    it('should handle empty description', async () => {
      const roleData: RoleInput = {
        label: 'Test Role',
        description: '',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.create(roleData);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', roleData);
    });
  });

  describe('update', () => {
    it('should call PUT /roles/:id with updated data', async () => {
      const updateData: Partial<RoleInput> = {
        label: 'Updated Manager',
        description: 'Updated description',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          ...updateData,
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/roles/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates (label only)', async () => {
      const updateData: Partial<RoleInput> = {
        label: 'New Label',
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/roles/1', updateData);
    });

    it('should handle partial updates (description only)', async () => {
      const updateData: Partial<RoleInput> = {
        description: 'New description',
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/roles/1', updateData);
    });

    it('should handle 404 errors for non-existent roles', async () => {
      const mockError = new Error('Role not found');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.update(999, { label: 'Test' })).rejects.toThrow(
        'Role not found'
      );
    });

    it('should handle duplicate label errors on update', async () => {
      const updateData: Partial<RoleInput> = {
        label: 'Admin', // Already exists
      };

      const mockError = new Error('Role with this label already exists');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.update(2, updateData)).rejects.toThrow(
        'Role with this label already exists'
      );
    });
  });

  describe('delete', () => {
    it('should call DELETE /roles/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: undefined,
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/roles/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Role not found');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.delete(999)).rejects.toThrow('Role not found');
    });

    it('should handle constraint errors when role is in use', async () => {
      const mockError = new Error(
        'Cannot delete role that is assigned to profiles'
      );
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.delete(1)).rejects.toThrow(
        'Cannot delete role that is assigned to profiles'
      );
    });

    it('should handle 409 conflict errors', async () => {
      const mockError = new Error('Role is currently in use');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(rolesAPI.delete(1)).rejects.toThrow(
        'Role is currently in use'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty search string', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await rolesAPI.getAll({ search: '' });

      // Empty string is filtered out by URLSearchParams
      expect(apiClient.get).toHaveBeenCalledWith('/roles');
    });

    it('should handle special characters in search', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await rolesAPI.getAll({ search: 'Admin & Manager' });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/roles?search=Admin+%26+Manager'
      );
    });

    it('should handle very long label', async () => {
      const longLabel = 'A'.repeat(100);
      const roleData: RoleInput = {
        label: longLabel,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.create(roleData);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', roleData);
    });

    it('should handle very long description', async () => {
      const longDescription = 'A'.repeat(500);
      const roleData: RoleInput = {
        label: 'Test',
        description: longDescription,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.create(roleData);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', roleData);
    });

    it('should handle undefined description in update', async () => {
      const updateData: Partial<RoleInput> = {
        label: 'Updated',
        description: undefined,
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/roles/1', updateData);
    });

    it('should handle null description', async () => {
      const roleData: RoleInput = {
        label: 'Test',
        description: null as any,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await rolesAPI.create(roleData);

      expect(apiClient.post).toHaveBeenCalledWith('/roles', roleData);
    });
  });

  describe('response parsing', () => {
    it('should correctly parse role with all fields', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          label: 'Admin',
          description: 'Administrator role',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          deletedAt: null,
          _count: {
            profiles: 5,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.getById(1);

      const data = assertDefined(result.data);
      expect(data).toHaveProperty('id', 1);
      expect(data).toHaveProperty('label', 'Admin');
      expect(data).toHaveProperty('description', 'Administrator role');
      expect(data).toHaveProperty('_count');
      expect(data._count).toHaveProperty('profiles', 5);
    });

    it('should correctly parse paginated response', async () => {
      const mockResponse = {
        status: 'success',
        data: [
          { id: 1, label: 'Admin', description: 'Administrator role' },
          { id: 2, label: 'User', description: 'Standard user role' },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rolesAPI.getAll();

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('total', 2);
    });
  });
});
