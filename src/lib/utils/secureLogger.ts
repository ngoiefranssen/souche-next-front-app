/**
 * Secure Logger Utility
 *
 * This module provides secure logging functions that automatically
 * filter sensitive data before logging to the console or external services.
 *
 * SECURITY FEATURES:
 * - Filters passwords, tokens, API keys, PII
 * - Redacts sensitive fields in objects
 * - Prevents logging in production (configurable)
 * - Safe error logging without exposing sensitive context
 */

// Sensitive field names to filter (case-insensitive)
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'api_key',
  'authorization',
  'auth',
  'bearer',
  'jwt',
  'session',
  'cookie',
  'csrf',
  'ssn',
  'social_security',
  'credit_card',
  'creditcard',
  'card_number',
  'cvv',
  'pin',
  'private_key',
  'privatekey',
];

// Sensitive patterns to detect in strings
const SENSITIVE_PATTERNS = [
  /Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, // JWT tokens
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN format
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card numbers
  /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, // Phone numbers
];

const REDACTED = '[REDACTED]';

/**
 * Check if a field name is sensitive
 * @param fieldName - Field name to check
 * @returns true if field is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some(sensitive => lowerFieldName.includes(sensitive));
}

/**
 * Redact sensitive patterns from a string
 * @param value - String to redact
 * @returns String with sensitive patterns redacted
 */
function redactSensitivePatterns(value: string): string {
  let redacted = value;

  SENSITIVE_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, REDACTED);
  });

  return redacted;
}

/**
 * Sanitize a value by removing or redacting sensitive data
 * @param value - Value to sanitize
 * @returns Sanitized value
 */
function sanitizeValue(value: unknown): unknown {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle strings
  if (typeof value === 'string') {
    return redactSensitivePatterns(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  // Handle objects
  if (typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>);
  }

  // Return primitives as-is
  return value;
}

/**
 * Sanitize an object by redacting sensitive fields
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Redact sensitive fields
    if (isSensitiveField(key)) {
      sanitized[key] = REDACTED;
      continue;
    }

    // Recursively sanitize nested values
    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
}

/**
 * Check if logging is enabled based on environment
 * @returns true if logging is enabled
 */
function isLoggingEnabled(): boolean {
  // In production, only log errors
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  // In development, logging is enabled
  return true;
}

/**
 * Secure log function - logs only in development, filters sensitive data
 * @param message - Log message
 * @param data - Optional data to log
 */
export function secureLog(message: string, data?: unknown): void {
  if (!isLoggingEnabled()) {
    return;
  }

  if (data !== undefined) {
    const sanitized = sanitizeValue(data);
    console.log(`[SecureLog] ${message}`, sanitized);
  } else {
    console.log(`[SecureLog] ${message}`);
  }
}

/**
 * Secure info log
 * @param message - Log message
 * @param data - Optional data to log
 */
export function secureInfo(message: string, data?: unknown): void {
  if (!isLoggingEnabled()) {
    return;
  }

  if (data !== undefined) {
    const sanitized = sanitizeValue(data);
    console.info(`[SecureInfo] ${message}`, sanitized);
  } else {
    console.info(`[SecureInfo] ${message}`);
  }
}

/**
 * Secure warning log
 * @param message - Warning message
 * @param data - Optional data to log
 */
export function secureWarn(message: string, data?: unknown): void {
  if (data !== undefined) {
    const sanitized = sanitizeValue(data);
    console.warn(`[SecureWarn] ${message}`, sanitized);
  } else {
    console.warn(`[SecureWarn] ${message}`);
  }
}

/**
 * Secure error log - always logs, even in production
 * @param message - Error message
 * @param error - Error object or data
 */
export function secureError(message: string, error?: unknown): void {
  if (error instanceof Error) {
    // Log error message and stack (no sensitive data in stack traces)
    console.error(`[SecureError] ${message}`, {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } else if (error !== undefined) {
    const sanitized = sanitizeValue(error);
    console.error(`[SecureError] ${message}`, sanitized);
  } else {
    console.error(`[SecureError] ${message}`);
  }
}

/**
 * Secure debug log - only in development
 * @param message - Debug message
 * @param data - Optional data to log
 */
export function secureDebug(message: string, data?: unknown): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (data !== undefined) {
    const sanitized = sanitizeValue(data);
    console.debug(`[SecureDebug] ${message}`, sanitized);
  } else {
    console.debug(`[SecureDebug] ${message}`);
  }
}

/**
 * Sanitize data for logging
 * Useful when you need to manually sanitize data before passing to other loggers
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeForLogging(data: unknown): unknown {
  return sanitizeValue(data);
}

/**
 * Check if a value contains sensitive data
 * @param value - Value to check
 * @returns true if value contains sensitive data
 */
export function containsSensitiveData(value: unknown): boolean {
  if (typeof value === 'string') {
    // Check for sensitive patterns
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(value));
  }

  if (typeof value === 'object' && value !== null) {
    // Check for sensitive field names
    const keys = Object.keys(value);
    return keys.some(key => isSensitiveField(key));
  }

  return false;
}

/**
 * Create a secure logger instance with a prefix
 * @param prefix - Prefix for all log messages
 * @returns Object with secure logging methods
 */
export function createSecureLogger(prefix: string) {
  return {
    log: (message: string, data?: unknown) =>
      secureLog(`[${prefix}] ${message}`, data),
    info: (message: string, data?: unknown) =>
      secureInfo(`[${prefix}] ${message}`, data),
    warn: (message: string, data?: unknown) =>
      secureWarn(`[${prefix}] ${message}`, data),
    error: (message: string, error?: unknown) =>
      secureError(`[${prefix}] ${message}`, error),
    debug: (message: string, data?: unknown) =>
      secureDebug(`[${prefix}] ${message}`, data),
  };
}

// Export default logger
export const logger = {
  log: secureLog,
  info: secureInfo,
  warn: secureWarn,
  error: secureError,
  debug: secureDebug,
};
