/**
 * Integration tests for Profiles CRUD workflow
 * Tests the complete flow: list → create → edit → delete
 *
 * Validates: Requirements 3.1-3.8, 14.2
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilesPage from '@/app/[locale]/dashboard/profiles/page';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { profilesAPI } from '@/lib/api/profiles';
import type { Profile } from '@/types/profile';

// Mock the API
jest.mock('@/lib/api/profiles');
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
  usePathname: () => '/dashboard/profiles',
}));

// Test data
const mockProfiles: Profile[] = [
  {
    id: 1,
    label: 'Developer',
    description: 'Software developer profile',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
    _count: { users: 10 },
  },
  {
    id: 2,
    label: 'Designer',
    description: 'UI/UX designer profile',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    deletedAt: null,
    _count: { users: 5 },
  },
];

const newProfile: Profile = {
  id: 3,
  label: 'Product Manager',
  description: 'Product management profile',
  createdAt: '2024-01-03T00:00:00Z',
  updatedAt: '2024-01-03T00:00:00Z',
  deletedAt: null,
  _count: { users: 0 },
};

// Wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PermissionProvider>{children}</PermissionProvider>
);

describe('Profiles CRUD Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses by default
    (profilesAPI.getAll as jest.Mock).mockResolvedValue({
      data: mockProfiles,
      pagination: {
        page: 1,
        limit: 10,
        total: mockProfiles.length,
        totalPages: 1,
      },
    });
  });

  describe('Complete CRUD Flow', () => {
    it('should complete full CRUD workflow: list → create → edit → delete', async () => {
      const user = userEvent.setup();

      // Mock API responses for the full flow
      (profilesAPI.create as jest.Mock).mockResolvedValue({
        status: 'success',
        data: newProfile,
      });

      (profilesAPI.update as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { ...newProfile, label: 'Senior Product Manager' },
      });

      (profilesAPI.delete as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      // STEP 1: View list
      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      expect(screen.getByText('Designer')).toBeInTheDocument();
      expect(profilesAPI.getAll).toHaveBeenCalledTimes(1);

      // STEP 2: Create new profile
      const createButton = screen.getByRole('button', {
        name: /créer un profil/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.clear(labelInput);
      await user.type(labelInput, 'Product Manager');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Product management profile');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(profilesAPI.create).toHaveBeenCalledWith({
          label: 'Product Manager',
          description: 'Product management profile',
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Update mock to include new profile
      (profilesAPI.getAll as jest.Mock).mockResolvedValue({
        data: [...mockProfiles, newProfile],
        pagination: {
          page: 1,
          limit: 10,
          total: mockProfiles.length + 1,
          totalPages: 1,
        },
      });

      await waitFor(() => {
        expect(profilesAPI.getAll).toHaveBeenCalledTimes(2);
      });

      // STEP 3: Edit the newly created profile
      const pmRow = screen.getByText('Product Manager').closest('tr');
      expect(pmRow).toBeInTheDocument();

      const editButton = within(pmRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const editLabelInput = screen.getByLabelText(/label/i);
      await user.clear(editLabelInput);
      await user.type(editLabelInput, 'Senior Product Manager');

      const editSubmitButton = screen.getByRole('button', {
        name: /enregistrer|modifier/i,
      });
      await user.click(editSubmitButton);

      await waitFor(() => {
        expect(profilesAPI.update).toHaveBeenCalledWith(3, {
          label: 'Senior Product Manager',
          description: 'Product management profile',
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // STEP 4: Delete the profile
      const editedProfile = { ...newProfile, label: 'Senior Product Manager' };
      (profilesAPI.getAll as jest.Mock).mockResolvedValue({
        data: [...mockProfiles, editedProfile],
        pagination: {
          page: 1,
          limit: 10,
          total: mockProfiles.length + 1,
          totalPages: 1,
        },
      });

      await waitFor(() => {
        expect(profilesAPI.getAll).toHaveBeenCalledTimes(3);
      });

      const seniorPMRow = screen
        .getByText('Senior Product Manager')
        .closest('tr');
      expect(seniorPMRow).toBeInTheDocument();

      const deleteButton = within(seniorPMRow!).getByRole('button', {
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
        expect(profilesAPI.delete).toHaveBeenCalledWith(3);
      });

      (profilesAPI.getAll as jest.Mock).mockResolvedValue({
        data: mockProfiles,
        pagination: {
          page: 1,
          limit: 10,
          total: mockProfiles.length,
          totalPages: 1,
        },
      });

      await waitFor(() => {
        expect(profilesAPI.getAll).toHaveBeenCalledTimes(4);
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Senior Product Manager')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('List View', () => {
    it('should display all profiles with user count', async () => {
      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
        expect(screen.getByText('Designer')).toBeInTheDocument();
      });

      // Verify user counts are displayed
      expect(screen.getByText(/10/)).toBeInTheDocument(); // Developer has 10 users
      expect(screen.getByText(/5/)).toBeInTheDocument(); // Designer has 5 users
    });

    it('should handle empty profile list', async () => {
      (profilesAPI.getAll as jest.Mock).mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(
          screen.getByText(/aucun profil|no profiles/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Create Flow', () => {
    it('should create a new profile successfully', async () => {
      const user = userEvent.setup();

      (profilesAPI.create as jest.Mock).mockResolvedValue({
        status: 'success',
        data: newProfile,
      });

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /créer un profil/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(labelInput, 'Product Manager');
      await user.type(descriptionInput, 'Product management profile');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(profilesAPI.create).toHaveBeenCalledWith({
          label: 'Product Manager',
          description: 'Product management profile',
        });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(profilesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle duplicate profile label error', async () => {
      const user = userEvent.setup();

      (profilesAPI.create as jest.Mock).mockRejectedValue(
        new Error('Profile with this label already exists')
      );

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /créer un profil/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      await user.type(labelInput, 'Developer'); // Duplicate label

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|créer/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/profile with this label already exists/i)
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Edit Flow', () => {
    it('should edit an existing profile successfully', async () => {
      const user = userEvent.setup();

      (profilesAPI.update as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { ...mockProfiles[0], label: 'Senior Developer' },
      });

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const devRow = screen.getByText('Developer').closest('tr');
      const editButton = within(devRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      await user.clear(labelInput);
      await user.type(labelInput, 'Senior Developer');

      const submitButton = screen.getByRole('button', {
        name: /enregistrer|modifier/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(profilesAPI.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ label: 'Senior Developer' })
        );
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(profilesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should pre-fill form with existing profile data', async () => {
      const user = userEvent.setup();

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const devRow = screen.getByText('Developer').closest('tr');
      const editButton = within(devRow!).getByRole('button', {
        name: /modifier|edit/i,
      });
      await user.click(editButton);

      await waitFor(() => {
        const labelInput = screen.getByLabelText(/label/i) as HTMLInputElement;
        const descriptionInput = screen.getByLabelText(
          /description/i
        ) as HTMLTextAreaElement;

        expect(labelInput.value).toBe('Developer');
        expect(descriptionInput.value).toBe('Software developer profile');
      });
    });
  });

  describe('Delete Flow', () => {
    it('should delete a profile successfully', async () => {
      const user = userEvent.setup();

      (profilesAPI.delete as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const devRow = screen.getByText('Developer').closest('tr');
      const deleteButton = within(devRow!).getByRole('button', {
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
        expect(profilesAPI.delete).toHaveBeenCalledWith(1);
      });

      expect(profilesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle foreign key constraint error when deleting profile with users', async () => {
      const user = userEvent.setup();

      (profilesAPI.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete profile that has associated users')
      );

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const devRow = screen.getByText('Developer').closest('tr');
      const deleteButton = within(devRow!).getByRole('button', {
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
          screen.getByText(/cannot delete profile that has associated users/i)
        ).toBeInTheDocument();
      });
    });

    it('should allow canceling deletion', async () => {
      const user = userEvent.setup();

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const devRow = screen.getByText('Developer').closest('tr');
      const deleteButton = within(devRow!).getByRole('button', {
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

      expect(profilesAPI.delete).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors when loading list', async () => {
      (profilesAPI.getAll as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(
          screen.getByText(/erreur lors du chargement/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors during creation', async () => {
      const user = userEvent.setup();

      (profilesAPI.create as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<ProfilesPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Developer')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /créer un profil/i,
      });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const labelInput = screen.getByLabelText(/label/i);
      await user.type(labelInput, 'Product Manager');

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
