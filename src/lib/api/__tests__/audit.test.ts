/**
 * Unit tests for Audit API service
 */

import { auditAPI } from '../audit';
import { apiClient } from '../client';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Audit API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /audit without query params when no params provided', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/audit');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /audit with pagination params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            {
              id: 1,
              userId: 1,
              action: 'CREATE',
              resource: 'users',
              timestamp: '2024-01-01T00:00:00.000Z',
              success: true,
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getAll({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /audit with userId filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ userId: 5 });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?userId=5');
    });

    it('should call GET /audit with action filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ action: 'DELETE' });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?action=DELETE');
    });

    it('should call GET /audit with resource filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ resource: 'roles' });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?resource=roles');
    });

    it('should call GET /audit with success filter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ success: true });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?success=true');
    });

    it('should call GET /audit with success filter set to false', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ success: false });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?success=false');
    });

    it('should call GET /audit with date range filters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit?startDate=2024-01-01T00%3A00%3A00.000Z&endDate=2024-01-31T23%3A59%3A59.999Z'
      );
    });

    it('should call GET /audit with sort params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({
        sortBy: 'timestamp',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit?sortBy=timestamp&sortOrder=desc'
      );
    });

    it('should call GET /audit with all params combined', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({
        page: 2,
        limit: 50,
        userId: 3,
        action: 'UPDATE',
        resource: 'users',
        success: true,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        sortBy: 'timestamp',
        sortOrder: 'asc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit?page=2&limit=50&userId=3&action=UPDATE&resource=users&success=true&startDate=2024-01-01T00%3A00%3A00.000Z&endDate=2024-01-31T23%3A59%3A59.999Z&sortBy=timestamp&sortOrder=asc'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(auditAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should call GET /audit/:id with correct ID', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          userId: 1,
          action: 'CREATE',
          resource: 'users',
          resourceId: 5,
          details: { email: 'test@example.com' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          success: true,
          errorMessage: null,
          timestamp: '2024-01-01T00:00:00.000Z',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/audit/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Audit log not found');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(auditAPI.getById(999)).rejects.toThrow(
        'Audit log not found'
      );
    });

    it('should correctly parse audit log with all fields', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          userId: 1,
          action: 'DELETE',
          resource: 'roles',
          resourceId: 3,
          details: { roleLabel: 'Manager' },
          ipAddress: '10.0.0.1',
          userAgent: 'Chrome/120.0',
          success: false,
          errorMessage: 'Role is in use',
          timestamp: '2024-01-01T12:00:00.000Z',
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getById(1);

      expect(result.data).toHaveProperty('success', false);
      expect(result.data).toHaveProperty('errorMessage', 'Role is in use');
      expect(result.data.details).toEqual({ roleLabel: 'Manager' });
    });
  });

  describe('getStats', () => {
    it('should call GET /audit/stats without params', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          totalLogs: 1000,
          successRate: 0.95,
          topActions: [
            { action: 'READ', count: 500 },
            { action: 'CREATE', count: 300 },
            { action: 'UPDATE', count: 150 },
            { action: 'DELETE', count: 50 },
          ],
          topResources: [
            { resource: 'users', count: 600 },
            { resource: 'roles', count: 250 },
            { resource: 'permissions', count: 150 },
          ],
          topUsers: [
            { userId: 1, username: 'admin', count: 400 },
            { userId: 2, username: 'manager', count: 300 },
            { userId: 3, username: 'user', count: 300 },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getStats();

      expect(apiClient.get).toHaveBeenCalledWith('/audit/stats');
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /audit/stats with date range', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          totalLogs: 100,
          successRate: 0.98,
          topActions: [],
          topResources: [],
          topUsers: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await auditAPI.getStats({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-07T23:59:59.999Z',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit/stats?startDate=2024-01-01T00%3A00%3A00.000Z&endDate=2024-01-07T23%3A59%3A59.999Z'
      );
    });

    it('should call GET /audit/stats with only startDate', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await auditAPI.getStats({
        startDate: '2024-01-01T00:00:00.000Z',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit/stats?startDate=2024-01-01T00%3A00%3A00.000Z'
      );
    });

    it('should call GET /audit/stats with only endDate', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      await auditAPI.getStats({
        endDate: '2024-01-31T23:59:59.999Z',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit/stats?endDate=2024-01-31T23%3A59%3A59.999Z'
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Failed to fetch statistics');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(auditAPI.getStats()).rejects.toThrow(
        'Failed to fetch statistics'
      );
    });

    it('should correctly parse statistics with all fields', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          totalLogs: 5000,
          successRate: 0.92,
          topActions: [
            { action: 'READ', count: 3000 },
            { action: 'CREATE', count: 1000 },
          ],
          topResources: [
            { resource: 'users', count: 2500 },
            { resource: 'audit', count: 1500 },
          ],
          topUsers: [
            { userId: 1, username: 'admin', count: 2000 },
            { userId: 2, username: 'user1', count: 1500 },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getStats();

      expect(result.data.totalLogs).toBe(5000);
      expect(result.data.successRate).toBe(0.92);
      expect(result.data.topActions).toHaveLength(2);
      expect(result.data.topResources).toHaveLength(2);
      expect(result.data.topUsers).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple action types', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ action: 'CREATE' });
      expect(apiClient.get).toHaveBeenCalledWith('/audit?action=CREATE');

      await auditAPI.getAll({ action: 'READ' });
      expect(apiClient.get).toHaveBeenCalledWith('/audit?action=READ');

      await auditAPI.getAll({ action: 'UPDATE' });
      expect(apiClient.get).toHaveBeenCalledWith('/audit?action=UPDATE');

      await auditAPI.getAll({ action: 'DELETE' });
      expect(apiClient.get).toHaveBeenCalledWith('/audit?action=DELETE');
    });

    it('should handle different resource types', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      const resources = [
        'users',
        'roles',
        'profiles',
        'permissions',
        'audit',
        'employment-statut',
      ];

      for (const resource of resources) {
        await auditAPI.getAll({ resource });
        expect(apiClient.get).toHaveBeenCalledWith(
          `/audit?resource=${resource}`
        );
      }
    });

    it('should handle ISO date strings correctly', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-12-31T23:59:59.999Z';

      await auditAPI.getAll({ startDate, endDate });

      expect(apiClient.get).toHaveBeenCalledWith(
        `/audit?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
    });

    it('should handle userId 0', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ userId: 0 });

      // userId 0 is falsy and filtered out by the if check
      expect(apiClient.get).toHaveBeenCalledWith('/audit');
    });

    it('should handle very large page numbers', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ page: 1000, limit: 100 });

      expect(apiClient.get).toHaveBeenCalledWith('/audit?page=1000&limit=100');
    });
  });

  describe('response parsing', () => {
    it('should correctly parse audit log with user details', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          userId: 5,
          action: 'UPDATE',
          resource: 'users',
          user: {
            id: 5,
            username: 'john.doe',
            email: 'john@example.com',
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getById(1);

      expect(result.data.user).toBeDefined();
      expect(result.data.user?.username).toBe('john.doe');
      expect(result.data.user?.email).toBe('john@example.com');
    });

    it('should correctly parse audit log with complex details', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 1,
          userId: 1,
          action: 'UPDATE',
          resource: 'users',
          details: {
            before: { email: 'old@example.com', firstName: 'John' },
            after: { email: 'new@example.com', firstName: 'Jane' },
            changes: ['email', 'firstName'],
          },
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getById(1);

      expect(result.data.details).toHaveProperty('before');
      expect(result.data.details).toHaveProperty('after');
      expect(result.data.details).toHaveProperty('changes');
      expect(result.data.details.changes).toEqual(['email', 'firstName']);
    });

    it('should correctly parse paginated response with default sort', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          items: [
            { id: 3, timestamp: '2024-01-03T00:00:00.000Z' },
            { id: 2, timestamp: '2024-01-02T00:00:00.000Z' },
            { id: 1, timestamp: '2024-01-01T00:00:00.000Z' },
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

      const result = await auditAPI.getAll();

      expect(result.data.items).toHaveLength(3);
      // Verify descending order by timestamp (most recent first)
      expect(result.data.items[0].id).toBe(3);
      expect(result.data.items[1].id).toBe(2);
      expect(result.data.items[2].id).toBe(1);
    });

    it('should correctly parse statistics with zero values', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          totalLogs: 0,
          successRate: 0,
          topActions: [],
          topResources: [],
          topUsers: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await auditAPI.getStats();

      expect(result.data.totalLogs).toBe(0);
      expect(result.data.successRate).toBe(0);
      expect(result.data.topActions).toEqual([]);
    });
  });

  describe('filtering combinations', () => {
    it('should filter by userId and success status', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({ userId: 5, success: false });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit?userId=5&success=false'
      );
    });

    it('should filter by action, resource, and date range', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({
        action: 'DELETE',
        resource: 'users',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit?action=DELETE&resource=users&startDate=2024-01-01T00%3A00%3A00.000Z&endDate=2024-01-31T23%3A59%3A59.999Z'
      );
    });

    it('should combine all filters with pagination and sorting', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { items: [], pagination: {} },
      });

      await auditAPI.getAll({
        page: 1,
        limit: 25,
        userId: 3,
        action: 'CREATE',
        resource: 'roles',
        success: true,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        sortBy: 'timestamp',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/audit?page=1&limit=25&userId=3&action=CREATE&resource=roles&success=true&startDate=2024-01-01T00%3A00%3A00.000Z&endDate=2024-01-31T23%3A59%3A59.999Z&sortBy=timestamp&sortOrder=desc'
      );
    });
  });
});
