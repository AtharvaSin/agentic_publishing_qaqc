'use client';

import { FC, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  ['tw-inline-flex tw-items-center tw-gap-1', 'tw-font-medium tw-rounded-full', 'tw-transition-colors'],
  {
    variants: {
      variant: {
        default: 'tw-bg-obsidian-700 tw-text-obsidian-200',
        success: 'tw-bg-status-success/20 tw-text-status-success',
        warning: 'tw-bg-status-medium/20 tw-text-status-medium',
        error: 'tw-bg-status-critical/20 tw-text-status-critical',
        info: 'tw-bg-aurora-cyan/20 tw-text-aurora-cyan',
        purple: 'tw-bg-aurora-purple/20 tw-text-aurora-purple',
        pink: 'tw-bg-aurora-pink/20 tw-text-aurora-pink',
        blue: 'tw-bg-aurora-blue/20 tw-text-aurora-blue',
        teal: 'tw-bg-aurora-teal/20 tw-text-aurora-teal',
        outline: 'tw-border tw-border-obsidian-600 tw-text-obsidian-200',
      },
      size: {
        sm: 'tw-px-2 tw-py-0.5 tw-text-[10px]',
        md: 'tw-px-2.5 tw-py-0.5 tw-text-caption',
        lg: 'tw-px-3 tw-py-1 tw-text-body-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: FC<BadgeProps> = ({ className, variant, size, dot, children, ...props }) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'tw-w-1.5 tw-h-1.5 tw-rounded-full tw-flex-shrink-0',
            variant === 'success' && 'tw-bg-status-success',
            variant === 'warning' && 'tw-bg-status-medium',
            variant === 'error' && 'tw-bg-status-critical',
            variant === 'info' && 'tw-bg-aurora-cyan',
            variant === 'purple' && 'tw-bg-aurora-purple',
            variant === 'pink' && 'tw-bg-aurora-pink',
            variant === 'blue' && 'tw-bg-aurora-blue',
            variant === 'teal' && 'tw-bg-aurora-teal',
            (variant === 'default' || variant === 'outline') && 'tw-bg-obsidian-400'
          )}
        />
      )}
      {children}
    </span>
  );
};

// Status Badge with predefined variants
export type StatusType = 'healthy' | 'warning' | 'critical' | 'neutral';

const statusVariantMap: Record<StatusType, VariantProps<typeof badgeVariants>['variant']> = {
  healthy: 'success',
  warning: 'warning',
  critical: 'error',
  neutral: 'default',
};

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, ...props }) => {
  return <Badge variant={statusVariantMap[status]} dot {...props} />;
};
