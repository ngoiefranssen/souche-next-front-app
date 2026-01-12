import React from 'react';
import { Column } from './types';
import { Search, X } from 'lucide-react';

interface DataTableFiltersProps {
  columns: Column[];
  filters: Record<string, unknown>;
  onFilterChange: (filters: Record<string, unknown>) => void;
}

export const DataTableFilters: React.FC<DataTableFiltersProps> = ({
  columns,
  filters,
  onFilterChange,
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {column.label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={(filters[column.key] as string) || ''}
                onChange={e => handleFilterChange(column.key, e.target.value)}
                placeholder={`Rechercher ${column.label.toLowerCase()}...`}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
};
