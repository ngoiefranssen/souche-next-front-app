import { API_CONFIG } from './config';
import { getAuthToken, removeAuthToken } from '@/utils/auth/tokenManager';
import { logError, isAuthError } from '@/lib/utils/errorLogger';
import { extractApiErrorMessage } from '@/lib/utils/errorMessages';
import { addCsrfHeader } from '@/utils/auth/csrfProtection';
import { locales, defaultLocale } from '@/i18n/i18n.config';

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

  private getLocaleLoginPath(pathname: string): string {
    const localeMatch = pathname.match(/^\/([^/]+)(?=\/|$)/);
    const localeCandidate = localeMatch?.[1];
    const locale = locales.includes(localeCandidate as (typeof locales)[number])
      ? localeCandidate
      : defaultLocale;

    return `/${locale}/login`;
  }

  private isLoginPath(pathname: string): boolean {
    if (pathname === '/login') return true;
    return locales.some(
      locale =>
        pathname === `/${locale}/login` || pathname === `/${locale}/login/`
    );
  }

  private normalizeHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};

    if (headers instanceof Headers) {
      const result: Record<string, string> = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }

    if (Array.isArray(headers)) {
      return headers.reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    }

    return Object.entries(headers).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );
  }

  private removeHeader(
    headers: Record<string, string>,
    headerName: string
  ): void {
    const key = Object.keys(headers).find(
      existingKey => existingKey.toLowerCase() === headerName.toLowerCase()
    );

    if (key) {
      delete headers[key];
    }
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
      const mergedHeaders: Record<string, string> = {
        ...this.headers,
        ...authHeaders,
        ...this.normalizeHeaders(options?.headers),
      };

      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        // Let browser set multipart boundary automatically
        this.removeHeader(mergedHeaders, 'Content-Type');
      }

      const headersWithCsrf = await addCsrfHeader(mergedHeaders, method);

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
        const currentPath = window.location.pathname;

        // Nettoyer toutes les données d'authentification invalides
        removeAuthToken();
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        if (!this.isLoginPath(currentPath)) {
          // Sauvegarder l'URL actuelle pour redirection après login
          localStorage.setItem('redirectAfterLogin', currentPath);

          // Rediriger vers login de la locale active
          window.location.replace(this.getLocaleLoginPath(currentPath));
        }
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
    const isFormData =
      typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
    return response.json();
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const isFormData =
      typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
    return response.json();
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const isFormData =
      typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
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
