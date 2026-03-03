# React Optimization Guide

This document provides guidelines for optimizing React components in the application.

## Overview

React optimization techniques help reduce unnecessary re-renders and improve application performance. This guide covers React.memo, useMemo, and useCallback usage patterns.

## Optimization Techniques

### 1. React.memo

Use `React.memo` to prevent re-renders when props haven't changed.

**When to use:**

- Component renders often with the same props
- Component is expensive to render (complex calculations, large lists)
- Component is a leaf component (no children)

**When NOT to use:**

- Component always renders with different props
- Component is cheap to render
- Premature optimization (measure first!)

**Example:**

```typescript
import React from 'react';

interface UserCardProps {
  name: string;
  email: string;
  onEdit: () => void;
}

// Without memo - re-renders on every parent render
export const UserCard: React.FC<UserCardProps> = ({ name, email, onEdit }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
};

// With memo - only re-renders when props change
export const UserCardOptimized = React.memo<UserCardProps>(({ name, email, onEdit }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
});

UserCardOptimized.displayName = 'UserCard';
```

### 2. useMemo

Use `useMemo` to memoize expensive calculations.

**When to use:**

- Expensive calculations (filtering, sorting large arrays)
- Creating objects/arrays that are passed as props
- Calculations that depend on specific dependencies

**When NOT to use:**

- Simple calculations (addition, string concatenation)
- Values that change on every render
- Premature optimization

**Example:**

```typescript
import { useMemo } from 'react';

function UserList({ users, searchTerm }) {
  // Without useMemo - filters on every render
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // With useMemo - only filters when users or searchTerm change
  const filteredUsersOptimized = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <ul>
      {filteredUsersOptimized.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 3. useCallback

Use `useCallback` to memoize function references.

**When to use:**

- Functions passed as props to memoized components
- Functions used as dependencies in useEffect/useMemo
- Event handlers in lists

**When NOT to use:**

- Functions not passed as props
- Functions that change on every render anyway
- Premature optimization

**Example:**

```typescript
import { useCallback, useState } from 'react';

function UserList({ users }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Without useCallback - new function on every render
  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  // With useCallback - same function reference
  const handleSelectOptimized = useCallback((id: number) => {
    setSelectedId(id);
  }, []); // Empty deps - function never changes

  return (
    <ul>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onSelect={handleSelectOptimized}
        />
      ))}
    </ul>
  );
}
```

## Common Patterns

### Pattern 1: Optimized List Component

```typescript
import React, { useMemo, useCallback } from 'react';

interface Item {
  id: number;
  name: string;
}

interface ListProps {
  items: Item[];
  onItemClick: (id: number) => void;
}

// Memoized list item
const ListItem = React.memo<{ item: Item; onClick: (id: number) => void }>(
  ({ item, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(item.id);
    }, [item.id, onClick]);

    return (
      <li onClick={handleClick}>
        {item.name}
      </li>
    );
  }
);

ListItem.displayName = 'ListItem';

// Optimized list
export const OptimizedList: React.FC<ListProps> = ({ items, onItemClick }) => {
  // Memoize sorted items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Memoize click handler
  const handleClick = useCallback((id: number) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <ul>
      {sortedItems.map(item => (
        <ListItem key={item.id} item={item} onClick={handleClick} />
      ))}
    </ul>
  );
};
```

### Pattern 2: Optimized Form Component

```typescript
import React, { useCallback, useMemo } from 'react';

interface FormProps {
  initialValues: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
}

export const OptimizedForm: React.FC<FormProps> = ({ initialValues, onSubmit }) => {
  const [values, setValues] = React.useState(initialValues);

  // Memoize change handler
  const handleChange = useCallback((field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoize submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  }, [values, onSubmit]);

  // Memoize validation
  const isValid = useMemo(() => {
    return Object.values(values).every(v => v.trim() !== '');
  }, [values]);

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(values).map(field => (
        <FormField
          key={field}
          field={field}
          value={values[field]}
          onChange={handleChange}
        />
      ))}
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
};

// Memoized form field
const FormField = React.memo<{
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
}>(({ field, value, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.value);
  }, [field, onChange]);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={field}
    />
  );
});

FormField.displayName = 'FormField';
```

### Pattern 3: Optimized DataTable

```typescript
import React, { useMemo, useCallback } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

// Memoized table row
const TableRow = React.memo<{
  row: any;
  columns: Column<any>[];
  onClick?: (row: any) => void;
}>(({ row, columns, onClick }) => {
  const handleClick = useCallback(() => {
    onClick?.(row);
  }, [row, onClick]);

  return (
    <tr onClick={handleClick}>
      {columns.map(col => (
        <td key={String(col.key)}>
          {col.render ? col.render(row[col.key], row) : String(row[col.key])}
        </td>
      ))}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export function OptimizedDataTable<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) {
  // Memoize row click handler
  const handleRowClick = useCallback((row: T) => {
    onRowClick?.(row);
  }, [onRowClick]);

  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <TableRow
            key={row.id}
            row={row}
            columns={columns}
            onClick={handleRowClick}
          />
        ))}
      </tbody>
    </table>
  );
}
```

## Best Practices

1. **Measure First** - Use React DevTools Profiler to identify performance bottlenecks before optimizing
2. **Start with React.memo** - Easiest optimization with biggest impact
3. **Use useCallback for Event Handlers** - Especially in lists and memoized components
4. **Use useMemo for Expensive Calculations** - Filtering, sorting, complex transformations
5. **Don't Over-Optimize** - Premature optimization can make code harder to read
6. **Keep Dependencies Minimal** - Fewer dependencies = more stable memoization
7. **Use displayName** - Makes debugging easier with React DevTools

## Anti-Patterns

### ❌ Don't: Memoize Everything

```typescript
// Bad - unnecessary memoization
const Component = () => {
  const value = useMemo(() => 1 + 1, []); // Simple calculation
  const handler = useCallback(() => {}, []); // Not passed as prop

  return <div>{value}</div>;
};
```

### ❌ Don't: Memoize with Unstable Dependencies

```typescript
// Bad - object created on every render
const Component = ({ data }) => {
  const filtered = useMemo(() => {
    return data.filter(item => item.active);
  }, [{ data }]); // Object dependency - always new reference!

  return <List items={filtered} />;
};
```

### ❌ Don't: Forget displayName

```typescript
// Bad - hard to debug
export const MyComponent = React.memo(() => {
  return <div>Hello</div>;
});

// Good - easy to identify in DevTools
export const MyComponent = React.memo(() => {
  return <div>Hello</div>;
});

MyComponent.displayName = 'MyComponent';
```

## Tools

- **React DevTools Profiler** - Measure component render times
- **Why Did You Render** - Debug unnecessary re-renders
- **Bundle Analyzer** - Identify large components for code splitting

## Related Files

- `docs/LAZY_LOADING.md` - Code splitting and lazy loading
- `docs/PERFORMANCE.md` - Overall performance documentation
