import { ENDPOINTS } from '@/lib/endpoints/auth/auth';
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { getAuthToken } from '@/utils/auth/tokenManager';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone: string;
  profilePhoto: string;
  profile: {
    id: number;
    label: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  employmentStatus: {
    id: number;
    label: string;
    description: string | null;
  };
}

export interface AuthResponse {
  status: 'success';
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: 'Bearer';
  };
  message: string;
}

export interface MeResponse {
  status: 'success';
  data: {
    user: User;
  };
}

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH?.LOGIN, credentials);
  },

  async logout(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token is required for logout');
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const logoutEndpoints = [
      ENDPOINTS.AUTH?.LOGOUT,
      ENDPOINTS.AUTH?.LOGOUT_LEGACY,
    ].filter(Boolean) as string[];

    for (const endpoint of logoutEndpoints) {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        return;
      }

      // Essayer l'endpoint legacy si le nouveau n'existe pas encore.
      if (response.status === 404) {
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Logout requires a valid authentication token');
      }

      throw new Error(`Logout failed with status: ${response.status}`);
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<MeResponse>(ENDPOINTS.AUTH?.ME);
    return response.data.user;
  },

  async refreshToken(): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>(ENDPOINTS.AUTH?.REFRESH);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH?.RESET_PASSWORD, { token, password });
  },
};
