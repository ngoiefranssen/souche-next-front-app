/**
 * Utilitaires de formatage pour l'internationalisation
 *
 * Ce module fournit des fonctions pour formater les dates, nombres et devises
 * selon la locale de l'utilisateur (fr-FR ou en-US).
 *
 * Utilise l'API Intl native du navigateur pour un formatage précis et performant.
 *
 * @module formatting
 */

/**
 * Type pour les locales supportées
 */
export type SupportedLocale = 'fr' | 'en';

/**
 * Mapping des locales vers les codes BCP 47 complets
 */
const LOCALE_MAP: Record<SupportedLocale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
};

/**
 * Formate une date selon la locale spécifiée
 *
 * @param date - La date à formater (Date, string ISO, ou timestamp)
 * @param locale - La locale à utiliser ('fr' ou 'en')
 * @param options - Options de formatage Intl.DateTimeFormat (optionnel)
 * @returns La date formatée selon la locale
 *
 * @example
 * ```typescript
 * formatDate(new Date('2024-01-15'), 'fr')
 * // => "15/01/2024"
 *
 * formatDate(new Date('2024-01-15'), 'en')
 * // => "1/15/2024"
 *
 * formatDate(new Date('2024-01-15'), 'fr', {
 *   dateStyle: 'long'
 * })
 * // => "15 janvier 2024"
 *
 * formatDate(new Date('2024-01-15T14:30:00'), 'fr', {
 *   dateStyle: 'short',
 *   timeStyle: 'short'
 * })
 * // => "15/01/2024 14:30"
 * ```
 */
export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    // Convertir en objet Date si nécessaire
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier que la date est valide
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDate:', date);
      return String(date);
    }

    // Options par défaut si non spécifiées
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const formatOptions = options || defaultOptions;
    const localeCode = LOCALE_MAP[locale] || LOCALE_MAP.fr;

    return new Intl.DateTimeFormat(localeCode, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Formate un nombre selon la locale spécifiée
 *
 * @param number - Le nombre à formater
 * @param locale - La locale à utiliser ('fr' ou 'en')
 * @param options - Options de formatage Intl.NumberFormat (optionnel)
 * @returns Le nombre formaté selon la locale
 *
 * @example
 * ```typescript
 * formatNumber(1234.56, 'fr')
 * // => "1 234,56"
 *
 * formatNumber(1234.56, 'en')
 * // => "1,234.56"
 *
 * formatNumber(0.1234, 'fr', {
 *   style: 'percent',
 *   minimumFractionDigits: 2
 * })
 * // => "12,34 %"
 *
 * formatNumber(1234567, 'en', {
 *   notation: 'compact',
 *   compactDisplay: 'short'
 * })
 * // => "1.2M"
 * ```
 */
export function formatNumber(
  number: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  try {
    // Vérifier que le nombre est valide
    if (typeof number !== 'number' || isNaN(number)) {
      console.error('Invalid number provided to formatNumber:', number);
      return String(number);
    }

    const localeCode = LOCALE_MAP[locale] || LOCALE_MAP.fr;

    return new Intl.NumberFormat(localeCode, options).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(number);
  }
}

/**
 * Formate un montant en devise selon la locale spécifiée
 *
 * @param amount - Le montant à formater
 * @param locale - La locale à utiliser ('fr' ou 'en')
 * @param currency - Le code de devise ISO 4217 (par défaut: EUR pour fr, USD pour en)
 * @param options - Options de formatage supplémentaires (optionnel)
 * @returns Le montant formaté avec le symbole de devise
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56, 'fr')
 * // => "1 234,56 €"
 *
 * formatCurrency(1234.56, 'en')
 * // => "$1,234.56"
 *
 * formatCurrency(1234.56, 'fr', 'USD')
 * // => "1 234,56 $US"
 *
 * formatCurrency(1234.56, 'en', 'EUR')
 * // => "€1,234.56"
 *
 * formatCurrency(1234.56, 'fr', 'EUR', {
 *   minimumFractionDigits: 0,
 *   maximumFractionDigits: 0
 * })
 * // => "1 235 €"
 * ```
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale,
  currency?: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    // Vérifier que le montant est valide
    if (typeof amount !== 'number' || isNaN(amount)) {
      console.error('Invalid amount provided to formatCurrency:', amount);
      return String(amount);
    }

    // Devise par défaut selon la locale
    const defaultCurrency = locale === 'fr' ? 'EUR' : 'USD';
    const currencyCode = currency || defaultCurrency;

    const localeCode = LOCALE_MAP[locale] || LOCALE_MAP.fr;

    // Options par défaut pour les devises
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const formatOptions = { ...defaultOptions, ...options };

    return new Intl.NumberFormat(localeCode, formatOptions).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return String(amount);
  }
}

/**
 * Formate une date relative (il y a X jours, dans X jours)
 *
 * @param date - La date à formater
 * @param locale - La locale à utiliser ('fr' ou 'en')
 * @param baseDate - Date de référence (par défaut: maintenant)
 * @returns La date formatée de manière relative
 *
 * @example
 * ```typescript
 * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
 * formatRelativeDate(yesterday, 'fr')
 * // => "il y a 1 jour"
 *
 * formatRelativeDate(yesterday, 'en')
 * // => "1 day ago"
 *
 * const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
 * formatRelativeDate(tomorrow, 'fr')
 * // => "dans 1 jour"
 * ```
 */
export function formatRelativeDate(
  date: Date | string | number,
  locale: SupportedLocale,
  baseDate: Date = new Date()
): string {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatRelativeDate:', date);
      return String(date);
    }

    const localeCode = LOCALE_MAP[locale] || LOCALE_MAP.fr;

    // Calculer la différence en millisecondes
    const diffMs = dateObj.getTime() - baseDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Utiliser Intl.RelativeTimeFormat pour le formatage
    const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });

    // Choisir l'unité appropriée
    if (Math.abs(diffYears) >= 1) {
      return rtf.format(diffYears, 'year');
    } else if (Math.abs(diffMonths) >= 1) {
      return rtf.format(diffMonths, 'month');
    } else if (Math.abs(diffWeeks) >= 1) {
      return rtf.format(diffWeeks, 'week');
    } else if (Math.abs(diffDays) >= 1) {
      return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffHours) >= 1) {
      return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffMinutes) >= 1) {
      return rtf.format(diffMinutes, 'minute');
    } else {
      return rtf.format(diffSeconds, 'second');
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return String(date);
  }
}

