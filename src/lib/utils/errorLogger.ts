/**
 * Error Logger Utility
 * Gère la classification et le logging des erreurs dans l'application
 *
 * SECURITY: Uses secure logging to prevent sensitive data leakage
 */

import { secureError, secureDebug, sanitizeForLogging } from './secureLogger';

export type ErrorType = 'network' | 'api' | 'validation' | 'runtime' | 'auth';

export interface ErrorLog {
  timestamp: string;
  type: ErrorType;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: number;
  statusCode?: number;
}

/**
 * Classifier une erreur selon son type
 */
export function classifyError(error: Error | unknown): ErrorType {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'network';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('timeout')) {
      return 'network';
    }

    if (message.includes('http error') || message.includes('status:')) {
      return 'api';
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return 'auth';
    }
  }

  return 'runtime';
}

/**
 * Obtenir l'ID de l'utilisateur courant depuis le localStorage
 */
function getCurrentUserId(): number | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.id;
    }
  } catch {
    // Ignore les erreurs de parsing
  }

  return undefined;
}

/**
 * Logger une erreur avec contexte
 * SECURITY: Sanitizes context to prevent logging sensitive data
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    type: classifyError(error),
    message: errorObj.message,
    stack: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined,
    context: context
      ? (sanitizeForLogging(context) as Record<string, unknown>)
      : undefined,
    userId: getCurrentUserId(),
  };

  // Extraire le code de statut HTTP si présent
  if (errorObj.message.includes('status:')) {
    const match = errorObj.message.match(/status:\s*(\d+)/);
    if (match) {
      errorLog.statusCode = parseInt(match[1], 10);
    }
  }

  // Logger en console en développement (using secure logger)
  if (process.env.NODE_ENV === 'development') {
    secureDebug('Error occurred', errorLog);
  }

  // En production, envoyer à un service de tracking (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Intégrer Sentry ou autre service
    // Sentry.captureException(errorObj, { extra: context });

    // Pour l'instant, logger uniquement les erreurs critiques (using secure logger)
    if (errorLog.type === 'runtime' || errorLog.statusCode === 500) {
      secureError('Critical Error', {
        message: errorLog.message,
        type: errorLog.type,
        timestamp: errorLog.timestamp,
      });
    }
  }
}

/**
 * Extraire le message d'erreur d'une réponse API
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (typeof err.message === 'string') {
      return err.message;
    }

    if (typeof err.error === 'string') {
      return err.error;
    }
  }

  return 'Une erreur est survenue';
}

/**
 * Vérifier si une erreur est une erreur réseau
 */
export function isNetworkError(error: unknown): boolean {
  return classifyError(error) === 'network';
}

/**
 * Vérifier si une erreur est une erreur d'authentification
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('401') || message.includes('unauthorized');
  }
  return false;
}

/**
 * Vérifier si une erreur est une erreur de permission
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('403') || message.includes('forbidden');
  }
  return false;
}

/**
 * Vérifier si une erreur est une erreur de conflit
 */
export function isConflictError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('409');
  }
  return false;
}

/**
 * Vérifier si une erreur est une erreur serveur
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message;
    return (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503')
    );
  }
  return false;
}
