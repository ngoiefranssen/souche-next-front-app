import React from 'react';
import { Column } from './types';
import { Search, X } from 'lucide-react';

interface DataTableFiltersProps<T extends object> {
  columns: Column<T>[];
  filters: Record<string, unknown>;
  onFilterChange: (filters: Record<string, unknown>) => void;
}

export function DataTableFilters<T extends object>({
  columns,
  filters,
  onFilterChange,
}: DataTableFiltersProps<T>) {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="">
      <div className="grid grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.key}>
            <div className="relative">
              <input
                type="text"
                value={(filters[column.key] as string) || ''}
                onChange={e => handleFilterChange(column.key, e.target.value)}
                placeholder={`Rechercher ${column.label.toLowerCase()}...`}
                aria-label={`Rechercher ${column.label.toLowerCase()}`}
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-1" />
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
