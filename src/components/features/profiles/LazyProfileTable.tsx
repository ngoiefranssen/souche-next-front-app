/**
 * Lazy-loaded ProfileTable component
 * Reduces initial bundle size for pages that don't immediately show the profile table
 *
 * @example
 * import { LazyProfileTable } from '@/components/features/profiles/LazyProfileTable';
 *
 * <Suspense fallback={<TableSkeleton />}>
 *   <LazyProfileTable profiles={profiles} loading={loading} />
 * </Suspense>
 */

import { createLazyComponent } from '@/lib/utils/lazyLoad';

export const { Component: LazyProfileTable, preload: preloadProfileTable } =
  createLazyComponent(
    () => import('./ProfileTable').then(mod => ({ default: mod.ProfileTable })),
    { retries: 3, delay: 1000 }
  );
