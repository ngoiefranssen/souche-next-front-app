/**
 * User type definitions
 * Corresponds to backend User model
 */

import { EmploymentStatus } from './employment-status';
import { Profile } from './profile';

/**
 * Complete user entity with all relations
 */
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePhoto: string;
  salary: number;
  hireDate: string; // ISO date
  employmentStatus: EmploymentStatus;
  profile: Profile;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Simplified user item for list views
 */
export interface UserListItem {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  profile: {
    id: number;
    label: string;
  };
  employmentStatus: {
    id: number;
    label: string;
  };
}

/**
 * User form data for create/update operations
 */
export interface UserFormData {
  email: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePhoto?: File;
  salary: number;
  hireDate: Date;
  employmentStatusId: number;
  profileId: number;
}
