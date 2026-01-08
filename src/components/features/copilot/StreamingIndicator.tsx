'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

export interface StreamingIndicatorProps {
  message?: string;
  className?: string;
}

/**
 * Loading/streaming indicator for AI responses
 */
export const StreamingIndicator: FC<StreamingIndicatorProps> = ({
  message = 'Analyzing data...',
  className,
}) => {
  return (
    <div
      className={cn(
        'tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12 tw-gap-4',
        className
      )}
    >
      <div className="tw-relative">
        <Loader2 className="tw-w-10 tw-h-10 tw-text-aurora-cyan tw-animate-spin" />
        <Sparkles
          className={cn(
            'tw-absolute tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2',
            'tw-w-5 tw-h-5 tw-text-aurora-purple tw-animate-pulse'
          )}
        />
      </div>
      <p className="tw-text-body tw-text-obsidian-400 tw-animate-pulse">
        {message}
      </p>
    </div>
  );
};

/**
 * Typing cursor for streaming text
 */
export const TypingCursor: FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      'tw-inline-block tw-w-2 tw-h-4 tw-ml-0.5 tw-bg-aurora-cyan tw-animate-pulse',
      className
    )}
    aria-hidden="true"
  />
);

/**
 * Skeleton for AI response loading state
 */
export const ResponseSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('tw-space-y-4 tw-animate-pulse', className)}>
    {/* Summary skeleton */}
    <div className="tw-bg-obsidian-700/50 tw-rounded-fluent tw-p-4">
      <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-20 tw-mb-3" />
      <div className="tw-space-y-2">
        <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-full" />
        <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-5/6" />
        <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-4/6" />
      </div>
    </div>

    {/* Drivers skeleton */}
    <div className="tw-bg-obsidian-700/50 tw-rounded-fluent tw-p-4">
      <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-24 tw-mb-3" />
      <div className="tw-space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="tw-flex tw-gap-2">
            <div className="tw-w-4 tw-h-4 tw-bg-obsidian-600 tw-rounded" />
            <div className="tw-flex-1">
              <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recommendations skeleton */}
    <div className="tw-bg-obsidian-700/50 tw-rounded-fluent tw-p-4">
      <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-w-32 tw-mb-3" />
      <div className="tw-space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="tw-flex tw-gap-2 tw-p-2 tw-bg-obsidian-600/30 tw-rounded"
          >
            <div className="tw-w-12 tw-h-4 tw-bg-obsidian-600 tw-rounded" />
            <div className="tw-h-3 tw-bg-obsidian-600 tw-rounded tw-flex-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StreamingIndicator;
