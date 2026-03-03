/**
 * Utilitaires de validation côté client
 *
 * Ce module fournit des fonctions de validation pour les formulaires
 * et les entrées utilisateur avant soumission au backend.
 */

/**
 * Valide un format d'email
 *
 * @param email - Email à valider
 * @returns true si l'email est valide
 *
 * @example
 * ```ts
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }

  // Regex RFC 5322 simplifiée
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valide un numéro de téléphone international
 *
 * @param phone - Numéro de téléphone à valider
 * @returns true si le numéro est valide
 *
 * @example
 * ```ts
 * isValidPhone('+33612345678') // true
 * isValidPhone('0612345678') // true
 * isValidPhone('123') // false
 * ```
 */
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') {
    return false;
  }

  // Accepte les formats: +33612345678, 0612345678, etc.
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

/**
 * Valide la force d'un mot de passe
 *
 * @param password - Mot de passe à valider
 * @param minLength - Longueur minimale (défaut: 8)
 * @returns Objet avec isValid et messages d'erreur
 *
 * @example
 * ```ts
 * validatePassword('weak')
 * // Returns: { isValid: false, errors: ['Minimum 8 caractères'] }
 *
 * validatePassword('StrongP@ss123')
 * // Returns: { isValid: true, errors: [] }
 * ```
 */
export function validatePassword(
  password: string,
  minLength: number = 8
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    return { isValid: false, errors: ['Mot de passe invalide'] };
  }

  if (password.length < minLength) {
    errors.push(`Minimum ${minLength} caractères`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une lettre minuscule');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une lettre majuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Au moins un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valide une URL
 *
 * @param url - URL à valider
 * @param allowedProtocols - Protocoles autorisés (défaut: http, https)
 * @returns true si l'URL est valide
 *
 * @example
 * ```ts
 * isValidUrl('https://example.com') // true
 * isValidUrl('javascript:alert(1)') // false
 * ```
 */
export function isValidUrl(
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): boolean {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return allowedProtocols.includes(urlObj.protocol.replace(':', ''));
  } catch {
    return false;
  }
}

/**
 * Valide un nom d'utilisateur
 *
 * @param username - Nom d'utilisateur à valider
 * @param minLength - Longueur minimale (défaut: 3)
 * @param maxLength - Longueur maximale (défaut: 50)
 * @returns true si le nom d'utilisateur est valide
 *
 * @example
 * ```ts
 * isValidUsername('john_doe') // true
 * isValidUsername('ab') // false (trop court)
 * isValidUsername('user@name') // false (caractères invalides)
 * ```
 */
export function isValidUsername(
  username: string,
  minLength: number = 3,
  maxLength: number = 50
): boolean {
  if (typeof username !== 'string') {
    return false;
  }

  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  // Autorise lettres, chiffres, underscore, tiret
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
}

/**
 * Valide une date
 *
 * @param date - Date à valider (string ou Date)
 * @returns true si la date est valide
 *
 * @example
 * ```ts
 * isValidDate('2024-01-15') // true
 * isValidDate('invalid') // false
 * isValidDate(new Date()) // true
 * ```
 */
export function isValidDate(date: string | Date): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }

  if (typeof date !== 'string') {
    return false;
  }

  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Valide qu'une date est dans le futur
 *
 * @param date - Date à valider
 * @returns true si la date est dans le futur
 */
