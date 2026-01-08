/**
 * Centralized chart theming for Recharts
 * Follows Obsidian Aurora design system
 */

// Color palette for charts
export const chartColors = {
  // Primary series colors
  series: [
    '#00D4FF', // aurora-cyan
    '#8B5CF6', // aurora-purple
    '#EC4899', // aurora-pink
    '#3B82F6', // aurora-blue
    '#14B8A6', // aurora-teal
    '#F59E0B', // status-medium
    '#10B981', // status-success
    '#EF4444', // status-critical
  ],

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Chart-specific
  grid: '#374151', // obsidian-600
  axis: '#6B7280', // obsidian-400
  tooltip: {
    background: '#1A1F2E', // obsidian-800
    border: '#252A3B', // obsidian-700
    text: '#F3F4F6', // obsidian-100
  },
  reference: {
    line: '#6B7280', // obsidian-400
    area: 'rgba(0, 212, 255, 0.1)', // aurora-cyan with opacity
  },
} as const;

// Common chart styling configurations
export const chartConfig = {
  // Grid styling
  grid: {
    strokeDasharray: '3 3',
    stroke: chartColors.grid,
    strokeOpacity: 0.5,
  },

  // Axis styling
  xAxis: {
    axisLine: { stroke: chartColors.axis },
    tickLine: { stroke: chartColors.axis },
    tick: { fill: chartColors.axis, fontSize: 12 },
  },

  yAxis: {
    axisLine: { stroke: chartColors.axis },
    tickLine: { stroke: chartColors.axis },
    tick: { fill: chartColors.axis, fontSize: 12 },
  },

  // Legend styling
  legend: {
    wrapperStyle: {
      paddingTop: '20px',
    },
    iconType: 'circle' as const,
    iconSize: 8,
  },

  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: chartColors.tooltip.background,
      border: `1px solid ${chartColors.tooltip.border}`,
      borderRadius: '8px',
      color: chartColors.tooltip.text,
      fontSize: '12px',
      padding: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: {
      color: chartColors.tooltip.text,
      fontWeight: 600,
      marginBottom: '4px',
    },
    itemStyle: {
      color: chartColors.tooltip.text,
      padding: '2px 0',
    },
    cursor: {
      stroke: chartColors.series[0],
      strokeWidth: 1,
      strokeDasharray: '5 5',
    },
  },

  // Reference line styling
  referenceLine: {
    stroke: chartColors.reference.line,
    strokeDasharray: '5 5',
    strokeWidth: 1,
  },

  // Area chart fill gradient
  areaGradient: {
    startOpacity: 0.3,
    endOpacity: 0.05,
  },
} as const;

// Get color for a series by index
export function getSeriesColor(index: number): string {
  return chartColors.series[index % chartColors.series.length] ?? chartColors.series[0] ?? '#00D4FF';
}

// Get gradient ID for area charts
export function getGradientId(key: string): string {
  return `gradient-${key}`;
}

// Common animation settings
export const chartAnimation = {
  duration: 500,
  easing: 'ease-out' as const,
};

// Responsive container defaults
export const responsiveContainer = {
  width: '100%',
  height: 300,
  minHeight: 200,
};

// Bar chart specific config
export const barConfig = {
  barSize: 20,
  barGap: 4,
  radius: [4, 4, 0, 0] as [number, number, number, number],
};

// Line chart specific config
export const lineConfig = {
  strokeWidth: 2,
  dot: {
    r: 4,
    strokeWidth: 2,
  },
  activeDot: {
    r: 6,
    strokeWidth: 2,
  },
};

// Pie chart specific config
export const pieConfig = {
  innerRadius: '60%',
  outerRadius: '80%',
  paddingAngle: 2,
  labelLine: false,
};
