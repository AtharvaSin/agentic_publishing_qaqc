'use client';

import { FC, HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'tw-rounded-fluent-lg tw-transition-all tw-duration-200',
          variant === 'default' && 'tw-bg-obsidian-800 tw-border tw-border-obsidian-700 tw-shadow-fluent-4',
          variant === 'outline' && 'tw-bg-transparent tw-border tw-border-obsidian-700',
          variant === 'ghost' && 'tw-bg-obsidian-800/50',
          padding === 'none' && 'tw-p-0',
          padding === 'sm' && 'tw-p-3',
          padding === 'md' && 'tw-p-4',
          padding === 'lg' && 'tw-p-6',
          hoverable && 'hover:tw-bg-obsidian-700 hover:tw-border-obsidian-600 tw-cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader: FC<CardHeaderProps> = ({ title, subtitle, action, className, ...props }) => {
  return (
    <div className={cn('tw-flex tw-items-start tw-justify-between tw-gap-4 tw-mb-4', className)} {...props}>
      <div className="tw-flex-1 tw-min-w-0">
        <h3 className="tw-text-body tw-font-semibold tw-text-obsidian-100 tw-truncate">{title}</h3>
        {subtitle && (
          <p className="tw-text-caption tw-text-obsidian-400 tw-mt-0.5 tw-truncate">{subtitle}</p>
        )}
      </div>
      {action && <div className="tw-flex-shrink-0">{action}</div>}
    </div>
  );
};

// Card Content
export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent: FC<CardContentProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('tw-text-obsidian-200', className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter: FC<CardFooterProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'tw-flex tw-items-center tw-justify-end tw-gap-2 tw-mt-4 tw-pt-4',
        'tw-border-t tw-border-obsidian-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
