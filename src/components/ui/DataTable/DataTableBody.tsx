import { Column, ActionButton } from '@/components/ui/DataTable/types';
import { DataTableActions } from '@/components/ui/DataTable/DataTableActions';

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
}

export function DataTableBody<T extends Record<string, unknown>>({
  data,
  columns,
  loading,
  emptyMessage,
  onRowClick,
  actions,
  selectable,
  selectedRows,
  onSelectRow,
}: DataTableBodyProps<T>) {
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
            transition-colors
            ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            ${selectedRows.has(rowIndex) ? 'bg-blue-50' : ''}
          `}
        >
          {selectable && (
            <td className="px-6 py-4 w-12">
              <input
                type="checkbox"
                checked={selectedRows.has(rowIndex)}
                onChange={e => {
                  e.stopPropagation();
                  onSelectRow(rowIndex, e.target.checked);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </td>
          )}
          {columns.map(column => (
            <td
              key={column.key}
              className={`px-6 py-4 whitespace-nowrap text-sm ${
                column.align === 'center'
                  ? 'text-center'
                  : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
              } ${column.className || ''}`}
            >
              {column.render
                ? column.render(row[column.key], row, rowIndex)
                : row[column.key]}
            </td>
          ))}
          {actions && actions.length > 0 && (
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <DataTableActions row={row} actions={actions} />
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}
