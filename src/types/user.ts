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
  phone?: string | null;
  profilePhoto?: string | null;
  salary?: number | null;
  hireDate?: string | null; // ISO date
  employmentStatusId?: number | null;
  profileId?: number | null;
  employmentStatus?: EmploymentStatus | null;
  profile?: Profile | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
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
  phone?: string | null;
  profilePhoto?: string | null;
  hireDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  profileId?: number | null;
  employmentStatusId?: number | null;
  profile?: {
    id: number;
    label: string;
  } | null;
  employmentStatus?: {
    id: number;
    label: string;
  } | null;
  profileLabel?: string | null;
  employmentStatusLabel?: string | null;
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
