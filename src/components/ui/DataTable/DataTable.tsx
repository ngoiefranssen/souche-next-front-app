'use client';

import React, { useState, useMemo } from 'react';
import { DataTableProps, SortConfig } from './types';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTablePagination } from './DataTablePagination';
import { DataTableFilters } from '@/components/ui/DataTable/DataTableFilters';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DataTableMobile } from './DataTableMobile';
import { Eye } from 'lucide-react';

export function DataTable<T extends object>({
  data,
  columns,
  loading = false,
  pagination,
  onRowClick,
  onSort,
  onFilter,
  actions,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'Aucune donnée disponible',
  className = '',
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: null,
  });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Gestion du tri
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        setSortConfig({ key: '', direction: null });
        onSort?.(key, 'asc');
        return;
      }
    }

    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  // Données triées et filtrées
  const processedData = useMemo(() => {
    let result = [...data];

    // Filtrage local si pas de callback onFilter
    if (!onFilter && Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const rowValue = String(
            (row as Record<string, unknown>)[key]
          ).toLowerCase();
          const filterValue = String(value).toLowerCase();
          return rowValue.includes(filterValue);
        });
      });
    }

    // Tri local si pas de callback onSort
    if (!onSort && sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortConfig.key];
        const bValue = (b as Record<string, unknown>)[sortConfig.key];

        if (aValue === bValue) return 0;

        const aComparable = String(aValue ?? '').toLowerCase();
        const bComparable = String(bValue ?? '').toLowerCase();
        const comparison = aComparable.localeCompare(bComparable, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, sortConfig, onFilter, onSort]);

  // Gestion de la sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(processedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };

  // Notification des changements de sélection
  React.useEffect(() => {
    if (onSelectionChange) {
      const selected = Array.from(selectedRows).map(
        index => processedData[index]
      );
      onSelectionChange(selected);
    }
  }, [selectedRows, processedData, onSelectionChange]);

  // Gestion des filtres
  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const filterableColumns = columns.filter(col => col.filterable);
  const tableActions = useMemo(() => {
    const baseActions = actions ? [...actions] : [];

    if (onRowClick) {
      baseActions.unshift({
        label: 'Détails',
        icon: <Eye className="w-4 h-4" />,
        onClick: (row, rowIndex) => onRowClick(row, rowIndex),
        variant: 'secondary',
      });
    }

    return baseActions.length > 0 ? baseActions : undefined;
  }, [actions, onRowClick]);

  return (
    <div className={className}>
      {/* Filtres (hors du conteneur du tableau) */}
      {filterableColumns.length > 0 && (
        <div className="mb-3">
          <DataTableFilters
            columns={filterableColumns}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {/* Vue Mobile (Cards) */}
        {isMobile ? (
          <DataTableMobile
            data={processedData}
            columns={columns}
            loading={loading}
            emptyMessage={emptyMessage}
            actions={tableActions}
            selectable={selectable}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
          />
        ) : (
          /* Vue Desktop (Table) - Scrollable horizontalement sur petits écrans */
          <div className="overflow-x-auto overflow-y-visible -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <DataTableHeader
                    columns={columns}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    selectable={selectable}
                    onSelectAll={handleSelectAll}
                    allSelected={
                      selectedRows.size === processedData.length &&
                      processedData.length > 0
                    }
                    hasActions={Boolean(
                      tableActions && tableActions.length > 0
                    )}
                    actionsLabel="Actions"
                  />
                  <DataTableBody
                    data={processedData}
                    columns={columns}
                    loading={loading}
                    emptyMessage={emptyMessage}
                    actions={tableActions}
                    selectable={selectable}
                    selectedRows={selectedRows}
                    onSelectRow={handleSelectRow}
                  />
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && <DataTablePagination {...pagination} />}
      </div>
    </div>
  );
}