export function isFutureDate(date: string | Date): boolean {
  if (!isValidDate(date)) {
    return false;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.getTime() > Date.now();
}

/**
 * Valide qu'une date est dans le passé
 *
 * @param date - Date à valider
 * @returns true si la date est dans le passé
 */
export function isPastDate(date: string | Date): boolean {
  if (!isValidDate(date)) {
    return false;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.getTime() < Date.now();
}

/**
 * Valide un nombre dans une plage
 *
 * @param value - Valeur à valider
 * @param min - Valeur minimale (optionnelle)
 * @param max - Valeur maximale (optionnelle)
 * @returns true si le nombre est dans la plage
 *
 * @example
 * ```ts
 * isValidNumber(5, 1, 10) // true
 * isValidNumber(15, 1, 10) // false
 * isValidNumber(5) // true (pas de limites)
 * ```
 */
export function isValidNumber(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

/**
 * Valide un format de permission (resource:action)
 *
 * @param permission - Permission à valider
 * @returns true si le format est valide
 *
 * @example
 * ```ts
 * isValidPermission('users:read') // true
 * isValidPermission('invalid') // false
 * ```
 */
export function isValidPermission(permission: string): boolean {
  if (typeof permission !== 'string') {
    return false;
  }

  const permissionRegex = /^[a-z-]+:[a-z-]+$/;
  return permissionRegex.test(permission);
}

/**
 * Valide une taille de fichier
 *
 * @param file - Fichier à valider
 * @param maxSizeMB - Taille maximale en MB
 * @returns true si la taille est valide
 *
 * @example
 * ```ts
 * isValidFileSize(file, 5) // true si fichier < 5MB
 * ```
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  if (!(file instanceof File)) {
    return false;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Valide un type de fichier
 *
 * @param file - Fichier à valider
 * @param allowedTypes - Types MIME autorisés
 * @returns true si le type est autorisé
 *
 * @example
 * ```ts
 * isValidFileType(file, ['image/jpeg', 'image/png']) // true si JPEG ou PNG
 * ```
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  if (!(file instanceof File)) {
    return false;
  }

  return allowedTypes.includes(file.type);
}

/**
 * Valide une extension de fichier
 *
 * @param filename - Nom du fichier
 * @param allowedExtensions - Extensions autorisées (sans le point)
 * @returns true si l'extension est autorisée
 *
 * @example
 * ```ts
 * isValidFileExtension('photo.jpg', ['jpg', 'png']) // true
 * isValidFileExtension('document.pdf', ['jpg', 'png']) // false
 * ```
 */
export function isValidFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  if (typeof filename !== 'string') {
    return false;
  }

  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) {
    return false;
  }

  return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
}

/**
 * Valide un objet contre un schéma simple
 *
 * @param obj - Objet à valider
 * @param schema - Schéma de validation
 * @returns Objet avec isValid et erreurs
 *
 * @example
 * ```ts
 * validateObject(
 *   { email: 'test@example.com', age: 25 },
 *   { email: 'email', age: 'number' }
 * )
 * // Returns: { isValid: true, errors: {} }
 * ```
 */
export function validateObject(
  obj: Record<string, unknown>,
  schema: Record<string, string>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [key, type] of Object.entries(schema)) {
    const value = obj[key];

    if (value === undefined || value === null) {
      errors[key] = 'Champ requis';
      continue;
    }

    switch (type) {
      case 'email':
        if (!isValidEmail(value as string)) {
          errors[key] = 'Email invalide';
        }
        break;
      case 'phone':
        if (!isValidPhone(value as string)) {
          errors[key] = 'Numéro de téléphone invalide';
        }
        break;
      case 'url':
        if (!isValidUrl(value as string)) {
          errors[key] = 'URL invalide';
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors[key] = 'Nombre invalide';
        }
        break;
      case 'string':
        if (typeof value !== 'string') {
          errors[key] = 'Texte invalide';
        }
        break;
      case 'date':
        if (!isValidDate(value as string | Date)) {
          errors[key] = 'Date invalide';
        }
        break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Nettoie et valide une chaîne
 *
 * @param value - Valeur à nettoyer
 * @param maxLength - Longueur maximale (optionnelle)
 * @returns Chaîne nettoyée
 *
 * @example
 * ```ts
 * sanitizeString('  hello  ', 10) // 'hello'
 * sanitizeString('very long text...', 5) // 'very '
 * ```
 */
export function sanitizeString(value: string, maxLength?: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  let cleaned = value.trim();

  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}
