/**
 * Session Timeout Utility
 *
 * This module monitors user activity and automatically logs out
 * inactive users after a specified timeout period.
 *
 * SECURITY FEATURES:
 * - Configurable inactivity timeout (default: 30 minutes)
 * - Monitors user interactions (mouse, keyboard, touch)
 * - Warning before logout (optional)
 * - Automatic cleanup on logout
 * - Prevents multiple timers
 */

// Default timeout: 30 minutes in milliseconds
const DEFAULT_TIMEOUT = 30 * 60 * 1000;

// Warning time: 2 minutes before timeout
const WARNING_TIME = 2 * 60 * 1000;

// Activity events to monitor
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

// State
let timeoutId: NodeJS.Timeout | null = null;
let warningTimeoutId: NodeJS.Timeout | null = null;
let isMonitoring = false;
let onTimeoutCallback: (() => void) | null = null;
let onWarningCallback: (() => void) | null = null;

/**
 * Reset the inactivity timer
 * Called whenever user activity is detected
 */
function resetTimer(): void {
  // Clear existing timers
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
  }

  // Set warning timer (if callback provided)
  if (onWarningCallback) {
    warningTimeoutId = setTimeout(() => {
      console.log('[SessionTimeout] Warning: Session will expire soon');
      onWarningCallback?.();
    }, DEFAULT_TIMEOUT - WARNING_TIME);
  }

  // Set timeout timer
  timeoutId = setTimeout(() => {
    console.log('[SessionTimeout] Session expired due to inactivity');
    handleTimeout();
  }, DEFAULT_TIMEOUT);
}

/**
 * Handle session timeout
 * Calls the timeout callback and stops monitoring
 */
function handleTimeout(): void {
  console.log('[SessionTimeout] Handling session timeout');

  // Stop monitoring
  stopMonitoring();

  // Call timeout callback
  if (onTimeoutCallback) {
    onTimeoutCallback();
  }
}

/**
 * Activity event handler
 * Resets the timer when user activity is detected
 */
function handleActivity(): void {
  if (isMonitoring) {
    resetTimer();
  }
}

/**
 * Start monitoring user activity for session timeout
 * @param options - Configuration options
 */
export function startSessionTimeout(options: {
  onTimeout: () => void;
  onWarning?: () => void;
  timeout?: number;
}): void {
  // Don't start if already monitoring
  if (isMonitoring) {
    console.log('[SessionTimeout] Already monitoring, skipping');
    return;
  }

  console.log('[SessionTimeout] Starting session timeout monitoring');

  // Store callbacks
  onTimeoutCallback = options.onTimeout;
  onWarningCallback = options.onWarning || null;

  // Add event listeners for user activity
  ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  // Start the timer
  isMonitoring = true;
  resetTimer();
}

/**
 * Stop monitoring user activity
 * Call this when user logs out or component unmounts
 */
export function stopMonitoring(): void {
  if (!isMonitoring) {
    return;
  }

  console.log('[SessionTimeout] Stopping session timeout monitoring');

  // Clear timers
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
    warningTimeoutId = null;
  }

  // Remove event listeners
  ACTIVITY_EVENTS.forEach(event => {
    window.removeEventListener(event, handleActivity);
  });

  // Reset state
  isMonitoring = false;
  onTimeoutCallback = null;
  onWarningCallback = null;
}

/**
 * Manually reset the session timeout
 * Useful for extending the session after a user action
 */
export function extendSession(): void {
  if (isMonitoring) {
    console.log('[SessionTimeout] Session extended');
    resetTimer();
  }
}

/**
 * Check if session timeout monitoring is active
 * @returns true if monitoring is active
 */
export function isSessionTimeoutActive(): boolean {
  return isMonitoring;
}

/**
 * Get the default timeout duration
 * @returns Timeout duration in milliseconds
 */
export function getTimeoutDuration(): number {
  return DEFAULT_TIMEOUT;
}

/**
 * Get the warning time before timeout
 * @returns Warning time in milliseconds
 */
export function getWarningTime(): number {
  return WARNING_TIME;
}
