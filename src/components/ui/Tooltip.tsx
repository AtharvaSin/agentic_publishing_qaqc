'use client';

import { FC, ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (): void => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = cn(
    'tw-absolute tw-z-50',
    side === 'top' && 'tw-bottom-full tw-mb-2',
    side === 'bottom' && 'tw-top-full tw-mt-2',
    side === 'left' && 'tw-right-full tw-mr-2',
    side === 'right' && 'tw-left-full tw-ml-2',
    align === 'start' && (side === 'top' || side === 'bottom') && 'tw-left-0',
    align === 'center' && (side === 'top' || side === 'bottom') && 'tw-left-1/2 tw--translate-x-1/2',
    align === 'end' && (side === 'top' || side === 'bottom') && 'tw-right-0',
    align === 'start' && (side === 'left' || side === 'right') && 'tw-top-0',
    align === 'center' && (side === 'left' || side === 'right') && 'tw-top-1/2 tw--translate-y-1/2',
    align === 'end' && (side === 'left' || side === 'right') && 'tw-bottom-0'
  );

  return (
    <div className="tw-relative tw-inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && content && (
        <div
          className={cn(
            positionClasses,
            'tw-px-3 tw-py-2 tw-rounded-fluent',
            'tw-bg-obsidian-700 tw-border tw-border-obsidian-600',
            'tw-text-caption tw-text-obsidian-100',
            'tw-shadow-fluent-8 tw-whitespace-nowrap',
            'tw-animate-fade-in',
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
