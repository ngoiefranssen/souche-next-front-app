import React from 'react';
import { Column, SortConfig, FrozenColumnPosition } from './types';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface StickyCellMeta {
  side: FrozenColumnPosition;
  offset: number;
  boundary: boolean;
}

interface DataTableHeaderProps<T extends object> {
  columns: Column<T>[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  selectable: boolean;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  hasActions?: boolean;
  actionsLabel?: string;
  columnStickyMeta?: Record<string, StickyCellMeta>;
  selectionStickyMeta?: StickyCellMeta;
  actionsStickyMeta?: StickyCellMeta;
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
  columnStickyMeta = {},
  selectionStickyMeta,
  actionsStickyMeta,
}: DataTableHeaderProps<T>) {
  const getStickyClassName = (stickyMeta?: StickyCellMeta): string => {
    if (!stickyMeta) return '';

    const boundaryClass = stickyMeta.boundary
      ? stickyMeta.side === 'left'
        ? 'shadow-[2px_0_0_0_#D1D5DB]'
        : 'shadow-[-2px_0_0_0_#D1D5DB]'
      : '';

    return `sticky z-20 bg-[#ECF1F6] ${boundaryClass}`;
  };

  const getStickyStyle = (
    stickyMeta?: StickyCellMeta
  ): React.CSSProperties | undefined => {
    if (!stickyMeta) return undefined;

    return stickyMeta.side === 'left'
      ? { left: `${stickyMeta.offset}px` }
      : { right: `${stickyMeta.offset}px` };
  };

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
          <th
            style={getStickyStyle(selectionStickyMeta)}
            className={`px-6 py-3 w-12 ${getStickyClassName(selectionStickyMeta)}`}
          >
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
        {columns.map(column => {
          const stickyMeta = columnStickyMeta[column.key];

          return (
            <th
              key={column.key}
              style={{
                width: column.width,
                ...getStickyStyle(stickyMeta),
              }}
              className={`px-6 py-3 text-xs font-semibold text-[#2C4663] uppercase tracking-wider ${
                column.align === 'center'
                  ? 'text-center'
                  : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
              } ${column.className || ''} ${getStickyClassName(stickyMeta)}`}
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
          );
        })}
        {hasActions && (
          <th
            style={getStickyStyle(actionsStickyMeta)}
            className={`px-6 py-3 text-right text-xs font-semibold text-[#2C4663] uppercase tracking-wider ${getStickyClassName(actionsStickyMeta)}`}
          >
            {actionsLabel}
          </th>
        )}
      </tr>
    </thead>
  );
}
