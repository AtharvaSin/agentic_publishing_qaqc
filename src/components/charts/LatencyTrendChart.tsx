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
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { cn, formatLatency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  chartColors,
  chartConfig,
  chartAnimation,
  responsiveContainer,
  lineConfig,
} from '@/lib/chartTheme';

/**
 * Data point for latency trend chart
 */
export interface LatencyTrendDataPoint {
  /** Date or time string (e.g., "2024-01-15" or "14:00") */
  date: string;
  /** 50th percentile latency in milliseconds */
  p50: number;
  /** 75th percentile latency in milliseconds */
  p75: number;
  /** 99th percentile latency in milliseconds */
  p99: number;
}

export interface LatencyTrendChartProps {
  /** Array of data points for the chart */
  data: LatencyTrendDataPoint[];
  /** Whether the chart is in loading state */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional chart height (default: 300) */
  height?: number;
  /** Latency threshold in milliseconds for reference line (default: 3000) */
  threshold?: number;
  /** Label for the threshold line (default: "SLA Threshold") */
  thresholdLabel?: string;
}

// Colors for each percentile line
const percentileColors = {
  p50: chartColors.series[0] ?? '#00D4FF', // aurora-cyan
  p75: chartColors.series[1] ?? '#8B5CF6', // aurora-purple
  p99: chartColors.series[2] ?? '#EC4899', // aurora-pink
};

/**
 * Custom tooltip component for the latency trend chart
 */
const CustomTooltip: FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  threshold?: number;
}> = ({ active, payload, label, threshold = 3000 }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Check if any value exceeds threshold
  const hasBreached = payload.some((entry) => entry.value > threshold);

  return (
    <div
      className="tw-rounded-fluent tw-px-3 tw-py-2"
      style={{
        backgroundColor: chartColors.tooltip.background,
        border: `1px solid ${hasBreached ? chartColors.error : chartColors.tooltip.border}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      }}
    >
      <p
        className="tw-text-sm tw-font-semibold tw-mb-2"
        style={{ color: chartColors.tooltip.text }}
      >
        {label}
      </p>
      {payload.map((entry, index) => {
        const isBreached = entry.value > threshold;
        return (
          <p
            key={index}
            className="tw-text-xs tw-flex tw-items-center tw-gap-2"
            style={{ color: isBreached ? chartColors.error : entry.color }}
          >
            <span
              className="tw-w-2 tw-h-2 tw-rounded-full tw-inline-block"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}:{' '}
            <span className="tw-font-medium">
              {formatLatency(entry.value)}
              {isBreached && (
                <span className="tw-ml-1 tw-text-[10px]" style={{ color: chartColors.error }}>
                  (exceeds SLA)
                </span>
              )}
            </span>
          </p>
        );
      })}
      {hasBreached && (
        <p
          className="tw-text-xs tw-mt-2 tw-pt-2 tw-border-t"
          style={{
            color: chartColors.error,
            borderColor: chartColors.tooltip.border,
          }}
        >
          SLA Threshold: {formatLatency(threshold)}
        </p>
      )}
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
        <Skeleton variant="text" className="tw-w-16 tw-h-3" />
        <Skeleton variant="text" className="tw-w-16 tw-h-3" />
        <Skeleton variant="text" className="tw-w-16 tw-h-3" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={height - 40} className="tw-w-full" />
  </div>
);

/**
 * Custom Y-axis tick formatter for latency values
 */
const formatYAxisTick = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}s`;
  }
  return `${value}ms`;
};

/**
 * LatencyTrendChart - Multi-line chart for latency percentiles
 *
 * Displays three percentile lines (p50, p75, p99) with a reference line
 * at the SLA threshold (default: 3000ms).
 *
 * Colors:
 * - p50: aurora-cyan (best case)
 * - p75: aurora-purple (typical)
 * - p99: aurora-pink (worst case)
 *
 * @example
 * ```tsx
 * <LatencyTrendChart
 *   data={[
 *     { date: '14:00', p50: 250, p75: 450, p99: 1200 },
 *     { date: '14:15', p50: 280, p75: 520, p99: 2800 },
 *   ]}
 *   threshold={3000}
 * />
 * ```
 */
export const LatencyTrendChart: FC<LatencyTrendChartProps> = ({
  data,
  isLoading = false,
  className,
  height = responsiveContainer.height,
  threshold = 3000,
  thresholdLabel = 'SLA Threshold',
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
        No latency data available
      </div>
    );
  }

  // Calculate max value for Y axis, ensuring threshold is visible
  const maxDataValue = Math.max(
    ...data.map((d) => Math.max(d.p50, d.p75, d.p99))
  );
  const yAxisMax = Math.max(maxDataValue * 1.1, threshold * 1.2);

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
            tickFormatter={formatYAxisTick}
            domain={[0, yAxisMax]}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip threshold={threshold} />} />
          <Legend
            wrapperStyle={chartConfig.legend.wrapperStyle}
            iconType={chartConfig.legend.iconType}
            iconSize={chartConfig.legend.iconSize}
            formatter={(value) => (
              <span style={{ color: chartColors.tooltip.text }}>{value}</span>
            )}
          />
          {/* SLA Threshold Reference Line */}
          <ReferenceLine
            y={threshold}
            stroke={chartColors.error}
            strokeDasharray={chartConfig.referenceLine.strokeDasharray}
            strokeWidth={chartConfig.referenceLine.strokeWidth}
            label={{
              value: thresholdLabel,
              position: 'right',
              fill: chartColors.error,
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          {/* P50 Line - Best case latency */}
          <Line
            type="monotone"
            dataKey="p50"
            name="p50 (Median)"
            stroke={percentileColors.p50}
            strokeWidth={lineConfig.strokeWidth}
            dot={{
              fill: percentileColors.p50,
              strokeWidth: lineConfig.dot.strokeWidth,
              r: lineConfig.dot.r,
            }}
            activeDot={{
              fill: percentileColors.p50,
              strokeWidth: lineConfig.activeDot.strokeWidth,
              r: lineConfig.activeDot.r,
            }}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
          />
          {/* P75 Line - Typical latency */}
          <Line
            type="monotone"
            dataKey="p75"
            name="p75"
            stroke={percentileColors.p75}
            strokeWidth={lineConfig.strokeWidth}
            dot={{
              fill: percentileColors.p75,
              strokeWidth: lineConfig.dot.strokeWidth,
              r: lineConfig.dot.r,
            }}
            activeDot={{
              fill: percentileColors.p75,
              strokeWidth: lineConfig.activeDot.strokeWidth,
              r: lineConfig.activeDot.r,
            }}
            animationDuration={chartAnimation.duration}
            animationEasing={chartAnimation.easing}
          />
          {/* P99 Line - Worst case latency */}
          <Line
            type="monotone"
            dataKey="p99"
            name="p99 (Tail)"
            stroke={percentileColors.p99}
            strokeWidth={lineConfig.strokeWidth}
            dot={{
              fill: percentileColors.p99,
              strokeWidth: lineConfig.dot.strokeWidth,
              r: lineConfig.dot.r,
            }}
            activeDot={{
              fill: percentileColors.p99,
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
