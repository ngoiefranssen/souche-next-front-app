# Form Components

Composants de formulaire réutilisables avec support complet de l'accessibilité (WCAG 2.1 AA).

## Composants

### FormField

Champ de saisie texte avec label, erreur et icône optionnelle.

```tsx
import { FormField } from '@/components/ui/Form';
import { Mail } from 'lucide-react';

<FormField
  label="Email"
  type="email"
  placeholder="exemple@email.com"
  icon={<Mail className="w-5 h-5" />}
  error={errors.email?.message}
  required
  {...register('email')}
/>;
```

**Props:**

- `label` (string, required): Label du champ
- `error` (string, optional): Message d'erreur
- `helperText` (string, optional): Texte d'aide
- `icon` (ReactNode, optional): Icône à afficher à gauche
- `required` (boolean, optional): Champ requis
- Tous les props HTML standard de `<input>`

### FormSelect

Select avec options dynamiques et icône chevron.

```tsx
import { FormSelect } from '@/components/ui/Form';

<FormSelect
  label="Profil"
  placeholder="Sélectionnez un profil"
  options={[
    { label: 'Administrateur', value: 1 },
    { label: 'Utilisateur', value: 2 },
  ]}
  error={errors.profileId?.message}
  required
  {...register('profileId')}
/>;
```

**Props:**

- `label` (string, required): Label du select
- `options` (FormSelectOption[], required): Liste des options
- `error` (string, optional): Message d'erreur
- `helperText` (string, optional): Texte d'aide
- `placeholder` (string, optional): Texte placeholder
- `required` (boolean, optional): Champ requis
- Tous les props HTML standard de `<select>`

### FormTextarea

Zone de texte multiligne pour textes longs.

```tsx
import { FormTextarea } from '@/components/ui/Form';

<FormTextarea
  label="Description"
  placeholder="Entrez une description..."
  rows={4}
  error={errors.description?.message}
  {...register('description')}
/>;
```

**Props:**

- `label` (string, required): Label du textarea
- `error` (string, optional): Message d'erreur
- `helperText` (string, optional): Texte d'aide
- `rows` (number, optional): Nombre de lignes (défaut: 4)
- `required` (boolean, optional): Champ requis
- Tous les props HTML standard de `<textarea>`

### FormDatePicker

Sélecteur de date avec icône calendrier.

```tsx
import { FormDatePicker } from '@/components/ui/Form';

<FormDatePicker
  label="Date d'embauche"
  error={errors.hireDate?.message}
  required
  {...register('hireDate')}
/>;
```

**Props:**

- `label` (string, required): Label du champ
- `error` (string, optional): Message d'erreur
- `helperText` (string, optional): Texte d'aide
- `required` (boolean, optional): Champ requis
- Tous les props HTML standard de `<input type="date">`

### FormFileUpload

Upload de fichiers avec drag & drop et prévisualisation.

```tsx
import { FormFileUpload } from '@/components/ui/Form';
import { useState } from 'react';

const [file, setFile] = useState<File | null>(null);

<FormFileUpload
  label="Photo de profil"
  accept="image/*"
  maxSize={5}
  preview={true}
  onChange={setFile}
  value={file}
  error={errors.profilePhoto?.message}
/>;
```

**Props:**

- `label` (string, required): Label du champ
- `onChange` (function, required): Callback appelé lors du changement de fichier
- `accept` (string, optional): Types de fichiers acceptés (défaut: "image/\*")
- `maxSize` (number, optional): Taille maximale en MB (défaut: 5)
- `preview` (boolean, optional): Afficher la prévisualisation (défaut: true)
- `error` (string, optional): Message d'erreur
- `helperText` (string, optional): Texte d'aide
- `value` (File | null, optional): Fichier actuel
- `required` (boolean, optional): Champ requis

### FormError

Message d'erreur global pour formulaires.

```tsx
import { FormError } from '@/components/ui/Form';

<FormError message="Une erreur est survenue lors de la soumission du formulaire." />;
```

**Props:**

- `message` (string, required): Message d'erreur à afficher
- `className` (string, optional): Classes CSS additionnelles

## Utilisation avec React Hook Form

Tous les composants sont compatibles avec React Hook Form via `forwardRef`:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, FormSelect, FormError } from '@/components/ui/Form';

const schema = z.object({
  email: z.string().email('Email invalide'),
  profileId: z.number().positive('Profil requis'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormSelect
        label="Profil"
        options={profiles}
        error={errors.profileId?.message}
        {...register('profileId', { valueAsNumber: true })}
      />

      <button type="submit">Soumettre</button>
    </form>
  );
}
```

## Accessibilité

Tous les composants respectent les standards WCAG 2.1 AA:

- **Labels**: Tous les champs ont des labels visibles ou `aria-label`
- **Erreurs**: Les erreurs sont liées aux champs via `aria-describedby` et `aria-invalid`
- **Focus**: Indicateurs de focus visibles avec ring de couleur
- **Contraste**: Ratio de contraste minimum de 4.5:1
- **Navigation clavier**: Support complet du clavier (Tab, Enter, Escape)
- **Lecteurs d'écran**: Messages d'erreur annoncés avec `role="alert"`

## Styling

Les composants utilisent Tailwind CSS et respectent le design existant:

- **Couleur primaire**: `#2B6A8E`
- **Focus ring**: Couleur primaire avec offset
- **Erreurs**: Rouge avec bordure et texte
- **Transitions**: 200ms pour tous les états
- **Responsive**: Pleine largeur par défaut, adaptable

## Exemples complets

Voir les composants features pour des exemples d'utilisation dans des formulaires complets:

- `src/components/features/users/UserForm.tsx`
- `src/components/features/roles/RoleForm.tsx`
