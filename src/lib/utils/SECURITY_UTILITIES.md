# Utilitaires de Sécurité

Ce document décrit les utilitaires de sécurité disponibles pour protéger l'application frontend contre les attaques XSS, valider les entrées utilisateur, et gérer les tokens JWT.

## Table des Matières

1. [Sanitization (Prévention XSS)](#sanitization)
2. [Validation Côté Client](#validation)
3. [Gestion JWT](#gestion-jwt)

---

## Sanitization (Prévention XSS)

Le module `sanitization.ts` fournit des fonctions pour nettoyer et sécuriser les entrées utilisateur avant leur affichage dans l'interface.

### Fonctions Principales

#### `escapeHtml(text: string): string`

Échappe les caractères HTML dangereux dans une chaîne.

```typescript
import { escapeHtml } from '@/lib/utils';

const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// Résultat: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
```

#### `stripHtml(text: string): string`

Supprime tous les tags HTML d'une chaîne.

```typescript
import { stripHtml } from '@/lib/utils';

const html = '<p>Hello <strong>World</strong></p>';
const text = stripHtml(html);
// Résultat: 'Hello World'
```

#### `sanitizeUrl(url: string): string`

Nettoie une URL pour prévenir les attaques `javascript:` et `data:`.

```typescript
import { sanitizeUrl } from '@/lib/utils';

const dangerousUrl = 'javascript:alert("XSS")';
const safe = sanitizeUrl(dangerousUrl);
// Résultat: '' (URL bloquée)

const validUrl = 'https://example.com';
const safe2 = sanitizeUrl(validUrl);
// Résultat: 'https://example.com'
```

#### `sanitizeInput(input: string): string`

Fonction générique pour sanitizer une entrée utilisateur (utilise `escapeHtml` par défaut).

```typescript
import { sanitizeInput } from '@/lib/utils';

const userInput = '<script>alert("XSS")</script>';
const safe = sanitizeInput(userInput);
// Résultat: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
```

#### `sanitizeObject<T>(obj: T): T`

Sanitize toutes les valeurs string d'un objet récursivement.

```typescript
import { sanitizeObject } from '@/lib/utils';

const formData = {
  name: '<script>alert(1)</script>',
  email: 'user@example.com',
  bio: '<p>Hello</p>',
};

const safe = sanitizeObject(formData);
// Résultat: {
//   name: '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;',
//   email: 'user@example.com',
//   bio: '&lt;p&gt;Hello&lt;&#x2F;p&gt;'
// }
```

### Utilisation dans les Composants React

```typescript
import { sanitizeInput } from '@/lib/utils';

function UserProfile({ user }) {
  return (
    <div>
      {/* Affichage sécurisé du nom d'utilisateur */}
      <h1>{sanitizeInput(user.name)}</h1>

      {/* Ou utiliser dangerouslySetInnerHTML avec sanitization */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeInput(user.bio) }} />
    </div>
  );
}
```

---

## Validation Côté Client

Le module `validation.ts` fournit des fonctions de validation pour les formulaires et les entrées utilisateur.

### Fonctions de Validation

#### `isValidEmail(email: string): boolean`

Valide un format d'email.

```typescript
import { isValidEmail } from '@/lib/utils';

isValidEmail('user@example.com'); // true
isValidEmail('invalid-email'); // false
```

#### `isValidPhone(phone: string): boolean`

Valide un numéro de téléphone international.

```typescript
import { isValidPhone } from '@/lib/utils';

isValidPhone('+33612345678'); // true
isValidPhone('0612345678'); // true
isValidPhone('123'); // false
```

#### `validatePassword(password: string, minLength?: number)`

Valide la force d'un mot de passe.

```typescript
import { validatePassword } from '@/lib/utils';

const result = validatePassword('weak');
// Résultat: {
//   isValid: false,
//   errors: [
//     'Minimum 8 caractères',
//     'Au moins une lettre majuscule',
//     'Au moins un chiffre',
//     'Au moins un caractère spécial'
//   ]
// }

const result2 = validatePassword('StrongP@ss123');
// Résultat: { isValid: true, errors: [] }
```

#### `isValidUrl(url: string, allowedProtocols?: string[]): boolean`

Valide une URL.

```typescript
import { isValidUrl } from '@/lib/utils';

isValidUrl('https://example.com'); // true
isValidUrl('javascript:alert(1)'); // false
isValidUrl('ftp://example.com', ['ftp']); // true
```

#### `isValidUsername(username: string, minLength?: number, maxLength?: number): boolean`

Valide un nom d'utilisateur.

```typescript
import { isValidUsername } from '@/lib/utils';

isValidUsername('john_doe'); // true
isValidUsername('ab'); // false (trop court)
isValidUsername('user@name'); // false (caractères invalides)
```

#### Validation de Fichiers

```typescript
import {
  isValidFileSize,
  isValidFileType,
  isValidFileExtension,
} from '@/lib/utils';

// Valider la taille (max 5MB)
isValidFileSize(file, 5); // true si < 5MB

// Valider le type MIME
isValidFileType(file, ['image/jpeg', 'image/png']); // true si JPEG ou PNG

// Valider l'extension
isValidFileExtension('photo.jpg', ['jpg', 'png']); // true
```

### Utilisation avec React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { isValidEmail, validatePassword } from '@/lib/utils';

function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // Validation supplémentaire
    if (!isValidEmail(data.email)) {
      alert('Email invalide');
      return;
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      alert(passwordValidation.errors.join(', '));
      return;
    }

    // Soumettre les données
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          validate: (value) => isValidEmail(value) || 'Email invalide'
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        {...register('password', {
          validate: (value) => {
            const result = validatePassword(value);
            return result.isValid || result.errors[0];
          }
        })}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">S'inscrire</button>
    </form>
  );
}
```

---

## Gestion JWT

Le système de gestion JWT est implémenté dans `@/utils/auth/tokenManager.ts` et intégré dans le client API.

### Fonctionnalités

#### Stockage Sécurisé

- Les tokens JWT sont stockés dans des **cookies non-httpOnly**
- Cela permet l'accès par le middleware Next.js et le client API
- **SameSite=Lax** protège contre les attaques CSRF
- **Secure=true** en production (HTTPS uniquement)

#### Inclusion Automatique dans les Requêtes

Le client API (`@/lib/api/client.ts`) inclut automatiquement le JWT dans le header `Authorization` de toutes les requêtes:

```typescript
Authorization: Bearer<token>;
```

#### Gestion de l'Expiration

En cas d'erreur 401 (token expiré ou invalide):

1. Les données d'authentification sont effacées
2. L'URL actuelle est sauvegardée pour redirection après login
3. L'utilisateur est redirigé vers `/login`

### Utilisation

#### Récupérer le Token

```typescript
import { getAuthToken } from '@/utils/auth/tokenManager';

const token = getAuthToken();
if (token) {
  console.log('Utilisateur authentifié');
}
```

#### Stocker le Token (après login)

```typescript
import { setAuthToken } from '@/utils/auth/tokenManager';

// Après un login réussi
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

const { token } = await response.json();

// Stocker le token (expire après 7 jours par défaut)
setAuthToken(token);

// Ou avec une durée personnalisée (en secondes)
setAuthToken(token, 60 * 60 * 24); // 1 jour
```

#### Supprimer le Token (logout)

```typescript
import { removeAuthToken } from '@/utils/auth/tokenManager';

// Lors de la déconnexion
removeAuthToken();
```

### Sécurité

#### Protection CSRF

Les cookies utilisent `SameSite=Lax`, ce qui protège contre les attaques CSRF tout en permettant la navigation normale.

#### HTTPS en Production

En production, le flag `Secure` est automatiquement ajouté, garantissant que le token n'est transmis que via HTTPS.

#### Nettoyage Automatique

En cas d'erreur 401, le système nettoie automatiquement:

- Le token dans les cookies
- Les données utilisateur dans localStorage
- Les permissions en cache

---

## Bonnes Pratiques

### 1. Toujours Sanitizer les Entrées Utilisateur

```typescript
// ❌ Mauvais
<div>{user.bio}</div>

// ✅ Bon
<div>{sanitizeInput(user.bio)}</div>
```

### 2. Valider Avant Soumission

```typescript
// ✅ Bon
const handleSubmit = data => {
  // Valider côté client
  if (!isValidEmail(data.email)) {
    showError('Email invalide');
    return;
  }

  // Sanitizer avant envoi
  const sanitized = sanitizeObject(data);

  // Envoyer au backend
  await api.post('/users', sanitized);
};
```

### 3. Ne Jamais Logger les Tokens

```typescript
// ❌ Mauvais
console.log('Token:', getAuthToken());

// ✅ Bon
console.log('User authenticated:', !!getAuthToken());
```

### 4. Combiner Validation et Sanitization

```typescript
// ✅ Bon
const processUserInput = (input: string) => {
  // 1. Valider
  if (input.length > 1000) {
    throw new Error('Texte trop long');
  }

  // 2. Sanitizer
  return sanitizeInput(input);
};
```

---

## Tests

Pour tester les utilitaires de sécurité:

```bash
npm run test src/lib/utils/sanitization.test.ts
npm run test src/lib/utils/validation.test.ts
```

---

## Références

- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **CSRF Protection**: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
