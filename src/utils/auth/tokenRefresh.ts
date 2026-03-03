/**
 * Automatic Token Refresh Utility
 *
 * This module handles automatic JWT token refresh before expiration.
 * It monitors token expiration and refreshes it proactively to maintain
 * uninterrupted user sessions.
 *
 * SECURITY FEATURES:
 * - Proactive refresh (5 minutes before expiration)
 * - Automatic logout on refresh failure
 * - Single refresh request at a time (prevents race conditions)
 * - Clears all auth data on failure
 */

import { authAPI } from '@/lib/api/auth/auth';
import { setAuthToken, removeAuthToken, getAuthToken } from './tokenManager';

// Token refresh state
let refreshTimer: NodeJS.Timeout | null = null;
let isRefreshing = false;

/**
 * Decode JWT token to extract expiration time
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
function decodeTokenExpiration(token: string): number | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (base64url)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);

    // JWT exp is in seconds, convert to milliseconds
    if (decoded.exp && typeof decoded.exp === 'number') {
      return decoded.exp * 1000;
    }

    return null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Calculate time until token refresh should occur
 * Refreshes 5 minutes before expiration
 * @param expirationTime - Token expiration timestamp in milliseconds
 * @returns Milliseconds until refresh should occur
 */
function calculateRefreshDelay(expirationTime: number): number {
  const now = Date.now();
  const timeUntilExpiration = expirationTime - now;

  // Refresh 5 minutes (300000ms) before expiration
  const REFRESH_BUFFER = 5 * 60 * 1000;
  const refreshDelay = timeUntilExpiration - REFRESH_BUFFER;

  // If token expires in less than 5 minutes, refresh immediately
  return Math.max(0, refreshDelay);
}

/**
 * Perform token refresh
 * @returns true if refresh succeeded, false otherwise
 */
async function performTokenRefresh(): Promise<boolean> {
  // Prevent concurrent refresh requests
  if (isRefreshing) {
    console.log('[TokenRefresh] Refresh already in progress, skipping');
    return false;
  }

  isRefreshing = true;

  try {
    console.log('[TokenRefresh] Refreshing token...');

    // Call refresh token API
    const response = await authAPI.refreshToken();

    if (response.token) {
      // Store new token
      setAuthToken(response.token);

      console.log('[TokenRefresh] Token refreshed successfully');

      // Schedule next refresh
      scheduleTokenRefresh(response.token);

      return true;
    }

    console.error('[TokenRefresh] No token in refresh response');
    return false;
  } catch (error) {
    console.error('[TokenRefresh] Token refresh failed:', error);

    // Refresh failed - logout user
    await handleRefreshFailure();

    return false;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Handle token refresh failure by logging out the user
 */
async function handleRefreshFailure(): Promise<void> {
  console.log('[TokenRefresh] Handling refresh failure - logging out user');

  // Clear token
  removeAuthToken();

  // Clear all auth data from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    localStorage.removeItem('user-permissions');
    localStorage.removeItem('user-permissions-timestamp');

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));

    // Redirect to login
    window.location.href = '/login?reason=session-expired';
  }
}

/**
 * Schedule automatic token refresh
 * @param token - JWT token to schedule refresh for
 */
export function scheduleTokenRefresh(token: string): void {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Decode token to get expiration
  const expirationTime = decodeTokenExpiration(token);

  if (!expirationTime) {
    console.error('[TokenRefresh] Could not decode token expiration');
    return;
  }

  // Calculate when to refresh
  const refreshDelay = calculateRefreshDelay(expirationTime);

  const expirationDate = new Date(expirationTime);
  const refreshDate = new Date(Date.now() + refreshDelay);

  console.log('[TokenRefresh] Token expires at:', expirationDate.toISOString());
  console.log(
    '[TokenRefresh] Refresh scheduled for:',
    refreshDate.toISOString()
  );
  console.log(
    '[TokenRefresh] Refresh in:',
    Math.round(refreshDelay / 1000),
    'seconds'
  );

  // Schedule refresh
  refreshTimer = setTimeout(() => {
    performTokenRefresh();
  }, refreshDelay);
}

/**
 * Initialize token refresh monitoring
 * Call this when the app loads or user logs in
 */
export function initializeTokenRefresh(): void {
  const token = getAuthToken();

  if (!token) {
    console.log('[TokenRefresh] No token found, skipping initialization');
    return;
  }

  console.log('[TokenRefresh] Initializing token refresh monitoring');
  scheduleTokenRefresh(token);
}

/**
 * Stop token refresh monitoring
 * Call this when user logs out
 */
export function stopTokenRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
    console.log('[TokenRefresh] Token refresh monitoring stopped');
  }
}

/**
 * Check if token is expired
 * @param token - JWT token to check
 * @returns true if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expirationTime = decodeTokenExpiration(token);

  if (!expirationTime) {
    return true;
  }

  return Date.now() >= expirationTime;
}

/**
 * Get time until token expiration
 * @param token - JWT token to check
 * @returns Milliseconds until expiration, or 0 if expired/invalid
 */
export function getTimeUntilExpiration(token: string): number {
  const expirationTime = decodeTokenExpiration(token);

  if (!expirationTime) {
    return 0;
  }

  const timeUntil = expirationTime - Date.now();
  return Math.max(0, timeUntil);
}
