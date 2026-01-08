'use client';

import { FC } from 'react';
import {
  LineChart,
  Line,
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
  lineConfig,
} from '@/lib/chartTheme';

/**
 * Data point for submissions trend chart
 */
export interface SubmissionsTrendDataPoint {
  /** Date string (e.g., "2024-01-15" or "Jan 15") */
  date: string;
  /** Number of submissions */
  submissions: number;
  /** Number of approvals */
  approvals: number;
}

export interface SubmissionsTrendChartProps {
  /** Array of data points for the chart */
  data: SubmissionsTrendDataPoint[];
  /** Whether the chart is in loading state */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional chart height (default: 300) */
  height?: number;
}

/**
 * Custom tooltip component for the submissions trend chart
 */
const CustomTooltip: FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

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
        <Skeleton variant="text" className="tw-w-20 tw-h-3" />
        <Skeleton variant="text" className="tw-w-20 tw-h-3" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={height - 40} className="tw-w-full" />
  </div>
);

/**
 * SubmissionsTrendChart - Line chart showing submissions vs approvals over time
 *
 * Displays two lines:
 * - Submissions (aurora-cyan): Total submissions per time period
 * - Approvals (aurora-purple): Total approvals per time period
 *
 * @example
 * ```tsx
 * <SubmissionsTrendChart
 *   data={[
 *     { date: 'Jan 1', submissions: 45, approvals: 38 },
 *     { date: 'Jan 2', submissions: 52, approvals: 45 },
 *   ]}
 * />
 * ```
 */
export const SubmissionsTrendChart: FC<SubmissionsTrendChartProps> = ({
  data,
  isLoading = false,
  className,
  height = responsiveContainer.height,
}) => {
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
        No data available
      </div>
    );
  }

  return (
    <div className={cn('tw-w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
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
          <Line
            type="monotone"
            dataKey="submissions"
            name="Submissions"
            stroke={chartColors.series[0]}
            strokeWidth={lineConfig.strokeWidth}
            dot={{
              fill: chartColors.series[0],
              strokeWidth: lineConfig.dot.strokeWidth,
              r: lineConfig.dot.r,
            }}
            activeDot={{
              fill: chartColors.series[0],
              strokeWidth: lineConfig.activeDot.strokeWidth,
              r: lineConfig.activeDot.r,
            }}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
          />
          <Line
            type="monotone"
            dataKey="approvals"
            name="Approvals"
            stroke={chartColors.series[1]}
            strokeWidth={lineConfig.strokeWidth}
            dot={{
              fill: chartColors.series[1],
              strokeWidth: lineConfig.dot.strokeWidth,
              r: lineConfig.dot.r,
            }}
            activeDot={{
              fill: chartColors.series[1],
              strokeWidth: lineConfig.activeDot.strokeWidth,
              r: lineConfig.activeDot.r,
            }}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
