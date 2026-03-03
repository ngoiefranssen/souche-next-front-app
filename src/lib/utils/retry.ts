/**
 * Retry utilities for failed requests
 * Implements exponential backoff strategy
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // in ms
  maxDelay?: number; // in ms
  backoffFactor?: number;
  retryableErrors?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: error => {
    // Retry on network errors and 5xx server errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true; // Network error
    }
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      return status >= 500 && status < 600; // Server errors
    }
    return false;
  },
};

/**
 * Calculate delay for next retry using exponential backoff
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param initialDelay - Initial delay in ms
 * @param backoffFactor - Multiplier for each attempt
 * @param maxDelay - Maximum delay in ms
 * @returns Delay in ms
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffFactor: number,
  maxDelay: number
): number {
  const delay = initialDelay * Math.pow(backoffFactor, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified duration
 *
 * @param ms - Duration in milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise that resolves with function result
 *
 * @example
 * const data = await withRetry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!opts.retryableErrors(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts - 1) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.backoffFactor,
        opts.maxDelay
      );

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${opts.maxAttempts} failed, retrying in ${delay}ms...`,
        error
      );

      // Call onRetry callback if provided
      options.onRetry?.(attempt + 1, error);

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable version of a function
 *
 * @param fn - Async function to make retryable
 * @param options - Retry options
 * @returns Retryable function
 *
 * @example
 * const retryableFetch = createRetryable(
 *   (url: string) => fetch(url).then(r => r.json()),
 *   { maxAttempts: 3 }
 * );
 *
 * const data = await retryableFetch('/api/data');
 */
export function createRetryable<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}

/**
 * Retry with custom condition
 * Retries until condition is met or max attempts reached
 *
 * @param fn - Async function to retry
 * @param condition - Function that returns true if result is acceptable
 * @param options - Retry options
 * @returns Promise that resolves with function result
 *
 * @example
 * const data = await retryUntil(
 *   () => fetch('/api/status').then(r => r.json()),
 *   (result) => result.status === 'ready',
 *   { maxAttempts: 10, initialDelay: 2000 }
 * );
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastResult: T;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      lastResult = await fn();

      if (condition(lastResult)) {
        return lastResult;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts - 1) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.backoffFactor,
        opts.maxDelay
      );

      console.warn(
        `[RetryUntil] Attempt ${attempt + 1}/${opts.maxAttempts} condition not met, retrying in ${delay}ms...`
      );

      options.onRetry?.(attempt + 1, new Error('Condition not met'));

      await sleep(delay);
    } catch (error) {
      // If error is not retryable, throw immediately
      if (!opts.retryableErrors(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts - 1) {
        throw error;
      }

      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.backoffFactor,
        opts.maxDelay
      );

      console.warn(
        `[RetryUntil] Attempt ${attempt + 1}/${opts.maxAttempts} failed, retrying in ${delay}ms...`,
        error
      );

      options.onRetry?.(attempt + 1, error);

      await sleep(delay);
    }
  }

  throw new Error('Max retry attempts reached without meeting condition');
}
