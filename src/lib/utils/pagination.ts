/**
 * Pagination utilities
 * Ensures consistent pagination behavior across the application
 */

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
} as const;

/**
 * Normalize pagination parameters
 * Ensures page and limit are within valid ranges
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Normalized pagination parameters
 */
export function normalizePaginationParams(
  page?: number,
  limit?: number
): { page: number; limit: number } {
  const normalizedPage = Math.max(
    PAGINATION_DEFAULTS.DEFAULT_PAGE,
    page || PAGINATION_DEFAULTS.DEFAULT_PAGE
  );

  const normalizedLimit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(
      PAGINATION_DEFAULTS.MIN_LIMIT,
      limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT
    )
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

/**
 * Calculate total pages
 *
 * @param total - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Check if page is valid
 *
 * @param page - Page number to check
 * @param totalPages - Total number of pages
 * @returns True if page is valid
 */
export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= totalPages;
}

/**
 * Get page range for pagination controls
 * Returns array of page numbers to display
 *
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param maxPages - Maximum number of page buttons to show (default: 5)
 * @returns Array of page numbers
 *
 * @example
 * getPageRange(5, 10, 5) // [3, 4, 5, 6, 7]
 * getPageRange(1, 10, 5) // [1, 2, 3, 4, 5]
 * getPageRange(10, 10, 5) // [6, 7, 8, 9, 10]
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxPages: number = 5
): number[] {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxPages / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxPages;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxPages + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Get pagination info text
 *
 * @param page - Current page
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination info text (e.g., "Showing 1-10 of 50")
 */
export function getPaginationInfo(
  page: number,
  limit: number,
  total: number
): string {
  if (total === 0) {
    return 'No items';
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return `Showing ${start}-${end} of ${total}`;
}

/**
 * Pagination state hook helper
 * Returns pagination state and handlers
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationHandlers {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function createPaginationHandlers(
  state: PaginationState,
  setPage: (page: number) => void,
  setLimit: (limit: number) => void
): PaginationHandlers {
  const { page, totalPages } = state;

  return {
    setPage,
    setLimit,
    nextPage: () => {
      if (page < totalPages) {
        setPage(page + 1);
      }
    },
    prevPage: () => {
      if (page > 1) {
        setPage(page - 1);
      }
    },
    firstPage: () => setPage(1),
    lastPage: () => setPage(totalPages),
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
  };
}
