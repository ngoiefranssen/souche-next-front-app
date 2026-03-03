/**
 * Hook for managing keyboard navigation in interactive components
 * Provides utilities for handling Tab, Enter, Escape, and Arrow keys
 */

import { useEffect, useCallback, RefObject } from 'react';

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  enabled?: boolean;
  trapFocus?: boolean;
  containerRef?: RefObject<HTMLElement>;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  enabled = true,
  trapFocus = false,
  containerRef,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault();
            onArrowDown();
          }
          break;
        case 'Tab':
          if (trapFocus && containerRef?.current) {
            handleTabKey(event, containerRef.current);
          }
          break;
      }
    },
    [
      enabled,
      onEscape,
      onEnter,
      onArrowUp,
      onArrowDown,
      trapFocus,
      containerRef,
    ]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return { handleKeyDown };
}

/**
 * Handle Tab key for focus trapping within a container
 */
function handleTabKey(event: KeyboardEvent, container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const focusableArray = Array.from(focusableElements);
  const firstElement = focusableArray[0];
  const lastElement = focusableArray[focusableArray.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

/**
 * Hook for managing focus within a modal or dropdown
 */
export function useFocusTrap(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Restore focus on unmount
    return () => {
      previousActiveElement?.focus();
    };
  }, [isOpen, containerRef]);
}

/**
 * Hook for handling dropdown keyboard navigation
 */
export function useDropdownNavigation(
  isOpen: boolean,
  itemCount: number,
  onSelect: (index: number) => void,
  onClose: () => void
) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % itemCount);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(selectedIndex);
          break;
        case 'Home':
          event.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setSelectedIndex(itemCount - 1);
          break;
      }
    },
    [isOpen, itemCount, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return { selectedIndex, setSelectedIndex };
}

// Import React for useState
import React from 'react';
