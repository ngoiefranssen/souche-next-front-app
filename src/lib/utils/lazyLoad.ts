import { lazy, ComponentType } from 'react';

/**
 * Utility for lazy loading components with better error handling
 *
 * @param importFn - Dynamic import function
 * @param retries - Number of retries on failure (default: 3)
 * @param delay - Delay between retries in ms (default: 1000)
 * @returns Lazy loaded component
 *
 * @example
 * const LazyComponent = lazyLoad(() => import('./HeavyComponent'));
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        importFn()
          .then(resolve)
          .catch(error => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }

            console.warn(
              `Failed to load component, retrying... (${retriesLeft} attempts left)`,
              error
            );

            setTimeout(() => {
              attemptImport(retriesLeft - 1);
            }, delay);
          });
      };

      attemptImport(retries);
    });
  });
}

/**
 * Preload a lazy component
 * Useful for prefetching components before they're needed
 *
 * @param lazyComponent - Lazy component to preload
 *
 * @example
 * const LazyComponent = lazyLoad(() => import('./HeavyComponent'));
 * preloadComponent(LazyComponent); // Preload on hover or route change
 */
export function preloadComponent(
  lazyComponent: React.LazyExoticComponent<any>
): void {
  // @ts-expect-error - _payload is internal but safe to use for preloading
  const payload = lazyComponent._payload;

  if (payload && typeof payload._result === 'undefined') {
    // Component not loaded yet, trigger load
    // @ts-expect-error - _init is internal but safe to use for preloading
    payload._result = payload._init(payload._payload);
  }
}

/**
 * Create a lazy component with automatic retry and preload support
 *
 * @param importFn - Dynamic import function
 * @param options - Configuration options
 * @returns Object with lazy component and preload function
 *
 * @example
 * const { Component: LazyTable, preload: preloadTable } = createLazyComponent(
 *   () => import('./DataTable'),
 *   { retries: 3, delay: 1000 }
 * );
 *
 * // Use in component
 * <LazyTable />
 *
 * // Preload on hover
 * <button onMouseEnter={preloadTable}>Show Table</button>
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: { retries?: number; delay?: number } = {}
) {
  const Component = lazyLoad(importFn, options.retries, options.delay);

  return {
    Component,
    preload: () => preloadComponent(Component),
  };
}
