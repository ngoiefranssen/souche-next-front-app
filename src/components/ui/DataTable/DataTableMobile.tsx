import { Column, ActionButton } from './types';
import { DataTableActions } from './DataTableActions';

interface DataTableMobileProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  emptyMessage: string;
  onRowClick?: (row: T, index: number) => void;
  actions?: ActionButton<T>[];
  selectable: boolean;
  selectedRows: Set<number>;
  onSelectRow: (index: number, checked: boolean) => void;
}

export function DataTableMobile<T extends Record<string, unknown>>({
  data,
  columns,
  loading,
  emptyMessage,
  onRowClick,
  actions,
  selectable,
  selectedRows,
  onSelectRow,
}: DataTableMobileProps<T>) {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="p-6 text-center text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="divide-y divide-gray-200">
      {data.map((row, rowIndex) => (
        <div
          key={rowIndex}
          onClick={() => onRowClick?.(row, rowIndex)}
          className={`
            p-4 transition-colors
            ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}
            ${selectedRows.has(rowIndex) ? 'bg-blue-50' : 'bg-white'}
          `}
        >
          {/* Checkbox de sélection */}
          {selectable && (
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={selectedRows.has(rowIndex)}
                onChange={e => {
                  e.stopPropagation();
                  onSelectRow(rowIndex, e.target.checked);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-500">Sélectionner</span>
            </div>
          )}

          {/* Données en format card */}
          <div className="space-y-2">
            {columns.map(column => (
              <div
                key={column.key as string}
                className="flex justify-between items-start"
              >
                <span className="text-sm font-medium text-gray-500 w-1/3">
                  {column.label}:
                </span>
                <span className="text-sm text-gray-900 w-2/3 text-right">
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : String(row[column.key] ?? '')}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <DataTableActions row={row} actions={actions} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
