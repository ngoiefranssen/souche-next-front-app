# Composants d'Authentification et de Permissions

Ce dossier contient les composants pour gérer l'authentification et les permissions dans l'application.

## Composants

### ProtectedRoute

Composant pour protéger les routes par permission. Il vérifie si l'utilisateur a la permission requise avant d'afficher le contenu.

**Props:**

- `children`: Le contenu à afficher si l'utilisateur a la permission
- `permission?`: La permission requise (format: "resource:action")
- `fallback?`: Contenu de secours si l'utilisateur n'a pas la permission
- `redirectTo?`: URL de redirection (par défaut: "/403")

**Exemples:**

```tsx
// Protéger une route avec une permission spécifique
<ProtectedRoute permission="users:read">
  <UsersPage />
</ProtectedRoute>

// Protéger une route avec un fallback personnalisé
<ProtectedRoute
  permission="users:create"
  fallback={<div>Vous n'avez pas accès à cette fonctionnalité</div>}
>
  <CreateUserForm />
</ProtectedRoute>

// Protéger une route avec redirection personnalisée
<ProtectedRoute
  permission="admin:access"
  redirectTo="/dashboard"
>
  <AdminPanel />
</ProtectedRoute>
```

### Can

Composant pour le rendu conditionnel basé sur les permissions. Il affiche son contenu uniquement si l'utilisateur a la permission requise.

**Props:**

- `permission`: La permission requise (format: "resource:action")
- `children`: Le contenu à afficher si l'utilisateur a la permission
- `fallback?`: Contenu de secours si l'utilisateur n'a pas la permission

**Exemples:**

```tsx
// Afficher un bouton uniquement si l'utilisateur peut créer des utilisateurs
<Can permission="users:create">
  <button>Créer un utilisateur</button>
</Can>

// Afficher un message alternatif si l'utilisateur n'a pas la permission
<Can
  permission="users:delete"
  fallback={<span className="text-gray-400">Suppression non autorisée</span>}
>
  <button className="text-red-600">Supprimer</button>
</Can>

// Masquer une section entière
<Can permission="admin:access">
  <div className="admin-panel">
    <h2>Panneau d'administration</h2>
    <AdminSettings />
  </div>
</Can>
```

## Page 403

Une page d'erreur 403 (Accès refusé) est disponible à `/403`. Elle est affichée automatiquement lorsqu'un utilisateur tente d'accéder à une ressource protégée sans les permissions nécessaires.

La page offre deux options de navigation :

- Retour à la page précédente
- Retour au dashboard

## Utilisation avec le Hook usePermission

Les composants utilisent le hook `usePermission` qui fournit accès au contexte de permissions :

```tsx
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermission();

  if (loading) return <Skeleton />;

  // Vérifier une permission
  if (hasPermission('users:create')) {
    return <CreateUserButton />;
  }

  // Vérifier plusieurs permissions (ANY)
  if (hasAnyPermission(['users:read', 'users:create'])) {
    return <UsersSection />;
  }

  // Vérifier plusieurs permissions (ALL)
  if (hasAllPermissions(['users:read', 'users:update'])) {
    return <EditUserForm />;
  }

  return null;
}
```

## Format des Permissions

Les permissions suivent le format `resource:action`, par exemple :

- `users:read` - Lire les utilisateurs
- `users:create` - Créer des utilisateurs
- `users:update` - Modifier des utilisateurs
- `users:delete` - Supprimer des utilisateurs
- `roles:read` - Lire les rôles
- `admin:access` - Accès administrateur

## Intégration avec le Backend

Les permissions sont récupérées depuis le backend via l'endpoint `GET /api/v1/users/me/permissions` et sont mises en cache pendant 5 minutes pour optimiser les performances.

Le cache est automatiquement invalidé lors de la déconnexion de l'utilisateur.
