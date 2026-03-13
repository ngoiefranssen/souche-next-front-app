/**
 * Error Messages Utility
 * Messages d'erreur internationalisés pour l'application
 */

export type ErrorCode =
  | 'network.timeout'
  | 'network.offline'
  | 'network.failed'
  | 'auth.invalid_credentials'
  | 'auth.session_expired'
  | 'auth.unauthorized'
  | 'permission.denied'
  | 'validation.email_taken'
  | 'validation.username_taken'
  | 'validation.invalid_format'
  | 'validation.required_field'
  | 'resource.not_found'
  | 'resource.conflict'
  | 'resource.in_use'
  | 'server.too_many_requests'
  | 'server.error'
  | 'server.unavailable'
  | 'unknown.error';

export interface ErrorMessage {
  fr: string;
  en: string;
}

/**
 * Dictionnaire des messages d'erreur
 */
export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  // Erreurs réseau
  'network.timeout': {
    fr: 'La requête a pris trop de temps. Veuillez réessayer.',
    en: 'The request timed out. Please try again.',
  },
  'network.offline': {
    fr: 'Vous êtes hors ligne. Vérifiez votre connexion internet.',
    en: 'You are offline. Check your internet connection.',
  },
  'network.failed': {
    fr: 'Impossible de se connecter au serveur. Vérifiez votre connexion.',
    en: 'Unable to connect to the server. Check your connection.',
  },

  // Erreurs d'authentification
  'auth.invalid_credentials': {
    fr: 'Email ou mot de passe incorrect.',
    en: 'Invalid email or password.',
  },
  'auth.session_expired': {
    fr: 'Session expirée. Veuillez vous reconnecter.',
    en: 'Session expired. Please log in again.',
  },
  'auth.unauthorized': {
    fr: 'Vous devez être connecté pour accéder à cette ressource.',
    en: 'You must be logged in to access this resource.',
  },

  // Erreurs de permission
  'permission.denied': {
    fr: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
    en: 'Access denied. You do not have the required permissions.',
  },

  // Erreurs de validation
  'validation.email_taken': {
    fr: 'Cet email est déjà utilisé.',
    en: 'This email is already in use.',
  },
  'validation.username_taken': {
    fr: "Ce nom d'utilisateur est déjà utilisé.",
    en: 'This username is already in use.',
  },
  'validation.invalid_format': {
    fr: 'Le format des données est invalide.',
    en: 'The data format is invalid.',
  },
  'validation.required_field': {
    fr: 'Ce champ est requis.',
    en: 'This field is required.',
  },

  // Erreurs de ressource
  'resource.not_found': {
    fr: 'Ressource non trouvée.',
    en: 'Resource not found.',
  },
  'resource.conflict': {
    fr: 'Cette ressource existe déjà.',
    en: 'This resource already exists.',
  },
  'resource.in_use': {
    fr: 'Cette ressource est utilisée et ne peut pas être supprimée.',
    en: 'This resource is in use and cannot be deleted.',
  },

  // Erreurs serveur
  'server.too_many_requests': {
    fr: 'Trop de requêtes. Veuillez réessayer plus tard.',
    en: 'Too many requests. Please try again later.',
  },
  'server.error': {
    fr: 'Erreur serveur. Veuillez réessayer plus tard.',
    en: 'Server error. Please try again later.',
  },
  'server.unavailable': {
    fr: 'Le service est temporairement indisponible.',
    en: 'The service is temporarily unavailable.',
  },

  // Erreur inconnue
  'unknown.error': {
    fr: 'Une erreur inattendue est survenue.',
    en: 'An unexpected error occurred.',
  },
};

/**
 * Obtenir un message d'erreur localisé
 */
export function getErrorMessage(
  code: ErrorCode,
  locale: 'fr' | 'en' = 'fr'
): string {
  return (
    ERROR_MESSAGES[code]?.[locale] || ERROR_MESSAGES['unknown.error'][locale]
  );
}

/**
 * Mapper un code de statut HTTP vers un code d'erreur
 */
export function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
    case 422:
      return 'validation.invalid_format';
    case 401:
      return 'auth.session_expired';
    case 403:
      return 'permission.denied';
    case 404:
      return 'resource.not_found';
    case 409:
      return 'resource.conflict';
    case 500:
      return 'server.error';
    case 429:
      return 'server.too_many_requests';
    case 502:
    case 503:
      return 'server.unavailable';
    default:
      return 'unknown.error';
  }
}

/**
 * Obtenir un message d'erreur depuis une réponse HTTP
 */
export function getHttpErrorMessage(
  status: number,
  locale: 'fr' | 'en' = 'fr',
  customMessage?: string
): string {
  // Si un message personnalisé est fourni, l'utiliser
  if (customMessage) {
    return customMessage;
  }

  // Sinon, utiliser le message par défaut selon le code de statut
  const errorCode = mapHttpStatusToErrorCode(status);
  return getErrorMessage(errorCode, locale);
}

/**
 * Extraire le message d'erreur d'une réponse API
 */
export async function extractApiErrorMessage(
  response: Response,
  locale: 'fr' | 'en' = 'fr'
): Promise<string> {
  try {
    const rawText = await response.text();
    if (rawText?.trim()) {
      // Le backend peut renvoyer soit du JSON, soit du texte brut (ex: rate limiter).
      try {
        const data = JSON.parse(rawText);

        // Vérifier si le backend a fourni un message
        if (data.message) {
          return data.message;
        }

        // Vérifier si c'est une erreur de validation avec des détails
        if (data.errors && typeof data.errors === 'object') {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            return firstError[0] as string;
          }
        }
      } catch {
        return rawText.trim();
      }
    }
  } catch {
    // Si la lecture échoue, utiliser le message par défaut
  }

  // Utiliser le message par défaut selon le code de statut
  return getHttpErrorMessage(response.status, locale);
}

/**
 * Formater un message d'erreur pour l'affichage
 */
export function formatErrorForDisplay(
  error: unknown,
  locale: 'fr' | 'en' = 'fr'
): string {
  if (error instanceof Error) {
    // Vérifier si c'est une erreur HTTP
    const statusMatch = error.message.match(/status:\s*(\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return getHttpErrorMessage(status, locale);
    }

    // Vérifier si c'est une erreur réseau
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return getErrorMessage('network.failed', locale);
    }

    // Retourner le message de l'erreur
    return error.message;
  }

  // Erreur inconnue
  return getErrorMessage('unknown.error', locale);
}
