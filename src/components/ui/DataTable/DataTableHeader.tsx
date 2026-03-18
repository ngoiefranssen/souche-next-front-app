import React from 'react';
import { Column, SortConfig } from './types';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface DataTableHeaderProps<T extends object> {
  columns: Column<T>[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  selectable: boolean;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  hasActions?: boolean;
  actionsLabel?: string;
}

export function DataTableHeader<T extends object>({
  columns,
  sortConfig,
  onSort,
  selectable,
  onSelectAll,
  allSelected,
  hasActions = false,
  actionsLabel = 'Actions',
}: DataTableHeaderProps<T>) {
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-[#5A708A]" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-[#5A708A]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#5A708A]" />
    );
  };

  return (
    <thead className="bg-[#ECF1F6]">
      <tr>
        {selectable && (
          <th className="px-6 py-3 w-12">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={e => onSelectAll(e.target.checked)}
              onKeyDown={e => {
                if (e.key === ' ') {
                  e.preventDefault();
                  onSelectAll(!allSelected);
                }
              }}
              className="w-4 h-4 text-[#5A708A] bg-white border-[#C7D3E0] rounded focus:ring-2 focus:ring-[#C7D3E0]"
              aria-label="Sélectionner toutes les lignes"
            />
          </th>
        )}
        {columns.map(column => (
          <th
            key={column.key}
            style={{ width: column.width }}
            className={`px-6 py-3 text-xs font-semibold text-[#2C4663] uppercase tracking-wider ${
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
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSort(column.key);
                  }
                }}
                className="inline-flex items-center gap-1 text-[#2C4663] transition focus:outline-none rounded px-1"
                aria-label={`Trier par ${column.label}`}
              >
                <span>{column.label}</span>
                {getSortIcon(column.key)}
              </button>
            ) : (
              <span>{column.label}</span>
            )}
          </th>
        ))}
        {hasActions && (
          <th className="px-6 py-3 text-right text-xs font-semibold text-[#2C4663] uppercase tracking-wider">
            {actionsLabel}
          </th>
        )}
      </tr>
    </thead>
  );
}
