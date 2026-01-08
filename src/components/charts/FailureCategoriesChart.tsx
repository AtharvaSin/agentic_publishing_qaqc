'use client';

import { FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  chartColors,
  chartConfig,
  chartAnimation,
  responsiveContainer,
  barConfig,
} from '@/lib/chartTheme';

/**
 * Data point for failure categories chart
 */
export interface FailureCategoryDataPoint {
  /** Category name */
  category: string;
  /** Count of failures in this category */
  count: number;
  /** Optional severity level for color coding */
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface FailureCategoriesChartProps {
  /** Array of data points for the chart */
  data: FailureCategoryDataPoint[];
  /** Whether the chart is in loading state */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional chart height (default: 300) */
  height?: number;
  /** Number of top categories to show (default: 8) */
  topN?: number;
}

/**
 * Get color based on severity or position
 */
const getBarColor = (
  severity: FailureCategoryDataPoint['severity'] | undefined,
  index: number,
  totalItems: number
): string => {
  if (severity) {
    switch (severity) {
      case 'critical':
        return chartColors.error;
      case 'high':
        return chartColors.series[2] ?? '#EC4899'; // aurora-pink
      case 'medium':
        return chartColors.warning;
      case 'low':
        return chartColors.series[0] ?? '#00D4FF'; // aurora-cyan
      default:
        return chartColors.series[0] ?? '#00D4FF';
    }
  }

  // Color based on position - top items get more intense colors
  const intensity = 1 - (index / totalItems) * 0.5;
  if (index === 0) {
    return chartColors.series[2] ?? '#EC4899'; // aurora-pink for top failure
  }
  if (index === 1) {
    return chartColors.error;
  }
  if (index < 4) {
    return chartColors.warning;
  }
  // Use cyan with decreasing opacity for remaining
  return `rgba(0, 212, 255, ${intensity})`;
};

/**
 * Custom tooltip component for the failure categories chart
 */
const CustomTooltip: FC<{
  active?: boolean;
  payload?: Array<{ value: number; payload: FailureCategoryDataPoint }>;
}> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      className="tw-rounded-fluent tw-px-3 tw-py-2"
      style={{
        backgroundColor: chartColors.tooltip.background,
        border: `1px solid ${chartColors.tooltip.border}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      }}
    >
      <p
        className="tw-text-sm tw-font-semibold tw-mb-1"
        style={{ color: chartColors.tooltip.text }}
      >
        {data.category}
      </p>
      <p className="tw-text-xs" style={{ color: chartColors.series[0] }}>
        Failures: <span className="tw-font-medium">{data.count}</span>
      </p>
      {data.severity && (
        <p className="tw-text-xs tw-mt-1" style={{ color: chartColors.axis }}>
          Severity:{' '}
          <span className="tw-capitalize tw-font-medium">{data.severity}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Loading skeleton for the chart
 */
const ChartLoadingSkeleton: FC = () => (
  <div className="tw-w-full tw-flex tw-flex-col tw-gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="tw-flex tw-items-center tw-gap-3">
        <Skeleton variant="text" className="tw-w-32 tw-h-4" />
        <Skeleton
          variant="rectangular"
          className="tw-h-6 tw-rounded-sm"
          style={{ width: `${Math.max(20, 100 - i * 15)}%` }}
        />
      </div>
    ))}
  </div>
);

/**
 * FailureCategoriesChart - Horizontal bar chart of failure categories
 *
 * Displays failure categories sorted by count (descending).
 * Color-coded by severity with aurora-pink for top failures.
 *
 * @example
 * ```tsx
 * <FailureCategoriesChart
 *   data={[
 *     { category: 'Validation Error', count: 145, severity: 'high' },
 *     { category: 'Missing Metadata', count: 98, severity: 'medium' },
 *   ]}
 * />
 * ```
 */
export const FailureCategoriesChart: FC<FailureCategoriesChartProps> = ({
  data,
  isLoading = false,
  className,
  height = responsiveContainer.height,
  topN = 8,
}) => {
  // Sort data by count descending and take top N
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  }, [data, topN]);

  // Calculate dynamic height based on number of items
  const dynamicHeight = useMemo(() => {
    const itemHeight = 40;
    const minHeight = 200;
    const calculatedHeight = sortedData.length * itemHeight + 60;
    return Math.max(minHeight, Math.min(calculatedHeight, height));
  }, [sortedData.length, height]);

  if (isLoading) {
    return (
      <div className={cn('tw-w-full', className)}>
        <ChartLoadingSkeleton />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'tw-w-full tw-flex tw-items-center tw-justify-center tw-text-obsidian-400',
          className
        )}
        style={{ height: dynamicHeight }}
      >
        No failure data available
      </div>
    );
  }

  return (
    <div className={cn('tw-w-full', className)}>
      <ResponsiveContainer width="100%" height={dynamicHeight}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray={chartConfig.grid.strokeDasharray}
            stroke={chartConfig.grid.stroke}
            strokeOpacity={chartConfig.grid.strokeOpacity}
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={chartConfig.xAxis.axisLine}
            tickLine={chartConfig.xAxis.tickLine}
            tick={chartConfig.xAxis.tick}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={chartConfig.yAxis.axisLine}
            tickLine={chartConfig.yAxis.tickLine}
            tick={{
              ...chartConfig.yAxis.tick,
              width: 110,
              textAnchor: 'end',
            }}
            width={115}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
            barSize={barConfig.barSize}
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.severity, index, sortedData.length)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
