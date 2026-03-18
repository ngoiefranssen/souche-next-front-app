import type { CSSProperties, ReactNode } from 'react';
import {
  Column,
  ActionButton,
  FrozenColumnPosition,
} from '@/components/ui/DataTable/types';
import { DataTableActions } from '@/components/ui/DataTable/DataTableActions';

interface StickyCellMeta {
  side: FrozenColumnPosition;
  offset: number;
  boundary: boolean;
}

interface DataTableBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  emptyMessage: string;
  onRowClick?: (row: T, index: number) => void;
  actions?: ActionButton<T>[];
  selectable: boolean;
  selectedRows: Set<number>;
  onSelectRow: (index: number, checked: boolean) => void;
  columnStickyMeta?: Record<string, StickyCellMeta>;
  selectionStickyMeta?: StickyCellMeta;
  actionsStickyMeta?: StickyCellMeta;
}

export function DataTableBody<T extends object>({
  data,
  columns,
  loading,
  emptyMessage,
  onRowClick,
  actions,
  selectable,
  selectedRows,
  onSelectRow,
  columnStickyMeta = {},
  selectionStickyMeta,
  actionsStickyMeta,
}: DataTableBodyProps<T>) {
  const getColumnValue = (row: T, key: string): unknown =>
    (row as Record<string, unknown>)[key];

  const getStickyStyle = (
    stickyMeta?: StickyCellMeta
  ): CSSProperties | undefined => {
    if (!stickyMeta) return undefined;

    return stickyMeta.side === 'left'
      ? { left: `${stickyMeta.offset}px` }
      : { right: `${stickyMeta.offset}px` };
  };

  const getStickyClassName = (
    stickyMeta: StickyCellMeta | undefined,
    rowSelected: boolean,
    rowClickable: boolean
  ): string => {
    if (!stickyMeta) return '';

    const boundaryClass = stickyMeta.boundary
      ? stickyMeta.side === 'left'
        ? 'shadow-[2px_0_0_0_#E5E7EB]'
        : 'shadow-[-2px_0_0_0_#E5E7EB]'
      : '';

    const backgroundClass = rowSelected
      ? 'bg-blue-50'
      : rowClickable
        ? 'bg-white group-hover:bg-gray-50'
        : 'bg-white';

    return `sticky z-10 ${backgroundClass} ${boundaryClass}`;
  };

  if (loading) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
            className="px-6 py-12 text-center"
          >
            <div className="flex justify-center items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-500">Chargement...</span>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
            className="px-6 py-12 text-center text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((row, rowIndex) => (
        <tr
          key={rowIndex}
          onClick={() => onRowClick?.(row, rowIndex)}
          className={`
            group transition-colors
            ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            ${selectedRows.has(rowIndex) ? 'bg-blue-50' : ''}
          `}
        >
          {selectable && (
            <td
              style={getStickyStyle(selectionStickyMeta)}
              className={`px-6 py-4 w-12 ${getStickyClassName(selectionStickyMeta, selectedRows.has(rowIndex), Boolean(onRowClick))}`}
            >
              <input
                type="checkbox"
                checked={selectedRows.has(rowIndex)}
                onChange={e => {
                  e.stopPropagation();
                  onSelectRow(rowIndex, e.target.checked);
                }}
                onKeyDown={e => {
                  if (e.key === ' ') {
                    e.preventDefault();
                    onSelectRow(rowIndex, !selectedRows.has(rowIndex));
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-[#2B6A8E]"
                aria-label={`Sélectionner la ligne ${rowIndex + 1}`}
              />
            </td>
          )}
          {columns.map(column => {
            const stickyMeta = columnStickyMeta[column.key];
            const rowSelected = selectedRows.has(rowIndex);

            return (
              <td
                key={column.key}
                style={getStickyStyle(stickyMeta)}
                className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 ${
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                } ${column.className || ''} ${getStickyClassName(stickyMeta, rowSelected, Boolean(onRowClick))}`}
              >
                {column.render
                  ? column.render(
                      getColumnValue(row, column.key),
                      row,
                      rowIndex
                    )
                  : (getColumnValue(row, column.key) as ReactNode)}
              </td>
            );
          })}
          {actions && actions.length > 0 && (
            <td
              style={getStickyStyle(actionsStickyMeta)}
              className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getStickyClassName(actionsStickyMeta, selectedRows.has(rowIndex), Boolean(onRowClick))}`}
            >
              <DataTableActions
                row={row}
                rowIndex={rowIndex}
                actions={actions}
              />
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}
