'use client';

import { FC, ReactNode, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './Button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'tw-max-w-md',
  md: 'tw-max-w-lg',
  lg: 'tw-max-w-2xl',
  xl: 'tw-max-w-4xl',
  full: 'tw-max-w-[90vw] tw-max-h-[90vh]',
};

export const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle escape key
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onOpenChange(false);
      }
    },
    [closeOnEscape, onOpenChange]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onOpenChange(false);
      }
    },
    [closeOnBackdropClick, onOpenChange]
  );

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!open) {
      return;
    }

    // Store current active element
    previousActiveElement.current = document.activeElement;

    // Add escape key listener
    document.addEventListener('keydown', handleEscape);

    // Focus the dialog
    dialogRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, handleEscape]);

  // Don't render if not open or on server
  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'tw-fixed tw-inset-0 tw-z-50',
        'tw-flex tw-items-center tw-justify-center',
        'tw-p-4',
        // Backdrop
        'tw-bg-obsidian-900/80 tw-backdrop-blur-sm',
        // Animation
        'tw-animate-fade-in'
      )}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        tabIndex={-1}
        className={cn(
          'tw-relative tw-w-full',
          sizeClasses[size],
          'tw-bg-obsidian-800 tw-border tw-border-obsidian-700',
          'tw-rounded-fluent-lg tw-shadow-fluent-16',
          'tw-outline-none',
          // Animation
          'tw-animate-fade-in',
          // Max height with scroll
          'tw-max-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="tw-flex tw-items-start tw-justify-between tw-p-6 tw-border-b tw-border-obsidian-700">
          <div className="tw-flex-1 tw-min-w-0 tw-pr-4">
            <h2
              id="dialog-title"
              className="tw-text-subtitle tw-font-semibold tw-text-obsidian-100"
            >
              {title}
            </h2>
            {description && (
              <p
                id="dialog-description"
                className="tw-text-body tw-text-obsidian-400 tw-mt-1"
              >
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <IconButton
              icon={<X className="tw-w-4 tw-h-4" />}
              aria-label="Close dialog"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              className="tw-text-obsidian-400 hover:tw-text-obsidian-100"
            />
          )}
        </div>

        {/* Content */}
        <div className="tw-flex-1 tw-overflow-y-auto tw-p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// Dialog Footer - optional component for action buttons
export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter: FC<DialogFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'tw-flex tw-items-center tw-justify-end tw-gap-3',
        'tw-px-6 tw-py-4 tw-border-t tw-border-obsidian-700',
        'tw-bg-obsidian-800/50',
        className
      )}
    >
      {children}
    </div>
  );
};

// Dialog Section - for organizing content within dialog
export interface DialogSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const DialogSection: FC<DialogSectionProps> = ({ title, children, className }) => {
  return (
    <div className={cn('tw-mb-6 last:tw-mb-0', className)}>
      {title && (
        <h3 className="tw-text-caption tw-font-semibold tw-text-obsidian-300 tw-uppercase tw-tracking-wider tw-mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
