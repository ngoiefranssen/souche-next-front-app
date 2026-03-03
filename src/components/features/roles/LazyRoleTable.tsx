/**
 * Lazy-loaded RoleTable component
 * Reduces initial bundle size for pages that don't immediately show the role table
 *
 * @example
 * import { LazyRoleTable } from '@/components/features/roles/LazyRoleTable';
 *
 * <Suspense fallback={<TableSkeleton />}>
 *   <LazyRoleTable roles={roles} loading={loading} />
 * </Suspense>
 */

import { createLazyComponent } from '@/lib/utils/lazyLoad';

export const { Component: LazyRoleTable, preload: preloadRoleTable } =
  createLazyComponent(
    () => import('./RoleTable').then(mod => ({ default: mod.RoleTable })),
    { retries: 3, delay: 1000 }
  );
