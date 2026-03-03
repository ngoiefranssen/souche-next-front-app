/**
 * Integration tests for Employment Status CRUD workflow
 * Tests the complete flow: list → create → edit → delete
 *
 * Validates: Requirements 4.1-4.7, 14.2
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmploymentStatusPage from '@/app/[locale]/dashboard/employment-status/page';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { employmentStatusAPI } from '@/lib/api/employment-status';
import type { EmploymentStatus } from '@/types/employment-status';

// Mock the API
jest.mock('@/lib/api/employment-status');
jest.mock('@/lib/api/client');

// Mock useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard/employment-status',
}));

// Test data
const mockStatuses: EmploymentStatus[] = [
  {
    id: 1,
    label: 'Full-time',
    description: 'Full-time employee',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
    _count: { users: 50 },
  },
  {
    id: 2,
    label: 'Part-time',
    description: 'Part-time employee',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    deletedAt: null,
    _count: { users: 15 },
  },
];

const newStatus: EmploymentStatus = {
  id: 3,
  label: 'Contractor',
  description: 'Contract-based employee',
  createdAt: '2024-01-03T00:00:00Z',
  updatedAt: '2024-01-03T00:00:00Z',
  deletedAt: null,
  _count: { users: 0 },
};

// Wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PermissionProvider>{children}</PermissionProvider>
);

describe('Employment Status CRUD Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses by default
    (employmentStatusAPI.getAll as jest.Mock).mockResolvedValue({
      data: mockStatuses,
      pagination: {
        page: 1,
        limit: 10,
        total: mockStatuses.length,
        totalPages: 1,
      },
    });
  });

  describe('Complete CRUD Flow', () => {
    it('should complete full CRUD workflow: list → create → edit → delete', async () => {
      const user = userEvent.setup();

      // Mock API responses for the full flow
      (employmentStatusAPI.create as jest.Mock).mockResolvedValue({
        status: 'success',
        data: newStatus,
      });

      (employmentStatusAPI.update as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { ...newStatus, label: 'Independent Contractor' },
      });

      (employmentStatusAPI.delete as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      // STEP 1: View list
      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      expect(screen.getByText('Part-time')).toBeInTheDocument();
      expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(1);

      // STEP 2: Create new status
      const createButton = screen.getByRole('button', {
        name: /créer un statut/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.clear(labelInput);
      await user.type(labelInput, 'Contractor');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Contract-based employee');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(employmentStatusAPI.create).toHaveBeenCalledWith({
          label: 'Contractor',
          description: 'Contract-based employee',
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Update mock to include new status
      (employmentStatusAPI.getAll as jest.Mock).mockResolvedValue({
        data: [...mockStatuses, newStatus],
        pagination: {
          page: 1,
          limit: 10,
          total: mockStatuses.length + 1,
          totalPages: 1,
        },
      });

      await waitFor(() => {
        expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(2);
      });

      // STEP 3: Edit the newly created status
      const contractorRow = screen.getByText('Contractor').closest('tr');
      expect(contractorRow).toBeInTheDocument();

      const editButton = within(contractorRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const editLabelInput = screen.getByLabelText(/label/i);
      await user.clear(editLabelInput);
      await user.type(editLabelInput, 'Independent Contractor');

      const editSubmitButton = screen.getByRole('button', {
        name: /enregistrer|modifier/i,
      });
      await user.click(editSubmitButton);

      await waitFor(() => {
        expect(employmentStatusAPI.update).toHaveBeenCalledWith(3, {
          label: 'Independent Contractor',
          description: 'Contract-based employee',
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // STEP 4: Delete the status
      const editedStatus = { ...newStatus, label: 'Independent Contractor' };
      (employmentStatusAPI.getAll as jest.Mock).mockResolvedValue({
        data: [...mockStatuses, editedStatus],
        pagination: {
          page: 1,
          limit: 10,
          total: mockStatuses.length + 1,
          totalPages: 1,
        },
      });

      await waitFor(() => {
        expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(3);
      });

      const independentRow = screen
        .getByText('Independent Contractor')
        .closest('tr');
      expect(independentRow).toBeInTheDocument();

      const deleteButton = within(independentRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /supprimer|confirmer/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(employmentStatusAPI.delete).toHaveBeenCalledWith(3);
      });

      (employmentStatusAPI.getAll as jest.Mock).mockResolvedValue({
        data: mockStatuses,
        pagination: {
          page: 1,
          limit: 10,
          total: mockStatuses.length,
          totalPages: 1,
        },
      });

      await waitFor(() => {
        expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(4);
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Independent Contractor')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('List View', () => {
    it('should display all employment statuses with user count', async () => {
      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
        expect(screen.getByText('Part-time')).toBeInTheDocument();
      });

      // Verify user counts are displayed
      expect(screen.getByText(/50/)).toBeInTheDocument(); // Full-time has 50 users
      expect(screen.getByText(/15/)).toBeInTheDocument(); // Part-time has 15 users
    });

    it('should handle empty status list', async () => {
      (employmentStatusAPI.getAll as jest.Mock).mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText(/aucun statut|no status/i)).toBeInTheDocument();
      });
    });
  });

  describe('Create Flow', () => {
    it('should create a new employment status successfully', async () => {
      const user = userEvent.setup();

      (employmentStatusAPI.create as jest.Mock).mockResolvedValue({
        status: 'success',
        data: newStatus,
      });

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /créer un statut/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(labelInput, 'Contractor');
      await user.type(descriptionInput, 'Contract-based employee');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(employmentStatusAPI.create).toHaveBeenCalledWith({
          label: 'Contractor',
          description: 'Contract-based employee',
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors during creation', async () => {
      const user = userEvent.setup();

      (employmentStatusAPI.create as jest.Mock).mockRejectedValue(
        new Error('Label is required')
      );

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /créer un statut/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/label is required/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Edit Flow', () => {
    it('should edit an existing employment status successfully', async () => {
      const user = userEvent.setup();

      (employmentStatusAPI.update as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { ...mockStatuses[0], label: 'Full-time Permanent' },
      });

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const fullTimeRow = screen.getByText('Full-time').closest('tr');
      const editButton = within(fullTimeRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      await user.clear(labelInput);
      await user.type(labelInput, 'Full-time Permanent');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|modifier/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(employmentStatusAPI.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ label: 'Full-time Permanent' })
        );
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should pre-fill form with existing status data', async () => {
      const user = userEvent.setup();

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const fullTimeRow = screen.getByText('Full-time').closest('tr');
      const editButton = within(fullTimeRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        const labelInput = screen.getByLabelText(/label/i) as HTMLInputElement;
        const descriptionInput = screen.getByLabelText(
          /description/i
        ) as HTMLTextAreaElement;

        expect(labelInput.value).toBe('Full-time');
        expect(descriptionInput.value).toBe('Full-time employee');
      });
    });
  });

  describe('Delete Flow', () => {
    it('should delete an employment status successfully', async () => {
      const user = userEvent.setup();

      (employmentStatusAPI.delete as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const fullTimeRow = screen.getByText('Full-time').closest('tr');
      const deleteButton = within(fullTimeRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /supprimer|confirmer/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(employmentStatusAPI.delete).toHaveBeenCalledWith(1);
      });

      expect(employmentStatusAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should prevent deletion of status in use by users', async () => {
      const user = userEvent.setup();

      (employmentStatusAPI.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete employment status that is in use by users')
      );

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const fullTimeRow = screen.getByText('Full-time').closest('tr');
      const deleteButton = within(fullTimeRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /supprimer|confirmer/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/cannot delete employment status that is in use/i)
        ).toBeInTheDocument();
      });
    });

    it('should allow canceling deletion', async () => {
      const user = userEvent.setup();

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const fullTimeRow = screen.getByText('Full-time').closest('tr');
      const deleteButton = within(fullTimeRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', {
        name: /annuler|cancel/i,
      });
      await user.click(cancelButton);

      expect(employmentStatusAPI.delete).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors when loading list', async () => {
      (employmentStatusAPI.getAll as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(
          screen.getByText(/erreur lors du chargement/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors during creation', async () => {
      const user = userEvent.setup();

      (employmentStatusAPI.create as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<EmploymentStatusPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /créer un statut/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      await user.type(labelInput, 'Contractor');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });
});
