# Souche Next Front App

Application frontend Next.js pour le système de gestion avec authentification, permissions RBAC/ABAC, et interfaces CRUD complètes.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Scripts Disponibles](#scripts-disponibles)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Internationalisation](#internationalisation)
- [Documentation](#documentation)

## 🎯 Vue d'ensemble

Cette application Next.js 14+ fournit une interface utilisateur complète pour gérer:

- **Utilisateurs**: CRUD complet avec upload de photos, filtres avancés
- **Rôles**: Gestion des rôles avec assignment de permissions
- **Profils**: Organisation des utilisateurs par groupes fonctionnels
- **Statuts d'emploi**: Catégorisation des employés
- **Permissions**: Système RBAC + ABAC granulaire
- **Logs d'audit**: Traçabilité complète des actions

### Technologies

- **Framework**: Next.js 15.1+ (App Router)
- **Language**: TypeScript 5.7+ (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl (français/anglais)
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library

## 📦 Prérequis

- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **Backend API**: Express TypeScript API en cours d'exécution

## 🚀 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd souche-next-front-app

# Installer les dépendances
npm install
```

## ⚙️ Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet:

```env
# ------- Environment -------
NODE_ENV="development"

# ------- Public (servi au navigateur) -------
NEXT_PUBLIC_APP_NAME="souche-next-front-app"
NEXT_PUBLIC_API_URL="http://localhost:7700/api/v1"
NEXT_PUBLIC_MAX_ATTEMPTS="5"
NEXT_PUBLIC_LOCKOUT_SEC="30"

# ------- Serveur ONLY (non exposés) -------
API_URL="http://localhost:7700/api/v1"
DATABASE_URL="postgres://user:password@localhost:5432/myapp"
JWT_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ACCESS_TTL="900"
JWT_REFRESH_TTL="604800"
COOKIE_SECRET="your-32-char-secret-here"
PII_HASH_SALT="your-16-bytes-hex-salt"
TURNSTILE_SECRET_KEY="your-turnstile-secret"
```

### Variables requises

| Variable              | Description               | Exemple                        |
| --------------------- | ------------------------- | ------------------------------ |
| `NODE_ENV`            | Environnement d'exécution | `development`, `production`    |
| `NEXT_PUBLIC_API_URL` | URL publique de l'API     | `http://localhost:7700/api/v1` |
| `API_URL`             | URL serveur de l'API      | `http://localhost:7700/api/v1` |
| `JWT_PRIVATE_KEY`     | Clé privée JWT (EC)       | Clé PEM format                 |
| `JWT_PUBLIC_KEY`      | Clé publique JWT          | Clé PEM format                 |
| `COOKIE_SECRET`       | Secret pour cookies       | Min 32 caractères              |
| `PII_HASH_SALT`       | Salt pour hashing PII     | Min 16 caractères              |

**⚠️ Important**: En production, `API_URL` doit utiliser HTTPS.

## 🏃 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Mode production

```bash
# Build
npm run build

# Start
npm start
```

## 📜 Scripts Disponibles

| Script                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | Démarre le serveur de développement (Turbo)         |
| `npm run build`          | Build l'application pour production                 |
| `npm start`              | Démarre le serveur de production                    |
| `npm run lint`           | Vérifie le code avec ESLint                         |
| `npm run lint:fix`       | Corrige automatiquement les erreurs ESLint/Prettier |
| `npm run format`         | Formate le code avec Prettier                       |
| `npm run type-check`     | Vérifie les types TypeScript                        |
| `npm test`               | Lance les tests unitaires                           |
| `npm run test:watch`     | Lance les tests en mode watch                       |
| `npm run test:coverage`  | Génère le rapport de couverture                     |
| `npm run test:contrast`  | Vérifie le contraste des couleurs (WCAG)            |
| `npm run test:security`  | Lance les tests de sécurité                         |
| `npm run security:check` | Audit de sécurité complet                           |

## 🏗️ Architecture

```
src/
├── app/[locale]/              # Pages Next.js (App Router)
│   ├── dashboard/             # Pages du dashboard
│   │   ├── users/            # Gestion utilisateurs
│   │   ├── roles/            # Gestion rôles
│   │   ├── profiles/         # Gestion profils
│   │   ├── employment-status/# Gestion statuts
│   │   ├── permissions/      # Gestion permissions
│   │   └── audit/            # Logs d'audit
│   └── layout.tsx            # Layout principal
├── components/
│   ├── ui/                   # Composants UI réutilisables
│   │   ├── Modal/           # Modals (generic, confirm, form)
│   │   ├── Form/            # Composants de formulaire
│   │   ├── Button/          # Boutons
│   │   ├── Badge/           # Badges de statut
│   │   └── Skeleton/        # Skeleton loaders
│   ├── features/            # Composants feature-specific
│   │   ├── users/          # Composants utilisateurs
│   │   ├── roles/          # Composants rôles
│   │   └── ...
│   ├── auth/               # Composants d'authentification
│   └── Layout/             # Composants de layout
├── contexts/               # Contextes React
│   ├── AuthContext.tsx    # Authentification
│   ├── PermissionContext.tsx # Permissions
│   └── ToastContext.tsx   # Notifications
├── hooks/                 # Hooks personnalisés
│   ├── usePermission.ts  # Vérification permissions
│   ├── useDebounce.ts    # Debouncing
│   ├── useToast.ts       # Notifications
│   └── useMediaQuery.ts  # Responsive
├── lib/
│   ├── api/              # Services API
│   ├── schemas/          # Schémas Zod
│   └── utils/            # Utilitaires
├── types/                # Types TypeScript
└── i18n/                 # Configuration i18n
```

Pour plus de détails, voir [Architecture Documentation](./docs/ARCHITECTURE.md).

## ✨ Fonctionnalités

### Authentification & Autorisation

- Login/Logout sécurisé avec JWT
- Refresh token automatique
- Système de permissions RBAC + ABAC
- Protection des routes par permission
- Timeout de session (30 min d'inactivité)

### Gestion des Entités

- **Users**: CRUD complet, upload photo, filtres avancés
- **Roles**: CRUD avec modal, assignment permissions
- **Profiles**: CRUD avec modal, compteur utilisateurs
- **Employment Status**: CRUD avec modal
- **Permissions**: CRUD avec éditeur JSON pour conditions ABAC
- **Audit Logs**: Consultation, filtres, export CSV

### UI/UX

- Design responsive (mobile ≥375px, tablette ≥768px, desktop ≥1024px)
- Mode sombre (dark mode)
- Accessibilité WCAG 2.1 AA
- Navigation au clavier
- Skeleton loaders
- Toast notifications
- Breadcrumb navigation

### Performance

- Lazy loading des pages
- Caching des données de référence (5 min)
- Debouncing des recherches (300ms)
- Pagination côté serveur
- Limitation des requêtes concurrentes (max 5)
- Retry automatique (max 3 tentatives)
- Prefetching des routes

### Sécurité

- JWT stocké en httpOnly cookies
- Protection CSRF
- Sanitization XSS
- Validation côté client (Zod)
- Filtrage des données sensibles dans les logs
- Headers de sécurité HTTP

Voir [SECURITY.md](./SECURITY.md) pour plus de détails.

## 🧪 Tests

### Tests unitaires

```bash
npm test
```

### Tests avec couverture

```bash
npm run test:coverage
```

Objectif: ≥70% de couverture

### Tests de sécurité

```bash
npm run test:security
```

### Tests de contraste (WCAG)

```bash
npm run test:contrast
```

## 🔒 Sécurité

Cette application implémente des mesures de sécurité complètes:

- **JWT Token Management**: Stockage sécurisé avec cookies SameSite
- **Automatic Token Refresh**: Refresh proactif avant expiration
- **CSRF Protection**: Protection token-based
- **Session Timeout**: Timeout 30 min avec logout automatique
- **Sensitive Data Filtering**: Filtrage automatique des données sensibles

### Signaler une vulnérabilité

**NE PAS** créer d'issue publique GitHub pour les vulnérabilités.

Contactez: security@example.com

Voir [SECURITY.md](./SECURITY.md) pour plus d'informations.

## 🌍 Internationalisation

L'application supporte le français et l'anglais via next-intl.

### Changer de langue

Un sélecteur de langue est disponible dans le header.

### Ajouter une traduction

1. Ajouter les clés dans `src/lib/messages/fr.json` et `src/lib/messages/en.json`
2. Utiliser `useTranslations()` dans les composants:

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('MyNamespace');
  return <h1>{t('title')}</h1>;
}
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Architecture détaillée
- [Permissions System](./docs/PERMISSIONS.md) - Système de permissions
- [Hooks](./docs/HOOKS.md) - Hooks personnalisés
- [Components](./docs/COMPONENTS.md) - Composants réutilisables
- [API Services](./docs/API_SERVICES.md) - Services API
- [Security](./SECURITY.md) - Documentation sécurité
- [Responsive Design](./RESPONSIVE_DESIGN_IMPLEMENTATION.md) - Design responsive

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code

- ESLint + Prettier configurés
- TypeScript strict mode
- Tests requis pour les nouvelles fonctionnalités
- Couverture ≥70%

## 📝 License

[MIT License](./LICENSE)

## 👥 Auteurs

- Votre équipe

## 🙏 Remerciements

- Next.js team
- Tailwind CSS team
- Toutes les bibliothèques open source utilisées
