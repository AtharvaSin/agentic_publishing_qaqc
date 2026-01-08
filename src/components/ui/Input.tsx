'use client';

import { FC, InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, onClear, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="tw-w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="tw-block tw-text-caption tw-font-medium tw-text-obsidian-300 tw-mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="tw-relative">
          {leftIcon && (
            <div className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-obsidian-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'tw-w-full tw-h-10 tw-px-3 tw-rounded-fluent',
              'tw-bg-obsidian-800 tw-border tw-border-obsidian-600',
              'tw-text-obsidian-100 tw-text-body placeholder:tw-text-obsidian-400',
              'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-border-transparent',
              'tw-transition-all tw-duration-200',
              'disabled:tw-opacity-50 disabled:tw-cursor-not-allowed',
              leftIcon && 'tw-pl-10',
              (rightIcon ?? onClear) && 'tw-pr-10',
              error && 'tw-border-status-critical focus:tw-ring-status-critical',
              className
            )}
            {...props}
          />
          {(rightIcon ?? (onClear && props.value)) && (
            <div className="tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2">
              {onClear && props.value ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="tw-text-obsidian-400 hover:tw-text-obsidian-200 tw-transition-colors"
                  aria-label="Clear input"
                >
                  <X className="tw-h-4 tw-w-4" />
                </button>
              ) : (
                <span className="tw-text-obsidian-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        {(error ?? hint) && (
          <p
            className={cn(
              'tw-mt-1.5 tw-text-caption',
              error ? 'tw-text-status-critical' : 'tw-text-obsidian-400'
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input variant
export type SearchInputProps = Omit<InputProps, 'leftIcon' | 'type'>;

export const SearchInput: FC<SearchInputProps> = ({ placeholder = 'Search...', ...props }) => {
  return (
    <Input
      type="search"
      leftIcon={<Search className="tw-h-4 tw-w-4" />}
      placeholder={placeholder}
      {...props}
    />
  );
};
