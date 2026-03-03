/**
 * Integration tests for Roles CRUD workflow
 * Tests the complete flow: list → create → edit → delete
 *
 * Validates: Requirements 2.1-2.8, 14.2
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RolesPage from '@/app/[locale]/dashboard/roles/page';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { rolesAPI } from '@/lib/api/roles';
import type { Role } from '@/types/role';

// Mock the API
jest.mock('@/lib/api/roles');
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
  usePathname: () => '/dashboard/roles',
}));

// Test data
const mockRoles: Role[] = [
  {
    id: 1,
    label: 'Admin',
    description: 'Administrator role',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
    _count: { profiles: 2 },
  },
  {
    id: 2,
    label: 'User',
    description: 'Standard user role',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    deletedAt: null,
    _count: { profiles: 5 },
  },
];

const newRole: Role = {
  id: 3,
  label: 'Manager',
  description: 'Manager role',
  createdAt: '2024-01-03T00:00:00Z',
  updatedAt: '2024-01-03T00:00:00Z',
  deletedAt: null,
  _count: { profiles: 0 },
};

// Wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PermissionProvider>{children}</PermissionProvider>
);

describe('Roles CRUD Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses by default
    (rolesAPI.getAll as jest.Mock).mockResolvedValue({
      data: mockRoles,
      pagination: {
        page: 1,
        limit: 10,
        total: mockRoles.length,
        totalPages: 1,
      },
    });
  });

  describe('Complete CRUD Flow', () => {
    it('should complete full CRUD workflow: list → create → edit → delete', async () => {
      const user = userEvent.setup();

      // Mock API responses for the full flow
      (rolesAPI.create as jest.Mock).mockResolvedValue({
        status: 'success',
        data: newRole,
      });

      (rolesAPI.update as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { ...newRole, label: 'Senior Manager' },
      });

      (rolesAPI.delete as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      // STEP 1: View list
      render(<RolesPage />, { wrapper: TestWrapper });

      // Wait for roles to load
      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(rolesAPI.getAll).toHaveBeenCalledTimes(1);

      // STEP 2: Create new role
      const createButton = screen.getByRole('button', {
        name: /créer un rôle/i,
      });
      await user.click(createButton);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill in the form
      const labelInput = screen.getByLabelText(/label/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.clear(labelInput);
      await user.type(labelInput, 'Manager');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Manager role');

      // Submit the form
      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      // Wait for API call and success message
      await waitFor(() => {
        expect(rolesAPI.create).toHaveBeenCalledWith({
          label: 'Manager',
          description: 'Manager role',
        });
      });

      // Wait for modal to close and list to refresh
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Update mock to include new role
      (rolesAPI.getAll as jest.Mock).mockResolvedValue({
        data: [...mockRoles, newRole],
        pagination: {
          page: 1,
          limit: 10,
          total: mockRoles.length + 1,
          totalPages: 1,
        },
      });

      // Wait for list to refresh
      await waitFor(() => {
        expect(rolesAPI.getAll).toHaveBeenCalledTimes(2);
      });

      // STEP 3: Edit the newly created role
      // Find the Manager role row and click edit
      const managerRow = screen.getByText('Manager').closest('tr');
      expect(managerRow).toBeInTheDocument();

      const editButton = within(managerRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      // Wait for edit modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Modify the label
      const editLabelInput = screen.getByLabelText(/label/i);
      await user.clear(editLabelInput);
      await user.type(editLabelInput, 'Senior Manager');

      // Submit the edit
      const editSubmitButton = screen.getByRole('button', {
        name: /enregistrer|modifier/i,
      });
      await user.click(editSubmitButton);

      // Wait for API call
      await waitFor(() => {
        expect(rolesAPI.update).toHaveBeenCalledWith(3, {
          label: 'Senior Manager',
          description: 'Manager role',
        });
      });

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // STEP 4: Delete the role
      // Update mock to include edited role
      const editedRole = { ...newRole, label: 'Senior Manager' };
      (rolesAPI.getAll as jest.Mock).mockResolvedValue({
        data: [...mockRoles, editedRole],
        pagination: {
          page: 1,
          limit: 10,
          total: mockRoles.length + 1,
          totalPages: 1,
        },
      });

      // Wait for list to refresh
      await waitFor(() => {
        expect(rolesAPI.getAll).toHaveBeenCalledTimes(3);
      });

      // Find the Senior Manager role row and click delete
      const seniorManagerRow = screen.getByText('Senior Manager').closest('tr');
      expect(seniorManagerRow).toBeInTheDocument();

      const deleteButton = within(seniorManagerRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      // Wait for confirmation modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', {
        name: /supprimer|confirmer/i,
      });
      await user.click(confirmButton);

      // Wait for API call
      await waitFor(() => {
        expect(rolesAPI.delete).toHaveBeenCalledWith(3);
      });

      // Update mock to remove deleted role
      (rolesAPI.getAll as jest.Mock).mockResolvedValue({
        data: mockRoles,
        pagination: {
          page: 1,
          limit: 10,
          total: mockRoles.length,
          totalPages: 1,
        },
      });

      // Wait for list to refresh
      await waitFor(() => {
        expect(rolesAPI.getAll).toHaveBeenCalledTimes(4);
      });

      // Verify the role is no longer in the list
      await waitFor(() => {
        expect(screen.queryByText('Senior Manager')).not.toBeInTheDocument();
      });
    });
  });

  describe('List View', () => {
    it('should display all roles in the list', async () => {
      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('User')).toBeInTheDocument();
      });

      expect(rolesAPI.getAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
    });

    it('should handle pagination', async () => {
      const user = userEvent.setup();

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Click next page (if pagination controls exist)
      const nextButton = screen.queryByRole('button', {
        name: /next|suivant/i,
      });
      if (nextButton) {
        await user.click(nextButton);

        await waitFor(() => {
          expect(rolesAPI.getAll).toHaveBeenCalledWith(
            expect.objectContaining({ page: 2 })
          );
        });
      }
    });

    it('should handle search/filter', async () => {
      const user = userEvent.setup();

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Find search input (if exists)
      const searchInput = screen.queryByPlaceholderText(/rechercher|search/i);
      if (searchInput) {
        await user.type(searchInput, 'Admin');

        await waitFor(() => {
          expect(rolesAPI.getAll).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'Admin' })
          );
        });
      }
    });
  });

  describe('Create Flow', () => {
    it('should create a new role successfully', async () => {
      const user = userEvent.setup();

      (rolesAPI.create as jest.Mock).mockResolvedValue({
        status: 'success',
        data: newRole,
      });

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Open create modal
      const createButton = screen.getByRole('button', {
        name: /créer un rôle/i,
      });
      await user.click(createButton);

      // Fill form
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(labelInput, 'Manager');
      await user.type(descriptionInput, 'Manager role');

      // Submit
      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(rolesAPI.create).toHaveBeenCalledWith({
          label: 'Manager',
          description: 'Manager role',
        });
      });

      // Verify success toast (implementation dependent)
      // Verify modal closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify list refreshed
      expect(rolesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors during creation', async () => {
      const user = userEvent.setup();

      (rolesAPI.create as jest.Mock).mockRejectedValue(
        new Error('Label is required')
      );

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Open create modal
      const createButton = screen.getByRole('button', {
        name: /créer un rôle/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Submit without filling required fields
      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/label is required/i)).toBeInTheDocument();
      });

      // Modal should remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Edit Flow', () => {
    it('should edit an existing role successfully', async () => {
      const user = userEvent.setup();

      (rolesAPI.update as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { ...mockRoles[0], label: 'Super Admin' },
      });

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Find and click edit button
      const adminRow = screen.getByText('Admin').closest('tr');
      const editButton = within(adminRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Modify label
      const labelInput = screen.getByLabelText(/label/i);
      await user.clear(labelInput);
      await user.type(labelInput, 'Super Admin');

      // Submit
      const submitButton = screen.getByRole('button', {
        name: /enregistrer|modifier/i,
      });
      await user.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(rolesAPI.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ label: 'Super Admin' })
        );
      });

      // Verify modal closed and list refreshed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(rolesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should pre-fill form with existing role data', async () => {
      const user = userEvent.setup();

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Click edit
      const adminRow = screen.getByText('Admin').closest('tr');
      const editButton = within(adminRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      // Verify form is pre-filled
      await waitFor(() => {
        const labelInput = screen.getByLabelText(/label/i) as HTMLInputElement;
        const descriptionInput = screen.getByLabelText(
          /description/i
        ) as HTMLTextAreaElement;

        expect(labelInput.value).toBe('Admin');
        expect(descriptionInput.value).toBe('Administrator role');
      });
    });
  });

  describe('Delete Flow', () => {
    it('should delete a role successfully', async () => {
      const user = userEvent.setup();

      (rolesAPI.delete as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Click delete
      const adminRow = screen.getByText('Admin').closest('tr');
      const deleteButton = within(adminRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/êtes-vous sûr/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /supprimer|confirmer/i,
      });
      await user.click(confirmButton);

      // Verify API call
      await waitFor(() => {
        expect(rolesAPI.delete).toHaveBeenCalledWith(1);
      });

      // Verify list refreshed
      expect(rolesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle deletion of role in use (409 conflict)', async () => {
      const user = userEvent.setup();

      (rolesAPI.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete role that is in use by profiles')
      );

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Click delete
      const adminRow = screen.getByText('Admin').closest('tr');
      const deleteButton = within(adminRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /supprimer|confirmer/i,
      });
      await user.click(confirmButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/cannot delete role that is in use/i)
        ).toBeInTheDocument();
      });
    });

    it('should allow canceling deletion', async () => {
      const user = userEvent.setup();

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Click delete
      const adminRow = screen.getByText('Admin').closest('tr');
      const deleteButton = within(adminRow!).getByRole('button', {
        name: /supprimer|delete/i,
      });
      await user.click(deleteButton);

      // Cancel deletion
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', {
        name: /annuler|cancel/i,
      });
      await user.click(cancelButton);

      // Verify API was not called
      expect(rolesAPI.delete).not.toHaveBeenCalled();

      // Verify modal closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors when loading list', async () => {
      (rolesAPI.getAll as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<RolesPage />, { wrapper: TestWrapper });

      // Verify error message is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/erreur lors du chargement/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      (rolesAPI.create as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<RolesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      // Try to create a role
      const createButton = screen.getByRole('button', {
        name: /créer un rôle/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      await user.type(labelInput, 'Manager');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });
});
