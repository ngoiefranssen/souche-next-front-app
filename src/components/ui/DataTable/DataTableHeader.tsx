import React from 'react';
import { Column, SortConfig } from './types';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface DataTableHeaderProps {
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  selectable: boolean;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export const DataTableHeader: React.FC<DataTableHeaderProps> = ({
  columns,
  sortConfig,
  onSort,
  selectable,
  onSelectAll,
  allSelected,
}) => {
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        {selectable && (
          <th className="px-6 py-3 w-12">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={e => onSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </th>
        )}
        {columns.map(column => (
          <th
            key={column.key}
            style={{ width: column.width }}
            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left'
            } ${column.className || ''}`}
          >
            {column.sortable ? (
              <button
                onClick={() => onSort(column.key)}
                className="flex items-center space-x-1 hover:text-gray-700 transition"
              >
                <span>{column.label}</span>
                {getSortIcon(column.key)}
              </button>
            ) : (
              <span>{column.label}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};
