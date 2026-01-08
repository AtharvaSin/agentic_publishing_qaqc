'use client';

import { FC } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  chartColors,
  chartConfig,
  chartAnimation,
  responsiveContainer,
  getGradientId,
} from '@/lib/chartTheme';

/**
 * Data point for backlog trend chart
 */
export interface BacklogTrendDataPoint {
  /** Date string (e.g., "2024-01-15" or "Jan 15") */
  date: string;
  /** Count of items pending human review */
  humanReview: number;
  /** Count of items requiring action */
  actionRequired: number;
}

export interface BacklogTrendChartProps {
  /** Array of data points for the chart */
  data: BacklogTrendDataPoint[];
  /** Whether the chart is in loading state */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional chart height (default: 300) */
  height?: number;
}

/**
 * Custom tooltip component for the backlog trend chart
 */
const CustomTooltip: FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

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
        className="tw-text-sm tw-font-semibold tw-mb-2"
        style={{ color: chartColors.tooltip.text }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          className="tw-text-xs tw-flex tw-items-center tw-gap-2"
          style={{ color: entry.color }}
        >
          <span
            className="tw-w-2 tw-h-2 tw-rounded-full tw-inline-block"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="tw-font-medium">{entry.value}</span>
        </p>
      ))}
      <div
        className="tw-border-t tw-mt-2 tw-pt-2"
        style={{ borderColor: chartColors.tooltip.border }}
      >
        <p
          className="tw-text-xs tw-font-semibold"
          style={{ color: chartColors.tooltip.text }}
        >
          Total Backlog: <span className="tw-font-bold">{total}</span>
        </p>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for the chart
 */
const ChartLoadingSkeleton: FC<{ height: number }> = ({ height }) => (
  <div className="tw-w-full tw-flex tw-flex-col tw-gap-4">
    <div className="tw-flex tw-justify-between tw-items-center">
      <Skeleton variant="text" className="tw-w-40 tw-h-4" />
      <div className="tw-flex tw-gap-4">
        <Skeleton variant="text" className="tw-w-24 tw-h-3" />
        <Skeleton variant="text" className="tw-w-24 tw-h-3" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={height - 40} className="tw-w-full" />
  </div>
);

/**
 * BacklogTrendChart - Overlapping area chart showing review backlog over time
 *
 * Displays two overlapping areas for direct comparison:
 * - Human Review (aurora-purple): Items pending human review
 * - Action Required (aurora-pink): Items requiring immediate action
 *
 * Lines overlap when values are equal for accurate comparison.
 * Uses gradient fills with aurora colors for visual appeal.
 *
 * @example
 * ```tsx
 * <BacklogTrendChart
 *   data={[
 *     { date: 'Jan 1', humanReview: 45, actionRequired: 12 },
 *     { date: 'Jan 2', humanReview: 52, actionRequired: 15 },
 *   ]}
 * />
 * ```
 */
export const BacklogTrendChart: FC<BacklogTrendChartProps> = ({
  data,
  isLoading = false,
  className,
  height = responsiveContainer.height,
}) => {
  const humanReviewGradientId = getGradientId('humanReview');
  const actionRequiredGradientId = getGradientId('actionRequired');

  if (isLoading) {
    return (
      <div className={cn('tw-w-full', className)}>
        <ChartLoadingSkeleton height={height} />
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
        style={{ height }}
      >
        No backlog data available
      </div>
    );
  }

  return (
    <div className={cn('tw-w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Gradient for Human Review area */}
            <linearGradient id={humanReviewGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartColors.series[1]}
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor={chartColors.series[1]}
                stopOpacity={0.05}
              />
            </linearGradient>
            {/* Gradient for Action Required area */}
            <linearGradient id={actionRequiredGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartColors.series[2]}
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor={chartColors.series[2]}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray={chartConfig.grid.strokeDasharray}
            stroke={chartConfig.grid.stroke}
            strokeOpacity={chartConfig.grid.strokeOpacity}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={chartConfig.xAxis.axisLine}
            tickLine={chartConfig.xAxis.tickLine}
            tick={chartConfig.xAxis.tick}
            dy={10}
          />
          <YAxis
            axisLine={chartConfig.yAxis.axisLine}
            tickLine={chartConfig.yAxis.tickLine}
            tick={chartConfig.yAxis.tick}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={chartConfig.legend.wrapperStyle}
            iconType={chartConfig.legend.iconType}
            iconSize={chartConfig.legend.iconSize}
            formatter={(value) => (
              <span style={{ color: chartColors.tooltip.text }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="humanReview"
            name="Human Review"
            stroke={chartColors.series[1]}
            strokeWidth={2}
            fill={`url(#${humanReviewGradientId})`}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
          />
          <Area
            type="monotone"
            dataKey="actionRequired"
            name="Action Required"
            stroke={chartColors.series[2]}
            strokeWidth={2}
            fill={`url(#${actionRequiredGradientId})`}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
