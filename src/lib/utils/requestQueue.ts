/**
 * Request queue manager
 * Limits concurrent API requests to prevent overwhelming the server
 */

type QueuedRequest<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add a request to the queue
   * Returns a promise that resolves when the request completes
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.activeRequests++;

    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      activeRequests: this.activeRequests,
      queuedRequests: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Update max concurrent requests
   */
  setMaxConcurrent(max: number) {
    this.maxConcurrent = max;
    this.processQueue();
  }
}

// Global request queue instance
export const requestQueue = new RequestQueue(5);

/**
 * Wrap a fetch function with request queue
 *
 * @param fn - Async function to queue
 * @returns Queued function
 *
 * @example
 * const queuedFetch = withRequestQueue(() => fetch('/api/data'));
 * const data = await queuedFetch();
 */
export function withRequestQueue<T>(fn: () => Promise<T>): () => Promise<T> {
  return () => requestQueue.enqueue(fn);
}

/**
 * Batch multiple requests with queue management
 *
 * @param requests - Array of request functions
 * @returns Promise that resolves when all requests complete
 *
 * @example
 * const results = await batchRequests([
 *   () => fetch('/api/users'),
 *   () => fetch('/api/roles'),
 *   () => fetch('/api/profiles'),
 * ]);
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(requests.map(req => requestQueue.enqueue(req)));
}

/**
 * Execute requests in sequence (one at a time)
 *
 * @param requests - Array of request functions
 * @returns Promise that resolves when all requests complete
 *
 * @example
 * const results = await sequentialRequests([
 *   () => fetch('/api/step1'),
 *   () => fetch('/api/step2'),
 *   () => fetch('/api/step3'),
 * ]);
 */
export async function sequentialRequests<T>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  const results: T[] = [];

  for (const request of requests) {
    const result = await requestQueue.enqueue(request);
    results.push(result);
  }

  return results;
}
