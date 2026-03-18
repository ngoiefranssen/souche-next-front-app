import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

/**
 * Loading state for roles page
 * Displayed while the page is being lazy loaded
 */
export default function RolesLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <Skeleton
            variant="text"
            width="200px"
            height="32px"
            className="mb-2"
          />
          <Skeleton variant="text" width="300px" height="20px" />
        </div>
        <Skeleton variant="rectangular" width="150px" height="40px" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton
        rows={5}
        columns={4}
        showHeader={true}
        showPagination={true}
        showFilters={true}
      />
    </div>
  );
}
