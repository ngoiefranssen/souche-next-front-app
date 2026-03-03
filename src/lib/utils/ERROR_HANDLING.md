# Error Handling System

Ce document décrit le système de gestion d'erreurs de l'application.

## Vue d'ensemble

Le système de gestion d'erreurs est composé de trois parties principales:

1. **errorLogger.ts** - Classification et logging des erreurs
2. **errorMessages.ts** - Messages d'erreur internationalisés
3. **ErrorBoundary.tsx** - Composant React pour capturer les erreurs

## Classification des erreurs

Les erreurs sont classifiées en 5 types:

- `network` - Erreurs réseau (timeout, connexion perdue)
- `api` - Erreurs HTTP (4xx, 5xx)
- `validation` - Erreurs de validation de formulaire
- `auth` - Erreurs d'authentification (401)
- `runtime` - Erreurs JavaScript runtime

## Gestion des codes HTTP

### 401 - Unauthorized

- **Action**: Déconnexion automatique et redirection vers `/login`
- **Message**: "Session expirée. Veuillez vous reconnecter."
- **Comportement**: Sauvegarde de l'URL actuelle pour redirection après login

### 403 - Forbidden

- **Action**: Redirection vers `/dashboard`
- **Message**: "Accès refusé. Vous n'avez pas les permissions nécessaires."
- **Comportement**: Affichage d'un toast d'erreur

### 404 - Not Found

- **Action**: Affichage d'un message d'erreur
- **Message**: "Ressource non trouvée."
- **Comportement**: Suggestion de retour à la liste

### 409 - Conflict

- **Action**: Affichage d'un message d'erreur spécifique
- **Message**: Message du backend ou "Cette ressource existe déjà."
- **Comportement**: Suggestion de résolution (ex: "Cet email est déjà utilisé")

### 500 - Server Error

- **Action**: Affichage d'un message générique
- **Message**: "Erreur serveur. Veuillez réessayer plus tard."
- **Comportement**: Logging en production, envoi à Sentry

## Utilisation

### Logger une erreur

```typescript
import { logError } from '@/lib/utils/errorLogger';

try {
  // Code qui peut échouer
} catch (error) {
  logError(error, {
    context: 'UserCreation',
    userId: user.id,
  });
}
```

### Obtenir un message d'erreur localisé

```typescript
import { getErrorMessage } from '@/lib/utils/errorMessages';

const message = getErrorMessage('auth.session_expired', 'fr');
// "Session expirée. Veuillez vous reconnecter."
```

### Formater une erreur pour l'affichage

```typescript
import { formatErrorForDisplay } from '@/lib/utils/errorMessages';
import { useToast } from '@/hooks/useToast';

const toast = useToast();

try {
  await apiClient.post('/users', userData);
} catch (error) {
  const message = formatErrorForDisplay(error, 'fr');
  toast.error(message);
}
```

### Utiliser ErrorBoundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Avec un fallback personnalisé

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h1>Oops!</h1>
      <p>Quelque chose s'est mal passé.</p>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

### Avec un callback onError

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Envoyer à un service de monitoring
    console.error('Error caught:', error, errorInfo);
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## API Client

Le client API gère automatiquement les erreurs HTTP:

```typescript
import { apiClient } from '@/lib/api/client';

try {
  const data = await apiClient.get('/users');
} catch (error) {
  // L'erreur est déjà loggée et classifiée
  // Les erreurs 401 déclenchent une déconnexion automatique
  // Les erreurs 403 redirigent vers le dashboard
}
```

## Retry automatique

Le client API implémente un retry automatique avec exponential backoff:

- **Tentatives**: 3 maximum
- **Délai**: 1s, 2s, 4s (exponential backoff)
- **Exceptions**: Pas de retry pour 401 et 403

## Messages d'erreur i18n

Les messages d'erreur sont disponibles en français et anglais dans:

- `src/lib/messages/fr.json`
- `src/lib/messages/en.json`

Structure:

```json
{
  "errors": {
    "network": { ... },
    "auth": { ... },
    "permission": { ... },
    "validation": { ... },
    "resource": { ... },
    "server": { ... },
    "unknown": { ... }
  }
}
```

## Logging en production

En production, les erreurs critiques sont loggées:

- Erreurs runtime
- Erreurs serveur (500)
- Stack traces masquées pour la sécurité

Pour intégrer Sentry:

```typescript
// Dans errorLogger.ts
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, { extra: context });
}
```

## Bonnes pratiques

1. **Toujours logger les erreurs** avec `logError()`
2. **Utiliser les messages i18n** via `getErrorMessage()`
3. **Afficher des toasts** pour les erreurs utilisateur
4. **Wrapper les composants critiques** avec `ErrorBoundary`
5. **Ne jamais logger de données sensibles** (passwords, tokens)
6. **Fournir un contexte** lors du logging

## Exemples complets

### Création d'utilisateur avec gestion d'erreurs

```typescript
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/hooks/useToast';
import { formatErrorForDisplay } from '@/lib/utils/errorMessages';
import { logError } from '@/lib/utils/errorLogger';

function CreateUserForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setLoading(true);

    try {
      await apiClient.post('/users', data);
      toast.success('Utilisateur créé avec succès');
      router.push('/dashboard/users');
    } catch (error) {
      // Logger l'erreur avec contexte
      logError(error, {
        action: 'createUser',
        formData: { email: data.email }, // Ne pas logger le password!
      });

      // Afficher un message d'erreur localisé
      const message = formatErrorForDisplay(error, 'fr');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Page avec ErrorBoundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function UsersPage() {
  return (
    <ErrorBoundary>
      <div>
        <h1>Utilisateurs</h1>
        <UserTable />
      </div>
    </ErrorBoundary>
  );
}
```

## Tests

Pour tester la gestion d'erreurs:

```typescript
import { logError, classifyError } from '@/lib/utils/errorLogger';

describe('Error Handling', () => {
  it('should classify network errors', () => {
    const error = new TypeError('fetch failed');
    expect(classifyError(error)).toBe('network');
  });

  it('should classify API errors', () => {
    const error = new Error('HTTP error! status: 404');
    expect(classifyError(error)).toBe('api');
  });

  it('should log errors with context', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    logError(new Error('Test error'), { test: true });
    expect(consoleSpy).toHaveBeenCalled();
  });
});
```
