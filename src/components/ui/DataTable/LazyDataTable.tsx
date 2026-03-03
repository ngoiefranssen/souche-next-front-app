/**
 * Lazy-loaded DataTable component
 * Use this for pages where DataTable is not immediately visible
 * or when you want to reduce initial bundle size
 *
 * @example
 * import { LazyDataTable } from '@/components/ui/DataTable/LazyDataTable';
 *
 * <Suspense fallback={<TableSkeleton />}>
 *   <LazyDataTable columns={columns} data={data} />
 * </Suspense>
 */

import { createLazyComponent } from '@/lib/utils/lazyLoad';

export const { Component: LazyDataTable, preload: preloadDataTable } =
  createLazyComponent(
    () => import('./DataTable').then(mod => ({ default: mod.DataTable })),
    { retries: 3, delay: 1000 }
  );
