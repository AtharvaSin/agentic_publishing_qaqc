'use client';

import { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  return (
    <div
      className={cn(
        'tw-animate-pulse tw-bg-obsidian-700',
        variant === 'text' && 'tw-h-4 tw-rounded',
        variant === 'circular' && 'tw-rounded-full',
        variant === 'rectangular' && 'tw-rounded-fluent',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};

// Skeleton for KPI tiles
export const KPITileSkeleton: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('tw-p-4 tw-rounded-fluent-lg tw-bg-obsidian-800 tw-border tw-border-obsidian-700', className)}>
      <Skeleton variant="text" className="tw-w-24 tw-h-3 tw-mb-3" />
      <Skeleton variant="text" className="tw-w-32 tw-h-8 tw-mb-2" />
      <Skeleton variant="text" className="tw-w-20 tw-h-3" />
    </div>
  );
};

// Skeleton for charts
export const ChartSkeleton: FC<{ className?: string; height?: number }> = ({ className, height = 300 }) => {
  return (
    <div className={cn('tw-p-4 tw-rounded-fluent-lg tw-bg-obsidian-800 tw-border tw-border-obsidian-700', className)}>
      <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
        <div>
          <Skeleton variant="text" className="tw-w-32 tw-h-4 tw-mb-2" />
          <Skeleton variant="text" className="tw-w-48 tw-h-3" />
        </div>
        <Skeleton variant="rectangular" className="tw-w-20 tw-h-8" />
      </div>
      <Skeleton variant="rectangular" height={height} className="tw-w-full" />
    </div>
  );
};

// Skeleton for table rows
export const TableRowSkeleton: FC<{ columns: number; className?: string }> = ({ columns, className }) => {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="tw-px-4 tw-py-3">
          <Skeleton variant="text" className="tw-w-full tw-max-w-[120px] tw-h-4" />
        </td>
      ))}
    </tr>
  );
};

// Skeleton for cards
export const CardSkeleton: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('tw-p-4 tw-rounded-fluent-lg tw-bg-obsidian-800 tw-border tw-border-obsidian-700', className)}>
      <Skeleton variant="text" className="tw-w-3/4 tw-h-5 tw-mb-3" />
      <Skeleton variant="text" className="tw-w-full tw-h-4 tw-mb-2" />
      <Skeleton variant="text" className="tw-w-2/3 tw-h-4" />
    </div>
  );
};
