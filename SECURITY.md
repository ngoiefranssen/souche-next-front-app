# Frontend Security Documentation

## Overview

This document describes the security measures implemented in the frontend application to protect user data and prevent common web vulnerabilities.

## Table of Contents

1. [JWT Token Management](#jwt-token-management)
2. [Automatic Token Refresh](#automatic-token-refresh)
3. [CSRF Protection](#csrf-protection)
4. [Session Timeout](#session-timeout)
5. [Sensitive Data Filtering](#sensitive-data-filtering)
6. [Security Testing Guide](#security-testing-guide)
7. [Security Best Practices](#security-best-practices)

---

## JWT Token Management

### Implementation

**Location**: `src/utils/auth/tokenManager.ts`

### Features

- **Cookie Storage**: JWT tokens are stored in non-httpOnly cookies to allow access by Next.js middleware and client-side code
- **SameSite Protection**: Cookies use `SameSite=Lax` to protect against CSRF attacks
- **Secure Flag**: In production (HTTPS), cookies are marked as `Secure`
- **Automatic Inclusion**: Tokens are automatically included in all API requests via the `Authorization` header

### Security Considerations

**Why non-httpOnly cookies?**

- Next.js middleware needs to read the token for route protection
- Client-side code needs access for API requests
- SameSite=Lax provides CSRF protection
- Secure flag ensures HTTPS-only transmission in production

### Usage

```typescript
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '@/utils/auth/tokenManager';

// Get token
const token = getAuthToken();

// Set token (called after login)
setAuthToken(token, maxAge);

// Remove token (called on logout)
removeAuthToken();
```

### Testing

1. **Verify token storage**:
   - Login to the application
   - Open DevTools → Application → Cookies
   - Verify `auth-token` cookie exists with correct attributes:
     - `SameSite`: Lax
     - `Secure`: true (in production)
     - `Path`: /

2. **Verify token inclusion**:
   - Open DevTools → Network
   - Make an API request
   - Check request headers for `Authorization: Bearer <token>`

---

## Automatic Token Refresh

### Implementation

**Location**: `src/utils/auth/tokenRefresh.ts`

### Features

- **Proactive Refresh**: Tokens are refreshed 5 minutes before expiration
- **Automatic Logout**: If refresh fails, user is automatically logged out
- **Single Request**: Prevents race conditions with concurrent refresh requests
- **JWT Decoding**: Extracts expiration time from JWT payload

### How It Works

1. On login or app load, the token expiration is decoded
2. A timer is scheduled to refresh the token 5 minutes before expiration
3. When the timer fires, a refresh request is sent to the backend
4. If successful, the new token is stored and a new timer is scheduled
5. If failed, all auth data is cleared and user is redirected to login

### Usage

```typescript
import {
  initializeTokenRefresh,
  stopTokenRefresh,
  isTokenExpired,
  getTimeUntilExpiration,
} from '@/utils/auth/tokenRefresh';

// Initialize (called on login or app load)
initializeTokenRefresh();

// Stop monitoring (called on logout)
stopTokenRefresh();

// Check if token is expired
const expired = isTokenExpired(token);

// Get time until expiration
const timeUntil = getTimeUntilExpiration(token);
```

### Testing

1. **Verify automatic refresh**:
   - Login to the application
   - Open DevTools → Console
   - Look for log messages:
     - `[TokenRefresh] Token expires at: <date>`
     - `[TokenRefresh] Refresh scheduled for: <date>`
   - Wait for the scheduled time
   - Verify refresh occurs: `[TokenRefresh] Token refreshed successfully`

2. **Verify logout on failure**:
   - Simulate a failed refresh (disconnect backend or modify token)
   - Verify user is logged out and redirected to login

---

## CSRF Protection

### Implementation

**Locations**:

- `src/utils/auth/csrfProtection.ts` (client-side)
- `src/app/api/csrf/route.ts` (API endpoint)
- `src/components/CsrfInitializer.tsx` (initialization)

### Features

- **Token Generation**: Server generates random CSRF tokens
- **Cookie Storage**: Tokens stored in non-httpOnly cookies (readable by JavaScript)
- **Header Inclusion**: Tokens included in `X-CSRF-Token` header for state-changing requests
- **Automatic Protection**: POST, PUT, DELETE, PATCH requests automatically include CSRF token
- **Token Refresh**: Tokens can be refreshed if expired

### How It Works

1. On app load, `CsrfInitializer` fetches a CSRF token from `/api/csrf`
2. Token is stored in a non-httpOnly cookie named `csrf-token`
3. For state-changing requests (POST, PUT, DELETE, PATCH), the token is:
   - Read from the cookie
   - Included in the `X-CSRF-Token` header
4. Backend validates the token before processing the request

### Usage

CSRF protection is automatic when using the API client:

```typescript
import { apiClient } from '@/lib/api/client';

// CSRF token automatically included
await apiClient.post('/users', userData);
await apiClient.put('/users/1', userData);
await apiClient.delete('/users/1');
```

Manual usage:

```typescript
import {
  getCsrfToken,
  ensureCsrfToken,
  addCsrfHeader,
  fetchWithCsrf,
} from '@/utils/auth/csrfProtection';

// Get token from cookie
const token = getCsrfToken();

// Ensure token exists (fetch if needed)
const token = await ensureCsrfToken();

// Add CSRF header to existing headers
const headers = await addCsrfHeader(existingHeaders, 'POST');

// Fetch with automatic CSRF protection
const response = await fetchWithCsrf('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### Testing

1. **Verify token generation**:
   - Open DevTools → Application → Cookies
   - Verify `csrf-token` cookie exists

2. **Verify token inclusion**:
   - Open DevTools → Network
   - Make a POST/PUT/DELETE request
   - Check request headers for `X-CSRF-Token: <token>`

3. **Verify protection**:
   - Try making a POST request without CSRF token
   - Backend should reject with 403 Forbidden

---

## Session Timeout

### Implementation

**Location**: `src/utils/auth/sessionTimeout.ts`

### Features

- **Inactivity Detection**: Monitors user activity (mouse, keyboard, touch, scroll)
- **Configurable Timeout**: Default 30 minutes of inactivity
- **Warning System**: Optional warning 2 minutes before timeout
- **Automatic Logout**: Logs out user after timeout period
- **Activity Reset**: Timer resets on any user interaction

### How It Works

1. On login, session timeout monitoring starts
2. Event listeners track user activity (mousedown, mousemove, keypress, scroll, touchstart, click)
3. Each activity resets the inactivity timer
4. If no activity for 28 minutes, warning callback is triggered (optional)
5. If no activity for 30 minutes, timeout callback is triggered
6. Timeout callback logs out user and redirects to login

### Usage

```typescript
import {
  startSessionTimeout,
  stopMonitoring,
  extendSession,
  isSessionTimeoutActive,
} from '@/utils/auth/sessionTimeout';

// Start monitoring (called on login)
startSessionTimeout({
  onTimeout: handleSessionTimeout,
  onWarning: handleSessionWarning, // optional
});

// Stop monitoring (called on logout)
stopMonitoring();

// Manually extend session
extendSession();

// Check if monitoring is active
const active = isSessionTimeoutActive();
```

### Testing

1. **Verify activity detection**:
   - Login to the application
   - Open DevTools → Console
   - Move mouse or press keys
   - Verify timer resets (check logs if enabled)

2. **Verify timeout**:
   - Login to the application
   - Don't interact for 30 minutes
   - Verify automatic logout and redirect to login

3. **Verify warning** (if implemented):
   - Login to the application
   - Don't interact for 28 minutes
   - Verify warning notification appears

---

## Sensitive Data Filtering

### Implementation

**Location**: `src/lib/utils/secureLogger.ts`

### Features

- **Automatic Filtering**: Filters passwords, tokens, API keys, PII before logging
- **Pattern Detection**: Detects and redacts JWT tokens, emails, SSNs, credit cards, phone numbers
- **Field Name Detection**: Redacts fields with sensitive names (password, token, secret, etc.)
- **Production Safety**: Disables detailed logging in production
- **Recursive Sanitization**: Sanitizes nested objects and arrays

### Filtered Data Types

**Sensitive Field Names**:

- password, passwd, pwd
- secret, token, accesstoken, refreshtoken
- apikey, api_key, authorization, auth, bearer, jwt
- session, cookie, csrf
- ssn, social_security
- credit_card, creditcard, card_number, cvv, pin
- private_key, privatekey

**Sensitive Patterns**:

- JWT tokens (Bearer xxx.yyy.zzz)
- Email addresses
- Social Security Numbers (XXX-XX-XXXX)
- Credit card numbers
- Phone numbers

### Usage

```typescript
import {
  secureLog,
  secureInfo,
  secureWarn,
  secureError,
  secureDebug,
  sanitizeForLogging,
  createSecureLogger,
} from '@/lib/utils/secureLogger';

// Basic logging (automatically filters sensitive data)
secureLog('User data', { username: 'john', password: 'secret123' });
// Output: { username: 'john', password: '[REDACTED]' }

secureInfo('API response', responseData);
secureWarn('Validation failed', validationErrors);
secureError('Request failed', error);
secureDebug('Debug info', debugData);

// Manual sanitization
const sanitized = sanitizeForLogging(userData);

// Create logger with prefix
const logger = createSecureLogger('AuthService');
logger.log('User logged in', userData);
```

### Testing

1. **Verify field filtering**:

   ```typescript
   secureLog('Test', {
     username: 'john',
     password: 'secret123',
     token: 'abc123',
   });
   // Should log: { username: 'john', password: '[REDACTED]', token: '[REDACTED]' }
   ```

2. **Verify pattern filtering**:

   ```typescript
   secureLog('Test', {
     message: 'Token: Bearer eyJhbGc.eyJzdWI.SflKxw',
     email: 'user@example.com',
   });
   // Should redact JWT and email
   ```

3. **Verify production behavior**:
   - Set `NODE_ENV=production`
   - Verify detailed logs are disabled
   - Verify only errors are logged

---

## Security Testing Guide

### Manual Testing Checklist

#### JWT Token Management

- [ ] Login and verify token is stored in cookies
- [ ] Verify token has correct attributes (SameSite, Secure, Path)
- [ ] Verify token is included in API request headers
- [ ] Logout and verify token is removed

#### Token Refresh

- [ ] Login and check console for refresh schedule
- [ ] Wait for scheduled refresh and verify it occurs
- [ ] Simulate refresh failure and verify logout
- [ ] Verify new token is stored after successful refresh

#### CSRF Protection

- [ ] Verify CSRF token is generated on app load
- [ ] Verify CSRF token is included in POST/PUT/DELETE requests
- [ ] Try POST request without CSRF token (should fail)
- [ ] Verify GET requests don't include CSRF token

#### Session Timeout

- [ ] Login and verify monitoring starts
- [ ] Interact with app and verify timer resets
- [ ] Wait 30 minutes without interaction
- [ ] Verify automatic logout occurs
- [ ] Verify redirect to login page

#### Sensitive Data Filtering

- [ ] Check console logs for sensitive data
- [ ] Verify passwords are redacted
- [ ] Verify tokens are redacted
- [ ] Verify emails are redacted
- [ ] Verify production logs are minimal

### Automated Testing

Create test files for each security feature:

```typescript
// Example: tokenRefresh.test.ts
describe('Token Refresh', () => {
  it('should decode token expiration correctly', () => {
    const token = 'eyJhbGc...'; // Valid JWT
    const expiration = decodeTokenExpiration(token);
    expect(expiration).toBeGreaterThan(Date.now());
  });

  it('should schedule refresh before expiration', () => {
    const token = 'eyJhbGc...'; // Token expiring in 10 minutes
    scheduleTokenRefresh(token);
    // Verify timer is set for 5 minutes
  });

  it('should logout on refresh failure', async () => {
    // Mock failed refresh
    // Verify logout is called
    // Verify redirect to login
  });
});
```

---

## Security Best Practices

### For Developers

1. **Never log sensitive data**:
   - Always use `secureLog` instead of `console.log`
   - Never log passwords, tokens, or PII
   - Use sanitization before logging user data

2. **Always use the API client**:
   - Don't use `fetch` directly for API calls
   - API client handles JWT, CSRF, retries automatically
   - Custom fetch calls may bypass security measures

3. **Handle auth errors properly**:
   - 401 errors should trigger logout
   - 403 errors should show access denied
   - Don't expose error details to users

4. **Validate on client and server**:
   - Client-side validation improves UX
   - Server-side validation is required for security
   - Never trust client-side data

5. **Keep dependencies updated**:
   - Regularly update npm packages
   - Monitor security advisories
   - Use `npm audit` to check for vulnerabilities

### For Users

1. **Use strong passwords**:
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

2. **Logout when done**:
   - Always logout on shared computers
   - Session timeout provides automatic protection
   - Don't leave browser open unattended

3. **Keep browser updated**:
   - Use latest browser version
   - Enable automatic updates
   - Modern browsers have better security

4. **Be aware of phishing**:
   - Verify URL before entering credentials
   - Don't click suspicious links
   - Report suspicious activity

---

## Security Incident Response

### If you discover a security vulnerability:

1. **Do not disclose publicly**
2. **Report to security team immediately**
3. **Provide details**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### If a security incident occurs:

1. **Immediate actions**:
   - Revoke compromised tokens
   - Force logout all users if needed
   - Block malicious IPs
   - Patch vulnerability

2. **Investigation**:
   - Review audit logs
   - Identify affected users
   - Assess data exposure
   - Document timeline

3. **Communication**:
   - Notify affected users
   - Provide guidance
   - Update security measures
   - Document lessons learned

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

## Changelog

### Version 1.0.0 (Current)

- Initial security implementation
- JWT token management with cookies
- Automatic token refresh
- CSRF protection
- Session timeout (30 minutes)
- Sensitive data filtering in logs
