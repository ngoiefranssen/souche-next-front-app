/**
 * Utilitaires de sanitization pour prévenir les attaques XSS
 *
 * Ce module fournit des fonctions pour nettoyer et sécuriser les entrées utilisateur
 * avant leur affichage dans l'interface.
 */

/**
 * Caractères HTML à échapper pour prévenir XSS
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Échappe les caractères HTML dangereux dans une chaîne
 *
 * @param text - Texte à échapper
 * @returns Texte avec caractères HTML échappés
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  return text.replace(/[&<>"'/]/g, char => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Supprime tous les tags HTML d'une chaîne
 *
 * @param text - Texte contenant potentiellement des tags HTML
 * @returns Texte sans tags HTML
 *
 * @example
 * ```ts
 * stripHtml('<p>Hello <strong>World</strong></p>')
 * // Returns: 'Hello World'
 * ```
 */
export function stripHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  return text.replace(/<[^>]*>/g, '');
}

/**
 * Nettoie une URL pour prévenir les attaques javascript: et data:
 *
 * @param url - URL à nettoyer
 * @returns URL sécurisée ou chaîne vide si dangereuse
 *
 * @example
 * ```ts
 * sanitizeUrl('javascript:alert("XSS")')
 * // Returns: ''
 *
 * sanitizeUrl('https://example.com')
 * // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Bloquer les protocoles dangereux
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return '';
    }
  }

  return url;
}

/**
 * Sanitize une chaîne pour utilisation dans un attribut HTML
 *
 * @param text - Texte à sanitizer
 * @returns Texte sécurisé pour attribut HTML
 *
 * @example
 * ```ts
 * sanitizeAttribute('value" onload="alert(1)')
 * // Returns: 'value&quot; onload=&quot;alert(1)'
 * ```
 */
export function sanitizeAttribute(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  // Échapper les guillemets et caractères spéciaux
  return text
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitize du contenu riche (HTML) en autorisant uniquement des tags sûrs
 *
 * @param html - HTML à sanitizer
 * @param allowedTags - Tags HTML autorisés (par défaut: tags de formatage basique)
 * @returns HTML sanitizé
 *
 * @example
 * ```ts
 * sanitizeRichText('<p>Hello</p><script>alert("XSS")</script>')
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeRichText(
  html: string,
  allowedTags: string[] = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'a',
    'ul',
    'ol',
    'li',
  ]
): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Créer un élément temporaire pour parser le HTML
  if (typeof window === 'undefined') {
    // En SSR, on strip tout le HTML par sécurité
    return stripHtml(html);
  }

  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Fonction récursive pour nettoyer les nœuds
  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Vérifier si le tag est autorisé
      if (!allowedTags.includes(tagName)) {
        return null;
      }

      // Créer un nouvel élément propre
      const cleanElement = document.createElement(tagName);

      // Copier uniquement les attributs sûrs
      if (tagName === 'a') {
        const href = element.getAttribute('href');
        if (href) {
          const sanitizedHref = sanitizeUrl(href);
          if (sanitizedHref) {
            cleanElement.setAttribute('href', sanitizedHref);
            cleanElement.setAttribute('rel', 'noopener noreferrer');
          }
        }
      }

      // Nettoyer récursivement les enfants
      Array.from(element.childNodes).forEach(child => {
        const cleanChild = cleanNode(child);
        if (cleanChild) {
          cleanElement.appendChild(cleanChild);
        }
      });

      return cleanElement;
    }

    return null;
  };

  // Nettoyer tous les nœuds
  const cleanDiv = document.createElement('div');
  Array.from(temp.childNodes).forEach(child => {
    const cleanChild = cleanNode(child);
    if (cleanChild) {
      cleanDiv.appendChild(cleanChild);
    }
  });

  return cleanDiv.innerHTML;
}

/**
 * Sanitize une entrée utilisateur générique
 * Utilise escapeHtml par défaut pour maximum de sécurité
 *
 * @param input - Entrée utilisateur à sanitizer
 * @returns Entrée sanitizée
 *
 * @example
 * ```ts
 * sanitizeInput('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function sanitizeInput(input: string): string {
  return escapeHtml(input);
}

/**
 * Sanitize un objet en appliquant sanitizeInput à toutes les valeurs string
 *
 * @param obj - Objet à sanitizer
 * @returns Objet avec valeurs sanitizées
 *
 * @example
 * ```ts
 * sanitizeObject({ name: '<script>alert(1)</script>', age: 25 })
 * // Returns: { name: '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;', age: 25 }
 * ```
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as T[Extract<keyof T, string>];
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(
        value as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}
