import { ENDPOINTS } from '@/lib/endpoints/auth/auth';
import { apiClient } from '../client';
import { API_CONFIG } from '../config';

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
    try {
      // Appeler l'API de logout sans attendre de réponse JSON
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH?.LOGOUT}`,
        {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }

      return;
    } catch (error) {
      throw error;
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
