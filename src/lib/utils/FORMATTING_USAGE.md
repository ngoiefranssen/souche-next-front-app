# Formatting Utilities - Guide d'Utilisation

Ce document explique comment utiliser les utilitaires de formatage pour l'internationalisation.

## Import

```typescript
import {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeDate,
  formatPercentage,
  formatFileSize,
  type SupportedLocale,
} from '@/lib/utils/formatting';
```

## Locales Supportées

- `'fr'` - Français (fr-FR)
- `'en'` - Anglais (en-US)

## Fonctions Disponibles

### 1. formatDate

Formate une date selon la locale spécifiée.

```typescript
// Format par défaut (DD/MM/YYYY pour fr, M/D/YYYY pour en)
formatDate(new Date('2024-01-15'), 'fr');
// => "15/01/2024"

formatDate(new Date('2024-01-15'), 'en');
// => "1/15/2024"

// Format long
formatDate(new Date('2024-01-15'), 'fr', { dateStyle: 'long' });
// => "15 janvier 2024"

// Date et heure
formatDate(new Date('2024-01-15T14:30:00'), 'fr', {
  dateStyle: 'short',
  timeStyle: 'short',
});
// => "15/01/2024 14:30"

// Format personnalisé
formatDate(new Date('2024-01-15'), 'fr', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
// => "lundi 15 janvier 2024"
```

### 2. formatNumber

Formate un nombre selon la locale spécifiée.

```typescript
// Format par défaut
formatNumber(1234.56, 'fr');
// => "1 234,56"

formatNumber(1234.56, 'en');
// => "1,234.56"

// Format compact
formatNumber(1234567, 'en', {
  notation: 'compact',
  compactDisplay: 'short',
});
// => "1.2M"

// Nombre avec décimales fixes
formatNumber(1234.5, 'fr', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
// => "1 234,50"
```

### 3. formatCurrency

Formate un montant en devise selon la locale spécifiée.

```typescript
// Devise par défaut (EUR pour fr, USD pour en)
formatCurrency(1234.56, 'fr');
// => "1 234,56 €"

formatCurrency(1234.56, 'en');
// => "$1,234.56"

// Devise personnalisée
formatCurrency(1234.56, 'fr', 'USD');
// => "1 234,56 $US"

formatCurrency(1234.56, 'en', 'EUR');
// => "€1,234.56"

// Sans décimales
formatCurrency(1234.56, 'fr', 'EUR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
// => "1 235 €"
```

### 4. formatRelativeDate

Formate une date de manière relative (il y a X jours, dans X jours).

```typescript
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
formatRelativeDate(yesterday, 'fr');
// => "hier" ou "il y a 1 jour"

formatRelativeDate(yesterday, 'en');
// => "yesterday" ou "1 day ago"

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
formatRelativeDate(tomorrow, 'fr');
// => "demain" ou "dans 1 jour"

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
formatRelativeDate(twoHoursAgo, 'fr');
// => "il y a 2 heures"
```

### 5. formatPercentage

Formate un nombre en pourcentage.

```typescript
// Sans décimales (par défaut)
formatPercentage(0.1234, 'fr');
// => "12 %"

formatPercentage(0.1234, 'en');
// => "12%"

// Avec décimales
formatPercentage(0.1234, 'fr', 2);
// => "12,34 %"

formatPercentage(0.5, 'fr', 1);
// => "50,0 %"
```

### 6. formatFileSize

Formate un nombre d'octets en taille de fichier lisible.

```typescript
formatFileSize(0, 'fr');
// => "0 B"

formatFileSize(1024, 'fr');
// => "1,00 Ko"

formatFileSize(1024, 'en');
// => "1.00 KB"

formatFileSize(1048576, 'fr');
// => "1,00 Mo"

formatFileSize(1073741824, 'fr', 1);
// => "1,0 Go"
```

## Utilisation dans les Composants React

### Avec next-intl

```typescript
'use client';

import { useLocale } from 'next-intl';
import { formatDate, formatCurrency } from '@/lib/utils/formatting';

export function UserProfile({ user }) {
  const locale = useLocale() as 'fr' | 'en';

  return (
    <div>
      <p>Date d'embauche: {formatDate(user.hireDate, locale)}</p>
      <p>Salaire: {formatCurrency(user.salary, locale)}</p>
    </div>
  );
}
```

### Dans les Tableaux

```typescript
'use client';

import { useLocale } from 'next-intl';
import { formatDate, formatCurrency } from '@/lib/utils/formatting';

export function UserTable({ users }) {
  const locale = useLocale() as 'fr' | 'en';

  return (
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Date d'embauche</th>
          <th>Salaire</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{formatDate(user.hireDate, locale)}</td>
            <td>{formatCurrency(user.salary, locale)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Dans les Formulaires

```typescript
'use client';

import { useLocale } from 'next-intl';
import { formatDate } from '@/lib/utils/formatting';

export function DateDisplay({ date }) {
  const locale = useLocale() as 'fr' | 'en';

  return (
    <div>
      <p>Date complète: {formatDate(date, locale, { dateStyle: 'full' })}</p>
      <p>Date courte: {formatDate(date, locale)}</p>
      <p>Date relative: {formatRelativeDate(date, locale)}</p>
    </div>
  );
}
```

## Gestion des Erreurs

Toutes les fonctions gèrent les erreurs de manière gracieuse :

```typescript
// Date invalide
formatDate('invalid-date', 'fr');
// => "invalid-date" (retourne la valeur d'origine)

// Nombre invalide
formatNumber(NaN, 'fr');
// => "NaN" (retourne la valeur d'origine)

// Montant invalide
formatCurrency(NaN, 'fr');
// => "NaN" (retourne la valeur d'origine)
```

Les erreurs sont également loggées dans la console en mode développement pour faciliter le débogage.

## Bonnes Pratiques

1. **Toujours utiliser la locale de l'utilisateur** : Récupérez la locale depuis `useLocale()` de next-intl
2. **Valider les données avant formatage** : Vérifiez que les dates et nombres sont valides
3. **Utiliser les options appropriées** : Personnalisez le formatage selon le contexte
4. **Tester avec différentes locales** : Assurez-vous que le formatage fonctionne pour toutes les locales supportées

## Exemples Complets

### Dashboard avec Statistiques

```typescript
'use client';

import { useLocale } from 'next-intl';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/formatting';

export function DashboardStats({ stats }) {
  const locale = useLocale() as 'fr' | 'en';

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="stat-card">
        <h3>Utilisateurs</h3>
        <p className="text-3xl">{formatNumber(stats.totalUsers, locale)}</p>
      </div>
      <div className="stat-card">
        <h3>Revenu Total</h3>
        <p className="text-3xl">{formatCurrency(stats.totalRevenue, locale)}</p>
      </div>
      <div className="stat-card">
        <h3>Taux de Conversion</h3>
        <p className="text-3xl">{formatPercentage(stats.conversionRate, locale, 1)}</p>
      </div>
    </div>
  );
}
```

### Logs d'Audit

```typescript
'use client';

import { useLocale } from 'next-intl';
import { formatDate, formatRelativeDate } from '@/lib/utils/formatting';

export function AuditLogEntry({ log }) {
  const locale = useLocale() as 'fr' | 'en';

  return (
    <div className="audit-log-entry">
      <div className="flex justify-between">
        <span>{log.action}</span>
        <span className="text-gray-500">
          {formatRelativeDate(log.timestamp, locale)}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        {formatDate(log.timestamp, locale, {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
      </div>
    </div>
  );
}
```

## Références

- [Intl.DateTimeFormat - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.NumberFormat - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Intl.RelativeTimeFormat - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat)
