/**
 * Skeleton loader for DataTable component
 * Provides a loading state that matches the DataTable layout
 */

import React from 'react';
import { Skeleton } from './Skeleton';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  showPagination = true,
  showFilters = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {/* Filters skeleton */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton
              variant="rectangular"
              width="100%"
              height="40px"
              className="sm:w-64"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height="40px"
              className="sm:w-48"
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height="40px"
              className="sm:w-48"
            />
          </div>
        </div>
      )}

      {/* Table header skeleton */}
      {showHeader && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} variant="text" width="80%" height="16px" />
            ))}
          </div>
        </div>
      )}

      {/* Table rows skeleton */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex}>
                <Skeleton
                  variant="text"
                  width="90%"
                  height="16px"
                  className="mb-1"
                />
                {colIndex === 0 && (
                  <Skeleton variant="text" width="70%" height="14px" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      {showPagination && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Skeleton variant="text" width="150px" height="20px" />
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width="80px" height="32px" />
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton variant="rectangular" width="80px" height="32px" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact table skeleton for mobile view
 */
export const TableSkeletonMobile: React.FC<{ rows?: number }> = ({
  rows = 5,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Skeleton
                variant="text"
                width="60%"
                height="20px"
                className="mb-2"
              />
              <Skeleton variant="text" width="40%" height="16px" />
            </div>
            <Skeleton variant="rectangular" width="32px" height="32px" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" height="14px" />
            <Skeleton variant="text" width="80%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
};
