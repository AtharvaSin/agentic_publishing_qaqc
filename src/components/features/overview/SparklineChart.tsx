'use client';

import { FC, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { chartColors } from '@/lib/chartTheme';
import { cn } from '@/lib/utils';

export interface SparklineDataPoint {
  value: number;
  label?: string;
}

export interface SparklineChartProps {
  data: SparklineDataPoint[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
  className?: string;
}

export const SparklineChart: FC<SparklineChartProps> = ({
  data,
  color = chartColors.series[0],
  height = 40,
  showTooltip = true,
  className,
}) => {
  // Add index to data for x-axis
  const chartData = useMemo(
    () => data.map((point, index) => ({ ...point, index })),
    [data]
  );

  if (data.length === 0) {
    return (
      <div
        className={cn('tw-flex tw-items-center tw-justify-center tw-text-obsidian-500', className)}
        style={{ height }}
      >
        No data
      </div>
    );
  }

  return (
    <div className={cn('tw-w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0]?.payload as SparklineDataPoint & { index: number };
                  return (
                    <div className="tw-bg-obsidian-800 tw-border tw-border-obsidian-700 tw-rounded-fluent tw-px-2 tw-py-1 tw-text-caption">
                      {dataPoint.label && (
                        <div className="tw-text-obsidian-400">{dataPoint.label}</div>
                      )}
                      <div className="tw-font-medium" style={{ color }}>
                        {dataPoint.value}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              strokeWidth: 0,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
