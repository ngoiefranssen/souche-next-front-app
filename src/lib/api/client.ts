import { API_CONFIG } from './config';
import { getAuthToken } from '@/utils/auth/tokenManager';

interface FetchOptions extends RequestInit {
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
  }

  private async fetchWithRetry(
    url: string,
    options: FetchOptions = {},
    retries = API_CONFIG.RETRIES
  ): Promise<Response> {
    try {
      // Récupérer le token depuis les cookies
      const token = getAuthToken();
      const authHeaders: Record<string, string> = {};

      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...authHeaders,
          ...options?.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ApiClient] Request failed:', {
          url,
          status: response.status,
          error: errorText,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithRetry(
      `${this.baseURL}${endpoint}`,
      options
    );
    return response.json();
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
    return response.json();
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
    return response.json();
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      ...options,
    });
    return response.json();
  }

  setAuthToken(token: string) {
    this.headers.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.headers.Authorization;
  }
}

export const apiClient = new ApiClient();
