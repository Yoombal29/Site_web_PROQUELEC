/**
 * Builder Accessibility Hook
 * Provides accessibility features for the builder interface
 */

import { useEffect, useRef } from 'react';

interface UseBuilderAccessibilityProps {
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
}

export const useBuilderAccessibility = ({
  onEscape,
  onArrowUp,
  onArrowDown,
  onEnter
}: UseBuilderAccessibilityProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowDown?.();
          break;
        case 'Enter':
          event.preventDefault();
          onEnter?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onArrowUp, onArrowDown, onEnter]);

  const focusContainer = () => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  return {
    containerRef,
    focusContainer,
    ariaProps: {
      role: 'application',
      'aria-label': 'Page Builder Interface',
      tabIndex: 0
    }
  };
};

/**
 * Hook for managing focus trap in modals/dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !trapRef.current) return;

    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);

  return trapRef;
};

/**
 * Hook for announcing changes to screen readers
 */
export const useAriaAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return {
    announcerRef,
    announce
  };
};
