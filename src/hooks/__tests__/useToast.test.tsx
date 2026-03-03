import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  beforeEach(() => {
    // Clear the DOM before each test
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('success toast', () => {
    it('should display a success toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Operation successful');
      });

      // Check if toast container was created
      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();

      // Check if toast message is displayed
      expect(container?.textContent).toContain('Operation successful');

      // Check if success styling is applied
      const toast = container?.querySelector('[role="alert"]');
      expect(toast?.className).toContain('bg-green-50');
      expect(toast?.className).toContain('text-green-800');
    });

    it('should auto-dismiss after default duration (3000ms)', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message');
      });

      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();

      // Fast-forward time by 3000ms
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Wait for animation (300ms)
      act(() => {
        jest.advanceTimersByTime(350);
      });

      // Toast should be removed
      expect(
        document.getElementById('toast-container')
      ).not.toBeInTheDocument();
    });

    it('should respect custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success message', { duration: 5000 });
      });

      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();

      // Fast-forward by 4999ms (just before duration)
      act(() => {
        jest.advanceTimersByTime(4999);
      });

      expect(container).toBeInTheDocument();

      // Fast-forward the remaining 1ms
      act(() => {
        jest.advanceTimersByTime(1);
      });

      // Wait for animation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(
        document.getElementById('toast-container')
      ).not.toBeInTheDocument();
    });
  });

  describe('error toast', () => {
    it('should display an error toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Operation failed');
      });

      const container = document.getElementById('toast-container');
      expect(container?.textContent).toContain('Operation failed');

      const toast = container?.querySelector('[role="alert"]');
      expect(toast?.className).toContain('bg-red-50');
      expect(toast?.className).toContain('text-red-800');
    });
  });

  describe('info toast', () => {
    it('should display an info toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Information message');
      });

      const container = document.getElementById('toast-container');
      expect(container?.textContent).toContain('Information message');

      const toast = container?.querySelector('[role="alert"]');
      expect(toast?.className).toContain('bg-blue-50');
      expect(toast?.className).toContain('text-blue-800');
    });
  });

  describe('warning toast', () => {
    it('should display a warning toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message');
      });

      const container = document.getElementById('toast-container');
      expect(container?.textContent).toContain('Warning message');

      const toast = container?.querySelector('[role="alert"]');
      expect(toast?.className).toContain('bg-yellow-50');
      expect(toast?.className).toContain('text-yellow-800');
    });
  });

  describe('multiple toasts', () => {
    it('should display multiple toasts simultaneously', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('First message');
        result.current.error('Second message');
        result.current.info('Third message');
      });

      const container = document.getElementById('toast-container');
      expect(container?.textContent).toContain('First message');
      expect(container?.textContent).toContain('Second message');
      expect(container?.textContent).toContain('Third message');

      // Should have 3 toasts
      const toasts = container?.querySelectorAll('[role="alert"]');
      expect(toasts?.length).toBe(3);
    });

    it('should remove toasts independently', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('First', { duration: 1000 });
        result.current.error('Second', { duration: 2000 });
      });

      const container = document.getElementById('toast-container');
      expect(container?.querySelectorAll('[role="alert"]').length).toBe(2);

      // First toast should be removed after 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        jest.advanceTimersByTime(350); // Animation time
      });

      expect(container?.querySelectorAll('[role="alert"]').length).toBe(1);
      expect(container?.textContent).toContain('Second');

      // Second toast should be removed after another 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        jest.advanceTimersByTime(350); // Animation time
      });

      expect(
        document.getElementById('toast-container')
      ).not.toBeInTheDocument();
    });
  });

  describe('dismiss functionality', () => {
    it('should dismiss a specific toast by id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message 1');
        result.current.success('Message 2');
      });

      const container = document.getElementById('toast-container');
      const toasts = container?.querySelectorAll('[role="alert"]');
      expect(toasts?.length).toBe(2);

      // Get the first toast id
      const firstToastId = toasts?.[0].id;

      act(() => {
        result.current.dismiss(firstToastId);
      });

      act(() => {
        jest.advanceTimersByTime(350); // Animation time
      });

      // Should have only 1 toast left
      expect(
        document
          .getElementById('toast-container')
          ?.querySelectorAll('[role="alert"]').length
      ).toBe(1);
    });

    it('should dismiss all toasts when called without id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message 1');
        result.current.error('Message 2');
        result.current.info('Message 3');
      });

      const container = document.getElementById('toast-container');
      expect(container?.querySelectorAll('[role="alert"]').length).toBe(3);

      act(() => {
        result.current.dismiss();
      });

      // All toasts should be removed immediately
      expect(
        document.getElementById('toast-container')
      ).not.toBeInTheDocument();
    });
  });

  describe('position options', () => {
    it('should position toast at top-right by default', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message');
      });

      const container = document.getElementById('toast-container');
      expect(container?.className).toContain('top-4');
      expect(container?.className).toContain('right-4');
    });

    it('should position toast at custom position', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message', { position: 'bottom-left' });
      });

      const container = document.getElementById('toast-container');
      expect(container?.className).toContain('bottom-4');
      expect(container?.className).toContain('left-4');
    });

    it('should handle top-center position', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message', { position: 'top-center' });
      });

      const container = document.getElementById('toast-container');
      expect(container?.className).toContain('top-4');
      expect(container?.className).toContain('left-1/2');
      expect(container?.className).toContain('-translate-x-1/2');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Accessible message');
      });

      const toast = document.querySelector('[role="alert"]');
      expect(toast).toHaveAttribute('role', 'alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('should have a close button with aria-label', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message');
      });

      const closeButton = document.querySelector('button[aria-label="Fermer"]');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('XSS prevention', () => {
    it('should escape HTML in messages', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('<script>alert("xss")</script>');
      });

      const container = document.getElementById('toast-container');

      // The script tag should be escaped and displayed as text
      expect(container?.innerHTML).toContain('&lt;script&gt;');
      expect(container?.innerHTML).not.toContain('<script>');

      // Should not execute the script
      expect(container?.querySelector('script')).not.toBeInTheDocument();
    });

    it('should escape special characters', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('<div>Test & "quotes"</div>');
      });

      const container = document.getElementById('toast-container');
      expect(container?.innerHTML).toContain('&lt;div&gt;');
      expect(container?.innerHTML).toContain('&amp;');
      // Note: textContent escaping doesn't escape quotes
      expect(container?.textContent).toContain('Test & "quotes"');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('');
      });

      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useToast());

      const longMessage = 'A'.repeat(1000);

      act(() => {
        result.current.success(longMessage);
      });

      const container = document.getElementById('toast-container');
      expect(container?.textContent).toContain(longMessage);
    });

    it('should handle special characters in messages', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message with émojis 🎉 and spëcial çhars');
      });

      const container = document.getElementById('toast-container');
      expect(container?.textContent).toContain(
        'Message with émojis 🎉 and spëcial çhars'
      );
    });

    it('should handle zero duration (no auto-dismiss)', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Persistent message', { duration: 0 });
      });

      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();

      // Fast-forward a long time
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Toast should still be there
      expect(container).toBeInTheDocument();
    });

    it('should handle negative duration (treat as 0)', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message', { duration: -1000 });
      });

      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Toast should still be there (negative duration treated as no auto-dismiss)
      expect(container).toBeInTheDocument();
    });
  });

  describe('manual close button', () => {
    it('should close toast when close button is clicked', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message');
      });

      const container = document.getElementById('toast-container');
      expect(container).toBeInTheDocument();

      // Get the toast element before clicking
      const toast = container?.querySelector('[role="alert"]');
      expect(toast).toBeInTheDocument();

      // Find and click the close button
      const closeButton = container?.querySelector('button');

      act(() => {
        closeButton?.click();
      });

      // Toast should be removed immediately (no animation for manual close)
      expect(document.querySelector('[role="alert"]')).not.toBeInTheDocument();

      // Container might still exist but should be empty
      const containerAfter = document.getElementById('toast-container');
      if (containerAfter) {
        expect(containerAfter.children.length).toBe(0);
      }
    });
  });

  describe('container management', () => {
    it('should reuse existing container for multiple toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('First');
      });

      const firstContainer = document.getElementById('toast-container');

      act(() => {
        result.current.success('Second');
      });

      const secondContainer = document.getElementById('toast-container');

      // Should be the same container
      expect(firstContainer).toBe(secondContainer);
    });

    it('should remove container when last toast is dismissed', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Message', { duration: 1000 });
      });

      expect(document.getElementById('toast-container')).toBeInTheDocument();

      // Wait for toast to be dismissed
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        jest.advanceTimersByTime(350); // Animation time
      });

      // Container should be removed
      expect(
        document.getElementById('toast-container')
      ).not.toBeInTheDocument();
    });
  });
});
