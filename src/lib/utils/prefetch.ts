/**
 * Prefetching utilities
 * Preload data and components before they're needed
 */

import { cache } from './cache';

/**
 * Prefetch data and store in cache
 *
 * @param key - Cache key
 * @param fn - Function that fetches the data
 * @param ttl - Time to live in milliseconds
 *
 * @example
 * // Prefetch on hover
 * <Link
 *   href="/users"
 *   onMouseEnter={() => prefetchData('users', () => usersAPI.getAll())}
 * >
 *   Users
 * </Link>
 */
export async function prefetchData<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<void> {
  // Check if already cached
  if (cache.has(key)) {
    return;
  }

  try {
    const data = await fn();
    cache.set(key, data, ttl);
    console.log(`[Prefetch] Cached: ${key}`);
  } catch (error) {
    console.error(`[Prefetch] Failed to prefetch ${key}:`, error);
  }
}

/**
 * Prefetch multiple data sources in parallel
 *
 * @param prefetches - Array of prefetch configurations
 *
 * @example
 * prefetchMultiple([
 *   { key: 'users', fn: () => usersAPI.getAll() },
 *   { key: 'roles', fn: () => rolesAPI.getAll() },
 *   { key: 'profiles', fn: () => profilesAPI.getAll() },
 * ]);
 */
export async function prefetchMultiple(
  prefetches: Array<{
    key: string;
    fn: () => Promise<any>;
    ttl?: number;
  }>
): Promise<void> {
  await Promise.all(
    prefetches.map(({ key, fn, ttl }) => prefetchData(key, fn, ttl))
  );
}

/**
 * Create a prefetch handler for React components
 *
 * @param key - Cache key
 * @param fn - Function that fetches the data
 * @returns Prefetch handler function
 *
 * @example
 * const prefetchUsers = createPrefetchHandler('users', () => usersAPI.getAll());
 *
 * <Link href="/users" onMouseEnter={prefetchUsers}>
 *   Users
 * </Link>
 */
export function createPrefetchHandler<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): () => void {
  return () => {
    prefetchData(key, fn, ttl);
  };
}

/**
 * Prefetch on idle
 * Uses requestIdleCallback to prefetch when browser is idle
 *
 * @param key - Cache key
 * @param fn - Function that fetches the data
 * @param ttl - Time to live in milliseconds
 *
 * @example
 * // Prefetch when browser is idle
 * useEffect(() => {
 *   prefetchOnIdle('users', () => usersAPI.getAll());
 * }, []);
 */
export function prefetchOnIdle<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): void {
  if (typeof window === 'undefined') {
    return;
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchData(key, fn, ttl);
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      prefetchData(key, fn, ttl);
    }, 1);
  }
}

/**
 * Prefetch on visibility
 * Prefetches when element becomes visible using Intersection Observer
 *
 * @param element - Element to observe
 * @param key - Cache key
 * @param fn - Function that fetches the data
 * @param ttl - Time to live in milliseconds
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 *
 * useEffect(() => {
 *   if (ref.current) {
 *     prefetchOnVisibility(ref.current, 'users', () => usersAPI.getAll());
 *   }
 * }, []);
 *
 * <div ref={ref}>Content</div>
 */
export function prefetchOnVisibility<T>(
  element: Element,
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => {};
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          prefetchData(key, fn, ttl);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(element);

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Prefetch route data
 * Prefetches data for a specific route
 *
 * @param route - Route path
 * @param dataFetchers - Object with data fetcher functions
 *
 * @example
 * prefetchRoute('/users', {
 *   users: () => usersAPI.getAll(),
 *   profiles: () => profilesAPI.getAll(),
 * });
 */
export async function prefetchRoute(
  route: string,
  dataFetchers: Record<string, () => Promise<any>>
): Promise<void> {
  const prefetches = Object.entries(dataFetchers).map(([key, fn]) => ({
    key: `${route}:${key}`,
    fn,
  }));

  await prefetchMultiple(prefetches);
}

/**
 * Hook for prefetching data
 *
 * @example
 * import { usePrefetch } from '@/lib/utils/prefetch';
 *
 * function MyComponent() {
 *   const prefetchUsers = usePrefetch('users', () => usersAPI.getAll());
 *
 *   return (
 *     <Link href="/users" onMouseEnter={prefetchUsers}>
 *       Users
 *     </Link>
 *   );
 * }
 */
export function usePrefetch<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): () => void {
  return createPrefetchHandler(key, fn, ttl);
}
