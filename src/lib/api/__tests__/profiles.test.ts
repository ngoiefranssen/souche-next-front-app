/**
 * Unit tests for Profiles API service
 */

import { profilesAPI } from '../settings/profiles';
import { apiClient } from '../client';
import type { ProfileInput } from '@/types/profile';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Profiles API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /profils without query params when no params provided', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/profils');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /profils with pagination params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            {
              id: 1,
              label: 'Developer',
              description: 'Software developer profile',
            },
            { id: 2, label: 'Designer', description: 'UI/UX designer profile' },
          ],
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.getAll({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/profils?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /profils with search param', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await profilesAPI.getAll({ search: 'developer' });

      expect(apiClient.get).toHaveBeenCalledWith('/profils?search=developer');
    });

    it('should call GET /profils with sort params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await profilesAPI.getAll({
        sortBy: 'label',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/profils?sortBy=label&sortOrder=desc'
      );
    });

    it('should call GET /profils with all params combined', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await profilesAPI.getAll({
        page: 3,
        limit: 25,
        search: 'manager',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/profils?page=3&limit=25&search=manager&sortBy=createdAt&sortOrder=asc'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should call GET /profils/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          label: 'Developer',
          description: 'Software developer profile',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
          _count: {
            users: 10,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/profils/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Profile not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.getById(999)).rejects.toThrow(
        'Profile not found'
      );
    });
  });

  describe('create', () => {
    it('should call POST /profils with profile data', async () => {
      const profileData: ProfileInput = {
        label: 'Product Manager',
        description: 'Manages product development and roadmap',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          ...profileData,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.create(profileData);

      expect(apiClient.post).toHaveBeenCalledWith('/profils', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /profils with only required fields', async () => {
      const profileData: ProfileInput = {
        label: 'Analyst',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 2,
          label: 'Analyst',
          description: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await profilesAPI.create(profileData);

      expect(apiClient.post).toHaveBeenCalledWith('/profils', profileData);
    });

    it('should handle validation errors', async () => {
      const profileData: ProfileInput = {
        label: 'A', // Too short
      };

      const mockError = new Error('Label must be at least 2 characters');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.create(profileData)).rejects.toThrow(
        'Label must be at least 2 characters'
      );
    });

    it('should handle duplicate label errors', async () => {
      const profileData: ProfileInput = {
        label: 'Developer', // Already exists
        description: 'Duplicate developer profile',
      };

      const mockError = new Error('Profile with this label already exists');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.create(profileData)).rejects.toThrow(
        'Profile with this label already exists'
      );
    });
  });

  describe('update', () => {
    it('should call PUT /profils/:id with updated data', async () => {
      const updateData: Partial<ProfileInput> = {
        label: 'Senior Developer',
        description: 'Experienced software developer',
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

      const result = await profilesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/profils/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const updateData: Partial<ProfileInput> = {
        description: 'Updated description only',
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await profilesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/profils/1', updateData);
    });

    it('should handle 404 errors for non-existent profiles', async () => {
      const mockError = new Error('Profile not found');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.update(999, { label: 'Test' })).rejects.toThrow(
        'Profile not found'
      );
    });
  });

  describe('delete', () => {
    it('should call DELETE /profils/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: undefined,
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/profils/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Profile not found');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.delete(999)).rejects.toThrow(
        'Profile not found'
      );
    });

    it('should handle foreign key constraint errors', async () => {
      const mockError = new Error(
        'Cannot delete profile with associated users'
      );
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(profilesAPI.delete(1)).rejects.toThrow(
        'Cannot delete profile with associated users'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty search string', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await profilesAPI.getAll({ search: '' });

      // Empty string is filtered out by URLSearchParams
      expect(apiClient.get).toHaveBeenCalledWith('/profils');
    });

    it('should handle special characters in label', async () => {
      const profileData: ProfileInput = {
        label: 'C++ Developer',
        description: 'C++ programming specialist',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await profilesAPI.create(profileData);

      expect(apiClient.post).toHaveBeenCalledWith('/profils', profileData);
    });

    it('should handle unicode characters', async () => {
      const profileData: ProfileInput = {
        label: 'Développeur',
        description: 'Développeur logiciel français',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await profilesAPI.create(profileData);

      expect(apiClient.post).toHaveBeenCalledWith('/profils', profileData);
    });
  });

  describe('response parsing', () => {
    it('should correctly parse profile with user count', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          label: 'Developer',
          description: 'Software developer',
          _count: {
            users: 15,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.getById(1);

      expect(result.data._count).toHaveProperty('users', 15);
    });

    it('should correctly parse paginated response', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            { id: 1, label: 'Developer', _count: { users: 10 } },
            { id: 2, label: 'Designer', _count: { users: 5 } },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await profilesAPI.getAll();

      expect(result.data.items).toHaveLength(2);
      expect(result.data.items[0]._count.users).toBe(10);
      expect(result.data.items[1]._count.users).toBe(5);
    });
  });
});
