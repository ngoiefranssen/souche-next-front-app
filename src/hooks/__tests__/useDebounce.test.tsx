import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes with default delay (300ms)', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      expect(result.current).toBe('initial');

      // Update the value
      rerender({ value: 'updated' });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Fast-forward time by 299ms (just before delay)
      act(() => {
        jest.advanceTimersByTime(299);
      });

      // Value should still be the old one
      expect(result.current).toBe('initial');

      // Fast-forward the remaining 1ms
      act(() => {
        jest.advanceTimersByTime(1);
      });

      // Now the value should be updated
      expect(result.current).toBe('updated');
    });

    it('should debounce value changes with custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // Fast-forward by 499ms
      act(() => {
        jest.advanceTimersByTime(499);
      });

      expect(result.current).toBe('initial');

      // Fast-forward the remaining 1ms
      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('multiple rapid changes', () => {
    it('should only update to the last value after multiple rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      // Simulate rapid typing
      rerender({ value: 'a' });
      act(() => {
        jest.advanceTimersByTime(50);
      });

      rerender({ value: 'ab' });
      act(() => {
        jest.advanceTimersByTime(50);
      });

      rerender({ value: 'abc' });
      act(() => {
        jest.advanceTimersByTime(50);
      });

      rerender({ value: 'abcd' });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Fast-forward past the delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should update to the last value only
      expect(result.current).toBe('abcd');
    });

    it('should reset the timer on each value change', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'first' });

      // Wait 250ms (not enough to trigger)
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current).toBe('initial');

      // Change value again (resets timer)
      rerender({ value: 'second' });

      // Wait another 250ms (still not enough because timer was reset)
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current).toBe('initial');

      // Wait the remaining 50ms
      act(() => {
        jest.advanceTimersByTime(50);
      });

      // Should now show 'second'
      expect(result.current).toBe('second');
    });
  });

  describe('different data types', () => {
    it('should work with strings', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'hello' },
        }
      );

      rerender({ value: 'world' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('world');
    });

    it('should work with numbers', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 0 },
        }
      );

      rerender({ value: 42 });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(42);
    });

    it('should work with booleans', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: false },
        }
      );

      rerender({ value: true });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(true);
    });

    it('should work with objects', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: { name: 'John' } },
        }
      );

      const newValue = { name: 'Jane' };
      rerender({ value: newValue });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toEqual(newValue);
    });

    it('should work with arrays', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: [1, 2, 3] },
        }
      );

      const newValue = [4, 5, 6];
      rerender({ value: newValue });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toEqual(newValue);
    });

    it('should work with null and undefined', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: null as string | null },
        }
      );

      rerender({ value: undefined as string | null | undefined });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe('delay changes', () => {
    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      rerender({ value: 'updated', delay: 500 });

      // Fast-forward by 300ms (old delay)
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not update yet because new delay is 500ms
      expect(result.current).toBe('initial');

      // Fast-forward remaining 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Now should be updated
      expect(result.current).toBe('updated');
    });

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // Even with 0 delay, setTimeout is still async
      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // Unmount before delay completes
      unmount();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Value should still be initial because component unmounted
      expect(result.current).toBe('initial');
    });

    it('should cleanup previous timeout when value changes', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'first' });
      rerender({ value: 'second' });

      // clearTimeout should be called when value changes
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'text' },
        }
      );

      rerender({ value: '' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('');
    });

    it('should handle same value updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: 'same' },
        }
      );

      rerender({ value: 'same' });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('same');
    });

    it('should handle very large delays', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 10000),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(9999);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('real-world use case: search input', () => {
    it('should simulate typing in a search field', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: '' },
        }
      );

      // User types "react"
      const searchTerm = 'react';
      for (let i = 1; i <= searchTerm.length; i++) {
        rerender({ value: searchTerm.substring(0, i) });
        act(() => {
          jest.advanceTimersByTime(50); // Simulate typing speed
        });
      }

      // Value should still be empty because user is still typing
      expect(result.current).toBe('');

      // User stops typing, wait for debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Now the search should trigger with the complete term
      expect(result.current).toBe('react');
    });
  });
});
