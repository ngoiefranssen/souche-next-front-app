/**
 * Utility Functions Index
 * Exports centralisés pour tous les utilitaires
 */

// Error handling utilities
export {
  logError,
  classifyError,
  extractErrorMessage,
  isNetworkError,
  isAuthError,
  isPermissionError,
  isConflictError,
  isServerError,
  type ErrorType,
  type ErrorLog,
} from './errorLogger';

export {
  getErrorMessage,
  mapHttpStatusToErrorCode,
  getHttpErrorMessage,
  extractApiErrorMessage,
  formatErrorForDisplay,
  ERROR_MESSAGES,
  type ErrorCode,
  type ErrorMessage,
} from './errorMessages';

// Sanitization utilities
export {
  escapeHtml,
  stripHtml,
  sanitizeUrl,
  sanitizeAttribute,
  sanitizeRichText,
  sanitizeInput,
  sanitizeObject,
} from './sanitization';

// Validation utilities
export {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidUrl,
  isValidUsername,
  isValidDate,
  isFutureDate,
  isPastDate,
  isValidNumber,
  isValidPermission,
  isValidFileSize,
  isValidFileType,
  isValidFileExtension,
  validateObject,
  sanitizeString,
} from './validation';

// Formatting utilities
export {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeDate,
  formatPercentage,
  formatFileSize,
  type SupportedLocale,
} from './formatting';
