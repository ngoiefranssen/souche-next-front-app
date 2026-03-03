import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

/**
 * Loading state for employment status page
 * Displayed while the page is being lazy loaded
 */
export default function EmploymentStatusLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <Skeleton
            variant="text"
            width="250px"
            height="32px"
            className="mb-2"
          />
          <Skeleton variant="text" width="350px" height="20px" />
        </div>
        <Skeleton variant="rectangular" width="180px" height="40px" />
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
