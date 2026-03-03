import { renderHook, act } from '@testing-library/react';
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsWide,
  useScreenType,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  BREAKPOINTS,
} from '../useMediaQuery';

// Mock window.matchMedia
const createMatchMediaMock = (matches: boolean) => {
  return jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('useMediaQuery', () => {
  let matchMediaMock: jest.Mock;
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    // Save original matchMedia if window exists
    if (typeof window !== 'undefined') {
      originalMatchMedia = window.matchMedia;
      matchMediaMock = createMatchMediaMock(false);
      window.matchMedia = matchMediaMock;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore original matchMedia if it was saved
    if (originalMatchMedia && typeof window !== 'undefined') {
      window.matchMedia = originalMatchMedia;
    }
  });

  describe('basic functionality', () => {
    it('should return false initially for non-matching query', () => {
      matchMediaMock = createMatchMediaMock(false);
      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(result.current).toBe(false);
    });

    it('should return true for matching query', () => {
      matchMediaMock = createMatchMediaMock(true);
      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(result.current).toBe(true);
    });

    it('should call window.matchMedia with the correct query', () => {
      const query = '(min-width: 1024px)';
      renderHook(() => useMediaQuery(query));

      expect(matchMediaMock).toHaveBeenCalledWith(query);
    });
  });

  describe('media query changes', () => {
    it('should update when media query changes', () => {
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];

      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(
          (event: string, listener: (event: MediaQueryListEvent) => void) => {
            if (event === 'change') {
              listeners.push(listener);
            }
          }
        ),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(result.current).toBe(false);

      // Simulate media query change
      act(() => {
        listeners.forEach(listener => {
          listener({ matches: true } as MediaQueryListEvent);
        });
      });

      expect(result.current).toBe(true);
    });

    it('should cleanup event listener on unmount', () => {
      const removeEventListenerMock = jest.fn();

      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: removeEventListenerMock,
      }));

      window.matchMedia = mockMatchMedia;

      const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      unmount();

      expect(removeEventListenerMock).toHaveBeenCalled();
    });

    it('should handle legacy addListener/removeListener API', () => {
      const addListenerMock = jest.fn();
      const removeListenerMock = jest.fn();

      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: addListenerMock,
        removeListener: removeListenerMock,
        addEventListener: undefined,
        removeEventListener: undefined,
      }));

      window.matchMedia = mockMatchMedia;

      const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(addListenerMock).toHaveBeenCalled();

      unmount();

      expect(removeListenerMock).toHaveBeenCalled();
    });
  });

  describe('query parameter changes', () => {
    it('should update when query parameter changes', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(min-width: 1024px)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result, rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        {
          initialProps: { query: '(min-width: 768px)' },
        }
      );

      expect(result.current).toBe(false);

      rerender({ query: '(min-width: 1024px)' });

      expect(result.current).toBe(true);
    });
  });

  describe('SSR handling', () => {
    it('should return false during SSR (when window is undefined)', () => {
      const originalWindow = global.window;
      const originalMatchMedia = window.matchMedia;

      // @ts-expect-error - Simulating SSR
      delete global.window;

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(result.current).toBe(false);

      // Restore window
      global.window = originalWindow;
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('useIsMobile', () => {
    it('should return true for mobile screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query.includes(`max-width: ${BREAKPOINTS.tablet - 1}px`),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);
    });

    it('should return false for non-mobile screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);
    });
  });

  describe('useIsTablet', () => {
    it('should return true for tablet screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches:
          query.includes(`min-width: ${BREAKPOINTS.tablet}px`) &&
          query.includes(`max-width: ${BREAKPOINTS.desktop - 1}px`),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsTablet());

      expect(result.current).toBe(true);
    });

    it('should return false for non-tablet screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsTablet());

      expect(result.current).toBe(false);
    });
  });

  describe('useIsDesktop', () => {
    it('should return true for desktop screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query.includes(`min-width: ${BREAKPOINTS.desktop}px`),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsDesktop());

      expect(result.current).toBe(true);
    });

    it('should return false for non-desktop screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsDesktop());

      expect(result.current).toBe(false);
    });
  });

  describe('useIsWide', () => {
    it('should return true for wide screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query.includes(`min-width: ${BREAKPOINTS.wide}px`),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsWide());

      expect(result.current).toBe(true);
    });

    it('should return false for non-wide screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useIsWide());

      expect(result.current).toBe(false);
    });
  });

  describe('useScreenType', () => {
    it('should return "mobile" for mobile screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => {
        // Only mobile query matches
        if (query.includes(`max-width: ${BREAKPOINTS.tablet - 1}px`)) {
          return {
            matches: true,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useScreenType());

      expect(result.current).toBe('mobile');
    });

    it('should return "tablet" for tablet screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => {
        // Only tablet query matches
        if (
          query.includes(`min-width: ${BREAKPOINTS.tablet}px`) &&
          query.includes(`max-width: ${BREAKPOINTS.desktop - 1}px`)
        ) {
          return {
            matches: true,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useScreenType());

      expect(result.current).toBe('tablet');
    });

    it('should return "desktop" for desktop screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => {
        // Desktop query matches but not wide
        if (
          query.includes(`min-width: ${BREAKPOINTS.desktop}px`) &&
          !query.includes(`min-width: ${BREAKPOINTS.wide}px`)
        ) {
          return {
            matches: true,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        if (query.includes(`min-width: ${BREAKPOINTS.wide}px`)) {
          return {
            matches: false,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useScreenType());

      expect(result.current).toBe('desktop');
    });

    it('should return "wide" for wide screens', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => {
        // Wide query matches
        if (query.includes(`min-width: ${BREAKPOINTS.wide}px`)) {
          return {
            matches: true,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useScreenType());

      expect(result.current).toBe('wide');
    });
  });

  describe('usePrefersReducedMotion', () => {
    it('should return true when user prefers reduced motion', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => usePrefersReducedMotion());

      expect(result.current).toBe(true);
    });

    it('should return false when user does not prefer reduced motion', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => usePrefersReducedMotion());

      expect(result.current).toBe(false);
    });
  });

  describe('usePrefersDarkMode', () => {
    it('should return true when user prefers dark mode', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => usePrefersDarkMode());

      expect(result.current).toBe(true);
    });

    it('should return false when user does not prefer dark mode', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => usePrefersDarkMode());

      expect(result.current).toBe(false);
    });
  });

  describe('BREAKPOINTS constant', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.mobile).toBe(375);
      expect(BREAKPOINTS.tablet).toBe(768);
      expect(BREAKPOINTS.desktop).toBe(1024);
      expect(BREAKPOINTS.wide).toBe(1440);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query string', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useMediaQuery(''));

      expect(result.current).toBe(false);
      expect(mockMatchMedia).toHaveBeenCalledWith('');
    });

    it('should handle invalid query string', () => {
      const mockMatchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useMediaQuery('invalid query'));

      expect(result.current).toBe(false);
    });

    it('should handle complex media queries', () => {
      const complexQuery =
        '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)';

      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === complexQuery,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useMediaQuery(complexQuery));

      expect(result.current).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith(complexQuery);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle responsive navigation menu', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query.includes(`max-width: ${BREAKPOINTS.tablet - 1}px`),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      const { result: isMobile } = renderHook(() => useIsMobile());
      const { result: isDesktop } = renderHook(() => useIsDesktop());

      // On mobile, show hamburger menu
      expect(isMobile.current).toBe(true);
      expect(isDesktop.current).toBe(false);
    });

    it('should handle responsive grid layout', () => {
      const mockMatchMedia = jest.fn().mockImplementation((query: string) => {
        if (query.includes(`min-width: ${BREAKPOINTS.desktop}px`)) {
          return {
            matches: true,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      window.matchMedia = mockMatchMedia;

      const { result } = renderHook(() => useScreenType());

      // On desktop, use multi-column layout
      expect(result.current).toBe('desktop');
    });
  });
});