/**
 * Formate un nombre en pourcentage
 *
 * @param value - La valeur à formater (0.5 = 50%)
 * @param locale - La locale à utiliser ('fr' ou 'en')
 * @param decimals - Nombre de décimales (par défaut: 0)
 * @returns Le pourcentage formaté
 *
 * @example
 * ```typescript
 * formatPercentage(0.1234, 'fr')
 * // => "12 %"
 *
 * formatPercentage(0.1234, 'en', 2)
 * // => "12.34%"
 *
 * formatPercentage(0.5, 'fr', 1)
 * // => "50,0 %"
 * ```
 */
export function formatPercentage(
  value: number,
  locale: SupportedLocale,
  decimals: number = 0
): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formate un nombre avec des unités (Ko, Mo, Go, etc.)
 *
 * @param bytes - Le nombre d'octets
 * @param locale - La locale à utiliser ('fr' ou 'en')
 * @param decimals - Nombre de décimales (par défaut: 2)
 * @returns La taille formatée avec l'unité appropriée
 *
 * @example
 * ```typescript
 * formatFileSize(1024, 'fr')
 * // => "1,00 Ko"
 *
 * formatFileSize(1048576, 'en')
 * // => "1.00 MB"
 *
 * formatFileSize(1073741824, 'fr', 1)
 * // => "1,0 Go"
 * ```
 */
export function formatFileSize(
  bytes: number,
  locale: SupportedLocale,
  decimals: number = 2
): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes =
    locale === 'fr'
      ? ['o', 'Ko', 'Mo', 'Go', 'To', 'Po']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${sizes[i]}`;
}
