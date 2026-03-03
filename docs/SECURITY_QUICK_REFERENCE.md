# Security Quick Reference Guide

## Quick Links

- [Full Security Documentation](../SECURITY.md)
- [Security Testing Script](../scripts/test-security.sh)

## Security Features at a Glance

| Feature               | Status | Location                           | Description                            |
| --------------------- | ------ | ---------------------------------- | -------------------------------------- |
| JWT Storage           | ✅     | `src/utils/auth/tokenManager.ts`   | Non-httpOnly cookies with SameSite=Lax |
| Token Refresh         | ✅     | `src/utils/auth/tokenRefresh.ts`   | Auto-refresh 5 min before expiration   |
| CSRF Protection       | ✅     | `src/utils/auth/csrfProtection.ts` | Token in header for POST/PUT/DELETE    |
| Session Timeout       | ✅     | `src/utils/auth/sessionTimeout.ts` | 30 min inactivity logout               |
| Sensitive Data Filter | ✅     | `src/lib/utils/secureLogger.ts`    | Filters passwords, tokens, PII         |

## Common Tasks

### Check Security Status

```bash
./scripts/test-security.sh
```

### Use Secure Logging

```typescript
// ❌ DON'T
console.log('User data:', userData);

// ✅ DO
import { secureLog } from '@/lib/utils/secureLogger';
secureLog('User data', userData);
```

### Make API Requests

```typescript
// ✅ Automatic JWT + CSRF protection
import { apiClient } from '@/lib/api/client';

await apiClient.post('/users', userData);
await apiClient.put('/users/1', userData);
await apiClient.delete('/users/1');
```

### Check User Permissions

```typescript
import { usePermission } from '@/hooks/usePermission';

const { hasPermission } = usePermission();

if (hasPermission('users:create')) {
  // Show create button
}
```

### Protect Routes

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<ProtectedRoute permission="users:read">
  <UsersPage />
</ProtectedRoute>
```

### Conditional Rendering

```typescript
import { Can } from '@/components/auth/Can';

<Can permission="users:delete">
  <DeleteButton />
</Can>
```

## Security Checklist for New Features

- [ ] Use `apiClient` for all API requests (never raw `fetch`)
- [ ] Use `secureLog` instead of `console.log`
- [ ] Validate user input on client AND server
- [ ] Check permissions before showing UI elements
- [ ] Handle 401/403 errors appropriately
- [ ] Don't expose sensitive data in error messages
- [ ] Test with different user roles/permissions
- [ ] Review code for hardcoded secrets
- [ ] Update tests to cover security scenarios

## Emergency Procedures

### If Token is Compromised

1. Revoke token on backend
2. Force logout all users: Clear `auth-token` cookie
3. Investigate how token was compromised
4. Patch vulnerability
5. Notify affected users

### If CSRF Token is Bypassed

1. Regenerate all CSRF tokens
2. Review CSRF validation on backend
3. Check for XSS vulnerabilities
4. Update CSRF token generation algorithm
5. Monitor for suspicious activity

### If Session is Hijacked

1. Terminate all active sessions
2. Force password reset for affected users
3. Review session management code
4. Check for XSS/CSRF vulnerabilities
5. Implement additional security measures (2FA, IP validation)

## Security Contacts

- Security Team: [security@example.com](mailto:security@example.com)
- Emergency Hotline: +1-XXX-XXX-XXXX
- Bug Bounty Program: [https://example.com/security](https://example.com/security)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## Version

Last Updated: 2024
Version: 1.0.0
