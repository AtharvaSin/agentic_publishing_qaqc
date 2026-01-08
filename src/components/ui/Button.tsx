'use client';

import { FC, ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'tw-inline-flex tw-items-center tw-justify-center tw-gap-2',
    'tw-font-medium tw-text-body',
    'tw-rounded-fluent tw-transition-all tw-duration-200',
    'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan',
    'focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-obsidian-900',
    'disabled:tw-opacity-50 disabled:tw-cursor-not-allowed disabled:tw-pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'tw-bg-fluent-brand tw-text-white',
          'hover:tw-bg-fluent-brand-hover active:tw-bg-fluent-brand-pressed',
        ],
        secondary: [
          'tw-bg-obsidian-700 tw-text-obsidian-100',
          'hover:tw-bg-obsidian-600 active:tw-bg-obsidian-500',
          'tw-border tw-border-obsidian-600',
        ],
        ghost: [
          'tw-bg-transparent tw-text-obsidian-200',
          'hover:tw-bg-obsidian-700 active:tw-bg-obsidian-600',
        ],
        danger: [
          'tw-bg-status-critical tw-text-white',
          'hover:tw-bg-red-600 active:tw-bg-red-700',
        ],
        success: [
          'tw-bg-status-success tw-text-white',
          'hover:tw-bg-emerald-600 active:tw-bg-emerald-700',
        ],
        link: [
          'tw-bg-transparent tw-text-aurora-cyan tw-underline-offset-4',
          'hover:tw-underline',
        ],
      },
      size: {
        sm: 'tw-h-8 tw-px-3 tw-text-caption',
        md: 'tw-h-10 tw-px-4 tw-text-body',
        lg: 'tw-h-12 tw-px-6 tw-text-body-lg',
        icon: 'tw-h-10 tw-w-10 tw-p-0',
        'icon-sm': 'tw-h-8 tw-w-8 tw-p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin" />
        ) : (
          leftIcon && <span className="tw-flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !isLoading && <span className="tw-flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// IconButton variant
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton: FC<IconButtonProps> = ({ icon, className, size = 'icon', ...props }) => {
  return (
    <Button className={className} size={size} {...props}>
      {icon}
    </Button>
  );
};
