'use client';

import { FC, useState, useCallback, KeyboardEvent, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

export interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const MIN_LENGTH = 3;
const DEFAULT_MAX_LENGTH = 500;

/**
 * Custom query text input for the AI Insights pane.
 * Allows users to type free-form questions beyond predefined prompt chips.
 */
export const QueryInput: FC<QueryInputProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = 'Ask a custom question...',
  maxLength = DEFAULT_MAX_LENGTH,
  className,
}) => {
  const [value, setValue] = useState('');
  const trimmedValue = value.trim();
  const isValid = trimmedValue.length >= MIN_LENGTH;

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (!isValid || isLoading) return;
      onSubmit(trimmedValue);
      setValue('');
    },
    [isValid, isLoading, trimmedValue, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setValue('');
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('tw-flex tw-items-center tw-gap-2', className)}
      role="search"
      aria-label="Ask a custom question about your data"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isLoading}
        aria-busy={isLoading}
        className={cn(
          'tw-flex-1 tw-h-10 tw-px-3 tw-rounded-fluent-sm',
          'tw-bg-obsidian-800 tw-border tw-border-obsidian-600',
          'tw-text-obsidian-100 tw-text-body placeholder:tw-text-obsidian-400',
          'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-border-transparent',
          'tw-transition-all tw-duration-200',
          'disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
        )}
      />
      <button
        type="submit"
        disabled={isLoading || !isValid}
        aria-label={isLoading ? 'Processing query' : 'Submit query'}
        className={cn(
          'tw-h-10 tw-w-10 tw-flex tw-items-center tw-justify-center',
          'tw-rounded-fluent-sm tw-flex-shrink-0',
          'tw-bg-aurora-cyan/20 tw-text-aurora-cyan',
          'hover:tw-bg-aurora-cyan/30',
          'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan',
          'disabled:tw-opacity-50 disabled:tw-cursor-not-allowed',
          'tw-transition-all tw-duration-200'
        )}
      >
        {isLoading ? (
          <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin" aria-hidden="true" />
        ) : (
          <Send className="tw-h-4 tw-w-4" aria-hidden="true" />
        )}
      </button>
    </form>
  );
};

export default QueryInput;
