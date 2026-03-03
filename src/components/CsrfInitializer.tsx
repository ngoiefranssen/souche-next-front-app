'use client';

import { useEffect } from 'react';
import { initializeCsrfProtection } from '@/utils/auth/csrfProtection';

/**
 * CSRF Initializer Component
 *
 * This component initializes CSRF protection when the app loads.
 * It fetches a CSRF token from the server if one doesn't exist.
 */
export function CsrfInitializer() {
  useEffect(() => {
    // Initialize CSRF protection on mount
    initializeCsrfProtection();
  }, []);

  // This component doesn't render anything
  return null;
}
