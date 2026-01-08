/**
 * Accessibility utilities for keyboard navigation and focus management
 */

import { KeyboardEvent, RefObject } from 'react';

/**
 * Focusable element selectors
 */
export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS));
}

/**
 * Focus trap - keep focus within a container
 */
export function createFocusTrap(containerRef: RefObject<HTMLElement>) {
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) return;

    // Shift + Tab from first element -> focus last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab from last element -> focus first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return { handleKeyDown };
}

/**
 * Handle keyboard navigation for lists/grids
 */
export interface KeyboardNavigationOptions {
  items: HTMLElement[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  orientation?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  loop?: boolean;
}

export function handleListKeyNavigation(
  event: KeyboardEvent,
  options: KeyboardNavigationOptions
): void {
  const {
    items,
    currentIndex,
    onIndexChange,
    orientation = 'vertical',
    columns = 1,
    loop = true,
  } = options;

  if (items.length === 0) return;

  let newIndex = currentIndex;
  const lastIndex = items.length - 1;

  switch (event.key) {
    case 'ArrowDown':
      if (orientation === 'vertical') {
        newIndex = currentIndex + 1;
      } else if (orientation === 'grid') {
        newIndex = currentIndex + columns;
      }
      event.preventDefault();
      break;

    case 'ArrowUp':
      if (orientation === 'vertical') {
        newIndex = currentIndex - 1;
      } else if (orientation === 'grid') {
        newIndex = currentIndex - columns;
      }
      event.preventDefault();
      break;

    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = currentIndex + 1;
      }
      event.preventDefault();
      break;

    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'grid') {
        newIndex = currentIndex - 1;
      }
      event.preventDefault();
      break;

    case 'Home':
      newIndex = 0;
      event.preventDefault();
      break;

    case 'End':
      newIndex = lastIndex;
      event.preventDefault();
      break;

    default:
      return;
  }

  // Handle looping
  if (loop) {
    if (newIndex < 0) newIndex = lastIndex;
    if (newIndex > lastIndex) newIndex = 0;
  } else {
    newIndex = Math.max(0, Math.min(lastIndex, newIndex));
  }

  if (newIndex !== currentIndex) {
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'tw-sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export function generateAccessibleId(prefix: string = 'a11y'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Common keyboard handlers
 */
export const KeyboardHandlers = {
  /**
   * Handle Enter/Space for button-like elements
   */
  handleButtonKeyDown: (
    event: KeyboardEvent,
    onClick: () => void
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  },

  /**
   * Handle Escape to close
   */
  handleEscapeClose: (
    event: KeyboardEvent,
    onClose: () => void
  ): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  },

  /**
   * Handle typeahead in lists
   */
  createTypeaheadHandler: (
    items: string[],
    onSelect: (index: number) => void,
    delay: number = 500
  ) => {
    let searchString = '';
    let timeoutId: NodeJS.Timeout | null = null;

    return (event: KeyboardEvent): void => {
      // Only handle single character keys
      if (event.key.length !== 1) return;

      // Clear timeout and update search string
      if (timeoutId) clearTimeout(timeoutId);
      searchString += event.key.toLowerCase();

      // Find matching item
      const matchIndex = items.findIndex((item) =>
        item.toLowerCase().startsWith(searchString)
      );

      if (matchIndex !== -1) {
        onSelect(matchIndex);
      }

      // Reset search string after delay
      timeoutId = setTimeout(() => {
        searchString = '';
      }, delay);
    };
  },
};

/**
 * Skip link component helper
 */
export interface SkipLinkTarget {
  id: string;
  label: string;
}

export const DEFAULT_SKIP_LINKS: SkipLinkTarget[] = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'main-nav', label: 'Skip to navigation' },
];

/**
 * ARIA helper functions
 */
export const AriaHelpers = {
  /**
   * Generate aria-describedby from multiple IDs
   */
  combineDescribedBy: (...ids: (string | undefined)[]): string | undefined => {
    const filtered = ids.filter(Boolean) as string[];
    return filtered.length > 0 ? filtered.join(' ') : undefined;
  },

  /**
   * Get aria-sort value for table headers
   */
  getSortDirection: (
    isSorted: boolean,
    direction: 'asc' | 'desc'
  ): 'ascending' | 'descending' | 'none' => {
    if (!isSorted) return 'none';
    return direction === 'asc' ? 'ascending' : 'descending';
  },

  /**
   * Format number for screen readers
   */
  formatNumberForSR: (value: number, unit?: string): string => {
    const formatted = value.toLocaleString();
    return unit ? `${formatted} ${unit}` : formatted;
  },
};
