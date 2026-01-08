'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

/**
 * Loading skeleton for KPI tiles
 */
export const KPITileSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'tw-bg-obsidian-800 tw-rounded-lg tw-p-4 tw-border tw-border-obsidian-700',
      className
    )}
  >
    <Skeleton className="tw-h-3 tw-w-24 tw-mb-3" />
    <Skeleton className="tw-h-8 tw-w-20 tw-mb-2" />
    <Skeleton className="tw-h-3 tw-w-16" />
  </div>
);

/**
 * Loading skeleton for KPI tile strip
 */
export const KPIStripSkeleton: FC<{ count?: number; className?: string }> = ({
  count = 5,
  className,
}) => (
  <div
    className={cn(
      'tw-grid tw-gap-4',
      count === 4 && 'tw-grid-cols-2 lg:tw-grid-cols-4',
      count === 5 && 'tw-grid-cols-2 lg:tw-grid-cols-5',
      count === 6 && 'tw-grid-cols-2 lg:tw-grid-cols-6',
      className
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <KPITileSkeleton key={i} />
    ))}
  </div>
);

/**
 * Loading skeleton for chart cards
 */
export const ChartSkeleton: FC<{ className?: string; height?: number }> = ({
  className,
  height = 300,
}) => (
  <div
    className={cn(
      'tw-bg-obsidian-800 tw-rounded-lg tw-p-4 tw-border tw-border-obsidian-700',
      className
    )}
  >
    <div className="tw-mb-4">
      <Skeleton className="tw-h-4 tw-w-32 tw-mb-2" />
      <Skeleton className="tw-h-3 tw-w-48" />
    </div>
    <Skeleton className="tw-w-full" style={{ height }} />
  </div>
);

/**
 * Loading skeleton for tables
 */
export const TableSkeleton: FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 5, className }) => (
  <div
    className={cn(
      'tw-bg-obsidian-800 tw-rounded-lg tw-border tw-border-obsidian-700 tw-overflow-hidden',
      className
    )}
  >
    {/* Header */}
    <div className="tw-flex tw-gap-4 tw-p-4 tw-border-b tw-border-obsidian-700 tw-bg-obsidian-700/30">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="tw-h-4 tw-flex-1" />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className={cn(
          'tw-flex tw-gap-4 tw-p-4',
          rowIndex < rows - 1 && 'tw-border-b tw-border-obsidian-700/50'
        )}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            className={cn(
              'tw-h-4 tw-flex-1',
              colIndex === 0 && 'tw-max-w-[150px]'
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Loading skeleton for agent/publisher detail header
 */
export const DetailHeaderSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'tw-bg-obsidian-800 tw-rounded-lg tw-p-6 tw-border tw-border-obsidian-700',
      className
    )}
  >
    <div className="tw-flex tw-items-start tw-justify-between">
      <div className="tw-flex tw-items-center tw-gap-4">
        <Skeleton className="tw-w-16 tw-h-16 tw-rounded-lg" />
        <div>
          <Skeleton className="tw-h-6 tw-w-48 tw-mb-2" />
          <Skeleton className="tw-h-4 tw-w-32 tw-mb-3" />
          <div className="tw-flex tw-gap-2">
            <Skeleton className="tw-h-5 tw-w-16 tw-rounded-full" />
            <Skeleton className="tw-h-5 tw-w-20 tw-rounded-full" />
          </div>
        </div>
      </div>
      <div className="tw-flex tw-gap-2">
        <Skeleton className="tw-h-9 tw-w-24" />
        <Skeleton className="tw-h-9 tw-w-9" />
      </div>
    </div>
  </div>
);

/**
 * Loading skeleton for cards with content
 */
export const CardSkeleton: FC<{ className?: string; lines?: number }> = ({
  className,
  lines = 3,
}) => (
  <div
    className={cn(
      'tw-bg-obsidian-800 tw-rounded-lg tw-p-4 tw-border tw-border-obsidian-700',
      className
    )}
  >
    <Skeleton className="tw-h-4 tw-w-24 tw-mb-4" />
    <div className="tw-space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="tw-h-3"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  </div>
);

/**
 * Loading skeleton for list items
 */
export const ListItemSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('tw-flex tw-items-center tw-gap-3 tw-py-3', className)}>
    <Skeleton className="tw-w-10 tw-h-10 tw-rounded-full tw-flex-shrink-0" />
    <div className="tw-flex-1">
      <Skeleton className="tw-h-4 tw-w-3/4 tw-mb-2" />
      <Skeleton className="tw-h-3 tw-w-1/2" />
    </div>
    <Skeleton className="tw-h-6 tw-w-16 tw-rounded-full" />
  </div>
);

/**
 * Full page loading skeleton
 */
export const PageSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn('tw-space-y-6 tw-animate-pulse', className)}>
    {/* Header */}
    <div className="tw-flex tw-items-center tw-justify-between">
      <div>
        <Skeleton className="tw-h-8 tw-w-48 tw-mb-2" />
        <Skeleton className="tw-h-4 tw-w-64" />
      </div>
      <div className="tw-flex tw-gap-2">
        <Skeleton className="tw-h-9 tw-w-32" />
        <Skeleton className="tw-h-9 tw-w-9" />
      </div>
    </div>

    {/* KPI Strip */}
    <KPIStripSkeleton count={5} />

    {/* Charts */}
    <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
      <ChartSkeleton height={250} />
      <ChartSkeleton height={250} />
    </div>

    {/* Table */}
    <TableSkeleton rows={5} columns={6} />
  </div>
);

/**
 * Inline loading spinner
 */
export const InlineLoader: FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'tw-w-4 tw-h-4',
    md: 'tw-w-6 tw-h-6',
    lg: 'tw-w-8 tw-h-8',
  };

  return (
    <div
      className={cn(
        'tw-inline-block tw-animate-spin tw-rounded-full',
        'tw-border-2 tw-border-obsidian-600 tw-border-t-aurora-cyan',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="tw-sr-only">Loading...</span>
    </div>
  );
};

export default {
  KPITile: KPITileSkeleton,
  KPIStrip: KPIStripSkeleton,
  Chart: ChartSkeleton,
  Table: TableSkeleton,
  DetailHeader: DetailHeaderSkeleton,
  Card: CardSkeleton,
  ListItem: ListItemSkeleton,
  Page: PageSkeleton,
  Inline: InlineLoader,
};
