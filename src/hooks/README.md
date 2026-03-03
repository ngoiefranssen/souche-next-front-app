# Hooks Utilitaires

Ce dossier contient les hooks personnalisés réutilisables de l'application.

## useDebounce

Hook pour debouncer une valeur, utile pour les champs de recherche et filtres.

### Utilisation

```tsx
import { useDebounce } from '@/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Effectuer la recherche API
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder="Rechercher..."
    />
  );
}
```

### Paramètres

- `value: T` - La valeur à debouncer
- `delay: number` - Le délai en millisecondes (défaut: 300ms)

### Retour

- `T` - La valeur debouncée

## useToast

Hook pour afficher des notifications toast avec différents variants (success, error, info, warning).

### Utilisation

```tsx
import { useToast } from '@/hooks';

function UserForm() {
  const toast = useToast();

  const handleSubmit = async data => {
    try {
      await createUser(data);
      toast.success('Utilisateur créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Méthodes

- `success(message: string, options?: ToastOptions)` - Afficher une notification de succès
- `error(message: string, options?: ToastOptions)` - Afficher une notification d'erreur
- `info(message: string, options?: ToastOptions)` - Afficher une notification d'information
- `warning(message: string, options?: ToastOptions)` - Afficher une notification d'avertissement
- `dismiss(id?: string)` - Fermer un toast spécifique ou tous les toasts

### Options

```typescript
interface ToastOptions {
  duration?: number; // Durée en millisecondes (défaut: 3000ms)
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}
```

### Caractéristiques

- Auto-dismiss après 3 secondes par défaut
- Animations d'entrée/sortie fluides
- Accessible (ARIA attributes)
- Protection XSS (échappement HTML)
- Bouton de fermeture manuel
- Empilage multiple de toasts

## useMediaQuery

Hook pour détecter les media queries et gérer le responsive design.

### Utilisation de base

```tsx
import { useMediaQuery, BREAKPOINTS } from '@/hooks';

function ResponsiveComponent() {
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);

  return <div>{isDesktop ? <DesktopLayout /> : <MobileLayout />}</div>;
}
```

### Hooks de convenance

```tsx
import { useIsMobile, useIsTablet, useIsDesktop, useScreenType } from '@/hooks';

function Navigation() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const screenType = useScreenType(); // 'mobile' | 'tablet' | 'desktop' | 'wide'

  return (
    <nav>
      {isMobile && <HamburgerMenu />}
      {isDesktop && <FullSidebar />}
    </nav>
  );
}
```

### Breakpoints

```typescript
export const BREAKPOINTS = {
  mobile: 375, // ≥375px
  tablet: 768, // ≥768px
  desktop: 1024, // ≥1024px
  wide: 1440, // ≥1440px
} as const;
```

### Hooks d'accessibilité

```tsx
import { usePrefersReducedMotion, usePrefersDarkMode } from '@/hooks';

function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersDarkMode = usePrefersDarkMode();

  return (
    <div
      className={`
        ${prefersReducedMotion ? 'no-animation' : 'with-animation'}
        ${prefersDarkMode ? 'dark' : 'light'}
      `}
    >
      Content
    </div>
  );
}
```

### Méthodes disponibles

- `useMediaQuery(query: string): boolean` - Hook de base pour n'importe quelle media query
- `useIsMobile(): boolean` - Détecte si l'écran est mobile (<768px)
- `useIsTablet(): boolean` - Détecte si l'écran est tablette (768px-1023px)
- `useIsDesktop(): boolean` - Détecte si l'écran est desktop (≥1024px)
- `useIsWide(): boolean` - Détecte si l'écran est wide (≥1440px)
- `useScreenType(): 'mobile' | 'tablet' | 'desktop' | 'wide'` - Retourne le type d'écran actuel
- `usePrefersReducedMotion(): boolean` - Détecte la préférence de mouvement réduit
- `usePrefersDarkMode(): boolean` - Détecte la préférence de thème sombre

### Caractéristiques

- Compatible SSR (Server-Side Rendering)
- Écoute les changements de taille d'écran en temps réel
- Nettoyage automatique des écouteurs
- Fallback pour les anciens navigateurs
- Breakpoints standard pour le responsive design

## Import centralisé

Tous les hooks peuvent être importés depuis le fichier index:

```tsx
import {
  useDebounce,
  useToast,
  useMediaQuery,
  useIsMobile,
  BREAKPOINTS,
} from '@/hooks';
```

## Exigences validées

Ces hooks valident les exigences suivantes du document de spécification:

- **9.1, 9.2**: Système de notifications toast (useToast)
- **11.1**: Responsive design avec breakpoints standard (useMediaQuery)
- **12.3**: Debouncing des recherches avec délai de 300ms (useDebounce)

## Tests

Les tests property-based pour ces hooks sont définis dans les tâches suivantes:

- **Tâche 1.9**: Tests pour useDebounce (Property 18: Search Debouncing)
- **Tâche 3.6**: Tests pour useToast (Property 8: Toast Notification Display)

## Notes d'implémentation

### useToast

Le hook useToast utilise une approche DOM directe plutôt qu'un Context React pour plusieurs raisons:

1. **Simplicité**: Pas besoin de wrapper Provider dans l'arbre React
2. **Performance**: Pas de re-renders inutiles
3. **Flexibilité**: Peut être appelé depuis n'importe où, même hors composants React
4. **Légèreté**: Pas de dépendance externe (react-hot-toast, etc.)

Si vous préférez utiliser react-hot-toast, installez-le avec:

```bash
npm install react-hot-toast
```

Et modifiez le hook pour utiliser la bibliothèque.

### useMediaQuery

Le hook gère automatiquement le SSR en retournant `false` par défaut côté serveur. Cela évite les problèmes d'hydratation. Si vous avez besoin d'une valeur par défaut différente, vous pouvez la passer en paramètre ou utiliser `useEffect` pour gérer le cas SSR.

### useDebounce

Le délai par défaut de 300ms est un bon compromis entre réactivité et performance. Vous pouvez l'ajuster selon vos besoins:

- **100-200ms**: Pour une réactivité maximale (autocomplétion)
- **300-500ms**: Pour les recherches standard (recommandé)
- **500-1000ms**: Pour les opérations coûteuses (recherche full-text)
