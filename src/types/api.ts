/**
 * Generic API response types
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API error response
 */
export interface ApiError {
  status: 'error';
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
