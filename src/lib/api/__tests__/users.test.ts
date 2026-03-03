/**
 * Unit tests for Users API service
 */

import { usersAPI } from '../users';
import { apiClient } from '../client';
import type { UserFormData } from '@/types/user';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Users API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /users without query params when no params provided', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /users with pagination params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await usersAPI.getAll({ page: 2, limit: 20 });

      expect(apiClient.get).toHaveBeenCalledWith('/users?page=2&limit=20');
    });

    it('should call GET /users with search param', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await usersAPI.getAll({ search: 'john' });

      expect(apiClient.get).toHaveBeenCalledWith('/users?search=john');
    });

    it('should call GET /users with filter params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await usersAPI.getAll({
        profileId: 1,
        employmentStatusId: 2,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users?profileId=1&employmentStatusId=2'
      );
    });

    it('should call GET /users with sort params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await usersAPI.getAll({
        sortBy: 'email',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users?sortBy=email&sortOrder=desc'
      );
    });

    it('should call GET /users with all params combined', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await usersAPI.getAll({
        page: 3,
        limit: 50,
        search: 'test',
        profileId: 1,
        employmentStatusId: 2,
        sortBy: 'username',
        sortOrder: 'asc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users?page=3&limit=50&search=test&profileId=1&employmentStatusId=2&sortBy=username&sortOrder=asc'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should call GET /users/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('User not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.getById(999)).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('should call POST /users with JSON data when no profile photo', async () => {
      const userData: UserFormData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        salary: 50000,
        hireDate: new Date('2024-01-01'),
        employmentStatusId: 1,
        profileId: 2,
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, ...userData },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.create(userData);

      expect(apiClient.post).toHaveBeenCalledWith('/users', {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        salary: userData.salary,
        hireDate: userData.hireDate.toISOString(),
        employmentStatusId: userData.employmentStatusId,
        profileId: userData.profileId,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /users with FormData when profile photo is provided', async () => {
      const mockFile = new File(['photo'], 'profile.jpg', {
        type: 'image/jpeg',
      });
      const userData: UserFormData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        salary: 50000,
        hireDate: new Date('2024-01-01'),
        employmentStatusId: 1,
        profileId: 2,
        profilePhoto: mockFile,
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, ...userData },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await usersAPI.create(userData);

      expect(apiClient.post).toHaveBeenCalled();
      const callArgs = (apiClient.post as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('/users');
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(callArgs[2]).toEqual({
        headers: {
          'Content-Type': undefined,
        },
      });
    });

    it('should handle validation errors', async () => {
      const userData: UserFormData = {
        email: 'invalid-email',
        username: 'u',
        password: '123',
        firstName: 'J',
        lastName: 'D',
        phone: '123',
        salary: -1000,
        hireDate: new Date('2024-01-01'),
        employmentStatusId: 1,
        profileId: 2,
      };

      const mockError = new Error('Validation failed');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.create(userData)).rejects.toThrow(
        'Validation failed'
      );
    });

    it('should handle duplicate email errors', async () => {
      const userData: UserFormData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        salary: 50000,
        hireDate: new Date('2024-01-01'),
        employmentStatusId: 1,
        profileId: 2,
      };

      const mockError = new Error('Email already exists');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.create(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('update', () => {
    it('should call PUT /users/:id with JSON data when no profile photo', async () => {
      const updateData: Partial<UserFormData> = {
        email: 'updated@example.com',
        firstName: 'Jane',
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, ...updateData },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/1', {
        email: updateData.email,
        firstName: updateData.firstName,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call PUT /users/:id with FormData when profile photo is provided', async () => {
      const mockFile = new File(['photo'], 'new-profile.jpg', {
        type: 'image/jpeg',
      });
      const updateData: Partial<UserFormData> = {
        firstName: 'Jane',
        profilePhoto: mockFile,
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, ...updateData },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      await usersAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalled();
      const callArgs = (apiClient.put as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('/users/1');
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(callArgs[2]).toEqual({
        headers: {
          'Content-Type': undefined,
        },
      });
    });

    it('should handle partial updates', async () => {
      const updateData: Partial<UserFormData> = {
        phone: '+9876543210',
      };

      const mockResponse = {
        status: 'success',
        data: { id: 1, phone: updateData.phone },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      await usersAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/1', {
        phone: updateData.phone,
      });
    });

    it('should handle date conversion in updates', async () => {
      const updateData: Partial<UserFormData> = {
        hireDate: new Date('2024-06-01'),
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await usersAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/users/1', {
        hireDate: '2024-06-01T00:00:00.000Z',
      });
    });

    it('should handle 404 errors for non-existent users', async () => {
      const mockError = new Error('User not found');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.update(999, { firstName: 'Test' })).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('delete', () => {
    it('should call DELETE /users/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: undefined,
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('User not found');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.delete(999)).rejects.toThrow('User not found');
    });

    it('should handle constraint errors', async () => {
      const mockError = new Error('Cannot delete user with active sessions');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.delete(1)).rejects.toThrow(
        'Cannot delete user with active sessions'
      );
    });
  });

  describe('getMyPermissions', () => {
    it('should call GET /users/me/permissions', async () => {
      const mockResponse = {
        status: 'success',
        data: ['users:read', 'users:create', 'roles:read'],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.getMyPermissions();

      expect(apiClient.get).toHaveBeenCalledWith('/users/me/permissions');
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty permissions', async () => {
      const mockResponse = {
        status: 'success',
        data: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersAPI.getMyPermissions();

      expect(result.data).toEqual([]);
    });

    it('should handle authentication errors', async () => {
      const mockError = new Error('Unauthorized');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(usersAPI.getMyPermissions()).rejects.toThrow('Unauthorized');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string search', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await usersAPI.getAll({ search: '' });

      // Empty string is filtered out by URLSearchParams
      expect(apiClient.get).toHaveBeenCalledWith('/users');
    });

    it('should handle special characters in search', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await usersAPI.getAll({ search: 'test@example.com' });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/users?search=test%40example.com'
      );
    });

    it('should handle zero values in numeric fields', async () => {
      const userData: UserFormData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        salary: 0,
        hireDate: new Date('2024-01-01'),
        employmentStatusId: 1,
        profileId: 2,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await usersAPI.create(userData);

      const callArgs = (apiClient.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].salary).toBe(0);
    });

    it('should handle undefined optional fields in update', async () => {
      const updateData: Partial<UserFormData> = {
        firstName: 'Jane',
        password: undefined,
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await usersAPI.update(1, updateData);

      const callArgs = (apiClient.put as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toEqual({ firstName: 'Jane' });
      expect(callArgs[1]).not.toHaveProperty('password');
    });
  });
});
