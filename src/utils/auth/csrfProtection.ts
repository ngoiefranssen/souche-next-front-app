/**
 * CSRF Protection Utility
 *
 * This module provides CSRF (Cross-Site Request Forgery) protection
 * by managing CSRF tokens for state-changing requests.
 *
 * SECURITY FEATURES:
 * - CSRF token required for POST, PUT, DELETE, PATCH requests
 * - Token stored in non-httpOnly cookie (readable by JavaScript)
 * - Token included in X-CSRF-Token header
 * - Automatic token retrieval and caching
 * - Token refresh on expiration
 */

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Get CSRF token from cookies
 * @returns CSRF token string or null if not found
 */
export function getCsrfToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find(row =>
    row.startsWith(`${CSRF_TOKEN_COOKIE_NAME}=`)
  );

  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }

  return null;
}

/**
 * Fetch a new CSRF token from the server
 * @returns Promise resolving to the CSRF token
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data = await response.json();

    if (data.token) {
      return data.token;
    }

    throw new Error('No CSRF token in response');
  } catch (error) {
    console.error('[CSRF] Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Get CSRF token, fetching from server if not available in cookies
 * @returns Promise resolving to the CSRF token
 */
export async function ensureCsrfToken(): Promise<string> {
  // Try to get token from cookies first
  let token = getCsrfToken();

  if (token) {
    return token;
  }

  // If not in cookies, fetch from server
  token = await fetchCsrfToken();

  return token;
}

/**
 * Check if a request method requires CSRF protection
 * @param method - HTTP method
 * @returns true if method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Add CSRF token to request headers
 * @param headers - Existing headers object
 * @param method - HTTP method
 * @returns Headers with CSRF token added if required
 */
export async function addCsrfHeader(
  headers: Record<string, string>,
  method: string
): Promise<Record<string, string>> {
  // Only add CSRF token for state-changing requests
  if (!requiresCsrfProtection(method)) {
    return headers;
  }

  try {
    const token = await ensureCsrfToken();

    return {
      ...headers,
      [CSRF_HEADER_NAME]: token,
    };
  } catch (error) {
    console.error('[CSRF] Failed to add CSRF header:', error);
    // Return headers without CSRF token - let the server reject the request
    return headers;
  }
}

/**
 * Create a fetch wrapper with automatic CSRF protection
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise resolving to the Response
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';

  // Add CSRF token to headers if needed
  if (requiresCsrfProtection(method)) {
    const token = await ensureCsrfToken();

    options.headers = {
      ...options.headers,
      [CSRF_HEADER_NAME]: token,
    };
  }

  return fetch(url, options);
}

/**
 * Initialize CSRF protection by fetching token on app load
 * Call this when the app initializes
 */
export async function initializeCsrfProtection(): Promise<void> {
  try {
    // Check if token exists in cookies
    const existingToken = getCsrfToken();

    if (!existingToken) {
      console.log('[CSRF] No token found, fetching from server...');
      await fetchCsrfToken();
      console.log('[CSRF] CSRF token initialized');
    } else {
      console.log('[CSRF] CSRF token already present');
    }
  } catch (error) {
    console.error('[CSRF] Failed to initialize CSRF protection:', error);
  }
}

/**
 * Refresh CSRF token
 * Call this if you suspect the token has expired or been invalidated
 */
export async function refreshCsrfToken(): Promise<string> {
  console.log('[CSRF] Refreshing CSRF token...');
  const token = await fetchCsrfToken();
  console.log('[CSRF] CSRF token refreshed');
  return token;
}

/**
 * Get CSRF header name
 * Useful for debugging or custom implementations
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}
