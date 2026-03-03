/**
 * Lazy-loaded EmploymentStatusTable component
 * Reduces initial bundle size for pages that don't immediately show the employment status table
 *
 * @example
 * import { LazyEmploymentStatusTable } from '@/components/features/employment-status/LazyEmploymentStatusTable';
 *
 * <Suspense fallback={<TableSkeleton />}>
 *   <LazyEmploymentStatusTable statuses={statuses} loading={loading} />
 * </Suspense>
 */

import { createLazyComponent } from '@/lib/utils/lazyLoad';

export const {
  Component: LazyEmploymentStatusTable,
  preload: preloadEmploymentStatusTable,
} = createLazyComponent(
  () =>
    import('./EmploymentStatusTable').then(mod => ({
      default: mod.EmploymentStatusTable,
    })),
  { retries: 3, delay: 1000 }
);
