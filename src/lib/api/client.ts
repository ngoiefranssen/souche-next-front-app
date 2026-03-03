import { API_CONFIG } from './config';
import { getAuthToken } from '@/utils/auth/tokenManager';
import { logError, isAuthError } from '@/lib/utils/errorLogger';
import { extractApiErrorMessage } from '@/lib/utils/errorMessages';
import { addCsrfHeader } from '@/utils/auth/csrfProtection';

interface FetchOptions extends RequestInit {
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
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
      // Récupérer le token JWT depuis les cookies
      // Le token est stocké dans un cookie non-httpOnly pour permettre
      // l'accès par le middleware Next.js tout en restant sécurisé
      const token = getAuthToken();
      const authHeaders: Record<string, string> = {};

      // Inclure le JWT dans le header Authorization de toutes les requêtes API
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }

      // Add CSRF protection for state-changing requests
      const method = options.method || 'GET';
      const headersWithCsrf = await addCsrfHeader(
        {
          ...this.headers,
          ...authHeaders,
          ...options?.headers,
        },
        method
      );

      const response = await fetch(url, {
        ...options,
        headers: headersWithCsrf,
        credentials: 'include',
      });

      if (!response.ok) {
        await this.handleErrorResponse(response, url);
      }

      return response;
    } catch (error) {
      // Ne pas retry les erreurs d'authentification ou de permission
      if (
        isAuthError(error) ||
        (error instanceof ApiError && error.status === 403)
      ) {
        throw error;
      }

      // Retry pour les erreurs réseau ou serveur
      if (retries > 0) {
        const delay = Math.pow(2, API_CONFIG.RETRIES - retries) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1);
      }

      throw error;
    }
  }

  private async handleErrorResponse(
    response: Response,
    url: string
  ): Promise<never> {
    const status = response.status;

    // Extraire le message d'erreur de la réponse
    let errorMessage: string;
    try {
      errorMessage = await extractApiErrorMessage(response.clone());
    } catch {
      errorMessage = `HTTP error! status: ${status}`;
    }

    // Logger l'erreur
    logError(new Error(errorMessage), {
      url,
      status,
      method: response.url,
    });

    // Gérer les erreurs d'authentification (401)
    if (status === 401) {
      // Rediriger vers la page de login
      if (typeof window !== 'undefined') {
        // Sauvegarder l'URL actuelle pour redirection après login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          localStorage.setItem('redirectAfterLogin', currentPath);
        }

        // Effacer les données d'authentification
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Rediriger vers login
        window.location.href = '/login';
      }
    }

    // Gérer les erreurs de permission (403)
    if (status === 403) {
      // Rediriger vers page 403 ou dashboard
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }

    // Créer et lancer l'erreur
    throw new ApiError(errorMessage, status, response);
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
