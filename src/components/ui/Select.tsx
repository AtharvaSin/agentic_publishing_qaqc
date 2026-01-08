'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="tw-w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="tw-block tw-text-caption tw-font-medium tw-text-obsidian-300 tw-mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="tw-relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'tw-w-full tw-h-10 tw-px-3 tw-pr-10 tw-rounded-fluent',
              'tw-bg-obsidian-800 tw-border tw-border-obsidian-600',
              'tw-text-obsidian-100 tw-text-body',
              'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-border-transparent',
              'tw-transition-all tw-duration-200',
              'tw-appearance-none tw-cursor-pointer',
              'disabled:tw-opacity-50 disabled:tw-cursor-not-allowed',
              error && 'tw-border-status-critical focus:tw-ring-status-critical',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2 tw-pointer-events-none">
            <ChevronDown className="tw-h-4 tw-w-4 tw-text-obsidian-400" />
          </div>
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

Select.displayName = 'Select';
