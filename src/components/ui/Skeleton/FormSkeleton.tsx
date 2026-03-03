/**
 * Skeleton loader for Form components
 * Provides a loading state that matches form layouts
 */

import React from 'react';
import { Skeleton } from './Skeleton';

export interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  showButtons?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  showTitle = true,
  showButtons = true,
  layout = 'vertical',
  className = '',
}) => {
  const layoutClass = {
    vertical: 'space-y-4',
    horizontal: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  }[layout];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Form title skeleton */}
      {showTitle && (
        <div className="mb-6">
          <Skeleton
            variant="text"
            width="200px"
            height="24px"
            className="mb-2"
          />
          <Skeleton variant="text" width="300px" height="16px" />
        </div>
      )}

      {/* Form fields skeleton */}
      <div className={layoutClass}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Label */}
            <Skeleton variant="text" width="120px" height="16px" />

            {/* Input field */}
            <Skeleton variant="rectangular" width="100%" height="40px" />

            {/* Helper text (occasionally) */}
            {i % 3 === 0 && (
              <Skeleton variant="text" width="200px" height="14px" />
            )}
          </div>
        ))}
      </div>

      {/* Form buttons skeleton */}
      {showButtons && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <Skeleton variant="rectangular" width="120px" height="40px" />
          <Skeleton variant="rectangular" width="120px" height="40px" />
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton for modal forms (more compact)
 */
export const ModalFormSkeleton: React.FC<{ fields?: number }> = ({
  fields = 3,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="100px" height="14px" />
          <Skeleton variant="rectangular" width="100%" height="40px" />
        </div>
      ))}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Skeleton variant="rectangular" width="80px" height="36px" />
        <Skeleton variant="rectangular" width="80px" height="36px" />
      </div>
    </div>
  );
};

/**
 * Skeleton for user form (with photo upload)
 */
export const UserFormSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Title */}
      <div className="mb-6">
        <Skeleton variant="text" width="200px" height="28px" className="mb-2" />
        <Skeleton variant="text" width="350px" height="16px" />
      </div>

      {/* Photo upload */}
      <div className="mb-6">
        <Skeleton variant="text" width="100px" height="16px" className="mb-2" />
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width="80px" height="80px" />
          <Skeleton variant="rectangular" width="150px" height="40px" />
        </div>
      </div>

      {/* Form fields in grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width="120px" height="16px" />
            <Skeleton variant="rectangular" width="100%" height="40px" />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <Skeleton variant="rectangular" width="120px" height="40px" />
        <Skeleton variant="rectangular" width="120px" height="40px" />
      </div>
    </div>
  );
};
