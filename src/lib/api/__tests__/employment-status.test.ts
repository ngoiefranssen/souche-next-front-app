/**
 * Unit tests for Employment Status API service
 */

import { employmentStatusAPI } from '../settings/employment-status';
import { apiClient } from '../client';
import type { EmploymentStatusInput } from '@/types/employment-status';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Employment Status API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /employment-statut without query params when no params provided', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/employment-statut');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /employment-statut with pagination params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            { id: 1, label: 'Full-time', description: 'Full-time employee' },
            { id: 2, label: 'Part-time', description: 'Part-time employee' },
          ],
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.getAll({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/employment-statut?page=1&limit=10'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /employment-statut with search param', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await employmentStatusAPI.getAll({ search: 'full-time' });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/employment-statut?search=full-time'
      );
    });

    it('should call GET /employment-statut with sort params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await employmentStatusAPI.getAll({
        sortBy: 'label',
        sortOrder: 'asc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/employment-statut?sortBy=label&sortOrder=asc'
      );
    });

    it('should call GET /employment-statut with all params combined', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await employmentStatusAPI.getAll({
        page: 2,
        limit: 15,
        search: 'contract',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/employment-statut?page=2&limit=15&search=contract&sortBy=createdAt&sortOrder=desc'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.getAll()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getById', () => {
    it('should call GET /employment-statut/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          label: 'Full-time',
          description: 'Full-time permanent employee',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
          _count: {
            users: 50,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/employment-statut/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Employment status not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.getById(999)).rejects.toThrow(
        'Employment status not found'
      );
    });
  });

  describe('create', () => {
    it('should call POST /employment-statut with status data', async () => {
      const statusData: EmploymentStatusInput = {
        label: 'Contractor',
        description: 'Independent contractor',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          ...statusData,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.create(statusData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/employment-statut',
        statusData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /employment-statut with only required fields', async () => {
      const statusData: EmploymentStatusInput = {
        label: 'Intern',
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 2,
          label: 'Intern',
          description: null,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await employmentStatusAPI.create(statusData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/employment-statut',
        statusData
      );
    });

    it('should handle validation errors', async () => {
      const statusData: EmploymentStatusInput = {
        label: 'F', // Too short
      };

      const mockError = new Error('Label must be at least 2 characters');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.create(statusData)).rejects.toThrow(
        'Label must be at least 2 characters'
      );
    });

    it('should handle duplicate label errors', async () => {
      const statusData: EmploymentStatusInput = {
        label: 'Full-time', // Already exists
        description: 'Duplicate status',
      };

      const mockError = new Error(
        'Employment status with this label already exists'
      );
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.create(statusData)).rejects.toThrow(
        'Employment status with this label already exists'
      );
    });
  });

  describe('update', () => {
    it('should call PUT /employment-statut/:id with updated data', async () => {
      const updateData: Partial<EmploymentStatusInput> = {
        label: 'Full-time Permanent',
        description: 'Full-time permanent position',
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

      const result = await employmentStatusAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/employment-statut/1',
        updateData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const updateData: Partial<EmploymentStatusInput> = {
        description: 'Updated description',
      };

      (apiClient.put as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await employmentStatusAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/employment-statut/1',
        updateData
      );
    });

    it('should handle 404 errors for non-existent statuses', async () => {
      const mockError = new Error('Employment status not found');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(
        employmentStatusAPI.update(999, { label: 'Test' })
      ).rejects.toThrow('Employment status not found');
    });
  });

  describe('delete', () => {
    it('should call DELETE /employment-statut/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: undefined,
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/employment-statut/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Employment status not found');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.delete(999)).rejects.toThrow(
        'Employment status not found'
      );
    });

    it('should handle constraint errors when status is in use', async () => {
      const mockError = new Error(
        'Cannot delete employment status with associated users'
      );
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.delete(1)).rejects.toThrow(
        'Cannot delete employment status with associated users'
      );
    });

    it('should prevent deletion of status in use by users', async () => {
      const mockError = new Error(
        'Employment status is currently assigned to users'
      );
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(employmentStatusAPI.delete(1)).rejects.toThrow(
        'Employment status is currently assigned to users'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty search string', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await employmentStatusAPI.getAll({ search: '' });

      // Empty string is filtered out by URLSearchParams
      expect(apiClient.get).toHaveBeenCalledWith('/employment-statut');
    });

    it('should handle hyphenated labels', async () => {
      const statusData: EmploymentStatusInput = {
        label: 'Part-time-Flexible',
        description: 'Part-time with flexible hours',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await employmentStatusAPI.create(statusData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/employment-statut',
        statusData
      );
    });

    it('should handle labels with numbers', async () => {
      const statusData: EmploymentStatusInput = {
        label: '40-hour Week',
        description: 'Standard 40-hour work week',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await employmentStatusAPI.create(statusData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/employment-statut',
        statusData
      );
    });

    it('should handle unicode characters', async () => {
      const statusData: EmploymentStatusInput = {
        label: 'Temps plein',
        description: 'Employé à temps plein',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await employmentStatusAPI.create(statusData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/employment-statut',
        statusData
      );
    });
  });

  describe('response parsing', () => {
    it('should correctly parse status with user count', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          label: 'Full-time',
          description: 'Full-time employee',
          _count: {
            users: 100,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.getById(1);

      expect(result.data._count).toHaveProperty('users', 100);
    });

    it('should correctly parse paginated response', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            { id: 1, label: 'Full-time', _count: { users: 50 } },
            { id: 2, label: 'Part-time', _count: { users: 20 } },
            { id: 3, label: 'Contractor', _count: { users: 10 } },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employmentStatusAPI.getAll();

      expect(result.data.items).toHaveLength(3);
      expect(result.data.items[0]._count.users).toBe(50);
      expect(result.data.items[1]._count.users).toBe(20);
      expect(result.data.items[2]._count.users).toBe(10);
    });
  });
});
