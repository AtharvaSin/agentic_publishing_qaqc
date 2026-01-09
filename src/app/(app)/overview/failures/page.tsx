'use client';

import { FC, useMemo, useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { FailureCategoriesChart } from '@/components/charts';
import { KPIInsightCard } from '@/components/features/overview';
import { useSnapshots } from '@/hooks';
import { cn, formatDate, formatPercent } from '@/lib/utils';
import { generateInsight, determineTrend, calculateTrendPercent } from '@/lib/insights';
import { FAILURE_CATEGORY_LABELS, FailureCategory } from '@/lib/constants';

// Date range options
const dateRangeOptions: SelectOption[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
];

// Severity filter options
const severityOptions: SelectOption[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'must_fix', label: 'Must Fix' },
  { value: 'should_fix', label: 'Should Fix' },
  { value: 'recommendation', label: 'Recommendation' },
];

// Mini KPI Tile
interface MiniKPIProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  highlight?: boolean;
  variant?: 'default' | 'warning' | 'critical';
}

const MiniKPI: FC<MiniKPIProps> = ({ label, value, trend, trendValue, highlight, variant = 'default' }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'tw-bg-obsidian-700/50 tw-rounded-fluent-lg tw-p-4',
        highlight && 'tw-ring-2 tw-ring-aurora-cyan/30',
        variant === 'warning' && 'tw-border tw-border-status-medium/30',
        variant === 'critical' && 'tw-border tw-border-status-critical/30'
      )}
    >
      <div className="tw-text-caption tw-text-obsidian-400 tw-mb-1">{label}</div>
      <div
        className={cn(
          'tw-text-subtitle tw-font-bold',
          variant === 'default' && 'tw-text-obsidian-100',
          variant === 'warning' && 'tw-text-status-medium',
          variant === 'critical' && 'tw-text-status-critical'
        )}
      >
        {value}
      </div>
      {trend && trendValue && (
        <div
          className={cn(
            'tw-flex tw-items-center tw-gap-1 tw-mt-1 tw-text-caption',
            trend === 'up' && 'tw-text-status-critical',
            trend === 'down' && 'tw-text-status-success',
            trend === 'stable' && 'tw-text-obsidian-400'
          )}
        >
          <TrendIcon className="tw-w-3 tw-h-3" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Get date range for the last N days
 */
function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0] as string,
    endDate: endDate.toISOString().split('T')[0] as string,
  };
}

// Mock failed agents data (would come from API in real implementation)
const mockFailedAgents = [
  { id: 'agt_001', name: 'HR Helper Bot', publisher: 'Fabrikam Inc', category: 'rai_violation', submitted: '2026-01-05', daysAgo: 4 },
  { id: 'agt_002', name: 'Data Insights', publisher: 'Northwind', category: 'metadata_issues', submitted: '2026-01-06', daysAgo: 3 },
  { id: 'agt_003', name: 'Sales Bot', publisher: 'Contoso Ltd', category: 'manifest_mismatch', submitted: '2026-01-07', daysAgo: 2 },
  { id: 'agt_004', name: 'Support AI', publisher: 'Adventure Works', category: 'policy_violation', submitted: '2026-01-07', daysAgo: 2 },
  { id: 'agt_005', name: 'Inventory Manager', publisher: 'Contoso Ltd', category: 'security_concerns', submitted: '2026-01-08', daysAgo: 1 },
];

export default function FailureCategoriesPage(): React.ReactElement {
  const router = useRouter();
  const [dateRangeDays, setDateRangeDays] = useState('30');
  const [severity, setSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleDateRangeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setDateRangeDays(e.target.value);
  }, []);

  const handleSeverityChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSeverity(e.target.value);
  }, []);

  // Get snapshot data
  const dateRange = useMemo(() => getDateRange(parseInt(dateRangeDays)), [dateRangeDays]);
  const { data: snapshotsResponse, isLoading, isError } = useSnapshots(dateRange);

  // Calculate metrics and chart data
  const { chartData, summaryMetrics, categoryBreakdown, insight } = useMemo(() => {
    if (!snapshotsResponse?.data || snapshotsResponse.data.length === 0) {
      return { chartData: [], summaryMetrics: null, categoryBreakdown: [], insight: null };
    }

    const snapshots = snapshotsResponse.data;
    const midpoint = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, midpoint);
    const secondHalf = snapshots.slice(midpoint);

    // Aggregate failure categories
    const aggregated: Record<string, number> = {};
    const firstHalfAggregated: Record<string, number> = {};
    const secondHalfAggregated: Record<string, number> = {};

    snapshots.forEach((s) => {
      Object.entries(s.failureCategories).forEach(([cat, count]) => {
        aggregated[cat] = (aggregated[cat] ?? 0) + count;
      });
    });

    firstHalf.forEach((s) => {
      Object.entries(s.failureCategories).forEach(([cat, count]) => {
        firstHalfAggregated[cat] = (firstHalfAggregated[cat] ?? 0) + count;
      });
    });

    secondHalf.forEach((s) => {
      Object.entries(s.failureCategories).forEach(([cat, count]) => {
        secondHalfAggregated[cat] = (secondHalfAggregated[cat] ?? 0) + count;
      });
    });

    // Calculate totals
    const totalFailures = Object.values(aggregated).reduce((sum, count) => sum + count, 0);
    const firstHalfTotal = Object.values(firstHalfAggregated).reduce((sum, count) => sum + count, 0);
    const secondHalfTotal = Object.values(secondHalfAggregated).reduce((sum, count) => sum + count, 0);

    // Must-fix estimate (60% of total)
    const mustFixCount = Math.round(totalFailures * 0.6);

    // Trend
    const trend = determineTrend(secondHalfTotal, firstHalfTotal);
    const trendPercent = calculateTrendPercent(secondHalfTotal, firstHalfTotal);

    // Chart data
    const chartData = Object.entries(aggregated)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category: FAILURE_CATEGORY_LABELS[category as FailureCategory] ?? category,
        count,
      }));

    // Category breakdown with trends
    const categoryBreakdown = Object.entries(aggregated)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => {
        const firstCount = firstHalfAggregated[category] ?? 0;
        const secondCount = secondHalfAggregated[category] ?? 0;
        const catTrend = determineTrend(secondCount, firstCount);

        return {
          category,
          label: FAILURE_CATEGORY_LABELS[category as FailureCategory] ?? category,
          count,
          percentage: totalFailures > 0 ? (count / totalFailures) * 100 : 0,
          trend: catTrend,
          trendPercent: calculateTrendPercent(secondCount, firstCount),
        };
      });

    // Generate insight
    const topFailure = categoryBreakdown[0];
    const insight = generateInsight({
      metricType: 'approval_rate',
      currentValue: 68,
      previousValue: 73,
      trend,
      trendPercent,
      contributingFactors: topFailure
        ? [{ name: topFailure.label, value: topFailure.count, impact: 'negative' as const }]
        : [],
      additionalData: {
        affectedPublishers: 4,
      },
    });

    return {
      chartData,
      summaryMetrics: {
        totalFailures,
        mustFixCount,
        avgTimeToFix: 2.3,
        trend,
        trendPercent,
      },
      categoryBreakdown,
      insight,
    };
  }, [snapshotsResponse?.data]);

  // Filter agents by selected category
  const filteredAgents = useMemo(() => {
    if (!selectedCategory) return mockFailedAgents;
    return mockFailedAgents.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="tw-space-y-6">
      {/* Header */}
      <div className="tw-flex tw-items-center tw-justify-between">
        <div className="tw-flex tw-items-center tw-gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/overview')}
            aria-label="Back to Overview"
          >
            <ArrowLeft className="tw-w-5 tw-h-5" />
          </Button>
          <div>
            <h1 className="tw-text-subtitle tw-font-semibold tw-text-obsidian-100">
              Failure Category Analysis
            </h1>
            <p className="tw-text-caption tw-text-obsidian-400">
              Deep-dive into validation failure patterns for root cause analysis
            </p>
          </div>
        </div>
        <div className="tw-flex tw-items-center tw-gap-3">
          <Select
            options={dateRangeOptions}
            value={dateRangeDays}
            onChange={handleDateRangeChange}
            placeholder="Select period"
          />
          <Select
            options={severityOptions}
            value={severity}
            onChange={handleSeverityChange}
            placeholder="All severities"
          />
          <Button variant="secondary" leftIcon={<Download className="tw-w-4 tw-h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      {summaryMetrics && (
        <div className="tw-grid tw-grid-cols-3 tw-gap-4">
          <MiniKPI
            label="Total Failures"
            value={summaryMetrics.totalFailures}
            trend={summaryMetrics.trend}
            trendValue={`${formatPercent(summaryMetrics.trendPercent, 0)} vs prior period`}
            variant={summaryMetrics.trend === 'up' ? 'critical' : 'default'}
          />
          <MiniKPI
            label="Must-Fix Issues"
            value={`${summaryMetrics.mustFixCount} (60%)`}
            variant="warning"
          />
          <MiniKPI
            label="Avg Time to Fix"
            value={`${summaryMetrics.avgTimeToFix} days`}
            highlight
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="tw-grid tw-grid-cols-2 tw-gap-6">
        {/* Failure Categories Bar Chart */}
        <Card>
          <CardHeader
            title="Failures by Category"
            subtitle="Click on a bar to filter the table below"
          />
          <CardContent>
            {isError ? (
              <div className="tw-h-72 tw-flex tw-items-center tw-justify-center tw-text-status-critical">
                Failed to load chart data
              </div>
            ) : (
              <FailureCategoriesChart data={chartData} isLoading={isLoading} height={288} topN={8} />
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader
            title="Category Trends"
            subtitle="Change compared to prior period"
            action={
              selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  leftIcon={<Filter className="tw-w-3 tw-h-3" />}
                >
                  Clear filter
                </Button>
              )
            }
          />
          <CardContent>
            <div className="tw-space-y-2 tw-max-h-72 tw-overflow-y-auto">
              {categoryBreakdown.map((cat) => {
                const TrendIcon = cat.trend === 'up' ? TrendingUp : cat.trend === 'down' ? TrendingDown : Minus;

                return (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category === selectedCategory ? null : cat.category)}
                    className={cn(
                      'tw-w-full tw-flex tw-items-center tw-justify-between tw-py-2 tw-px-3',
                      'tw-rounded-fluent tw-transition-colors tw-text-left',
                      cat.category === selectedCategory
                        ? 'tw-bg-aurora-cyan/20 tw-ring-1 tw-ring-aurora-cyan'
                        : 'hover:tw-bg-obsidian-700/50'
                    )}
                  >
                    <div className="tw-flex-1">
                      <span className="tw-text-body tw-text-obsidian-200">{cat.label}</span>
                      <div className="tw-text-caption tw-text-obsidian-500">
                        {formatPercent(cat.percentage, 0)} of total
                      </div>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <span className="tw-text-body tw-font-medium tw-text-obsidian-100">{cat.count}</span>
                      <span
                        className={cn(
                          'tw-flex tw-items-center tw-gap-1 tw-text-caption',
                          cat.trend === 'up' && 'tw-text-status-critical',
                          cat.trend === 'down' && 'tw-text-status-success',
                          cat.trend === 'stable' && 'tw-text-obsidian-400'
                        )}
                      >
                        <TrendIcon className="tw-w-3 tw-h-3" />
                        {cat.trendPercent > 0 && formatPercent(cat.trendPercent, 0)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failed Agents Table */}
      <Card>
        <CardHeader
          title={selectedCategory ? `Agents with ${FAILURE_CATEGORY_LABELS[selectedCategory as FailureCategory] ?? selectedCategory}` : 'Agents with Failures'}
          subtitle={`${filteredAgents.length} agents requiring attention`}
        />
        <CardContent>
          <div className="tw-overflow-x-auto">
            <table className="tw-w-full tw-text-body">
              <thead>
                <tr className="tw-border-b tw-border-obsidian-700">
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Agent
                  </th>
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Publisher
                  </th>
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Category
                  </th>
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Submitted
                  </th>
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Days
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => router.push(`/agents/${agent.id}`)}
                    className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-cursor-pointer tw-transition-colors"
                  >
                    <td className="tw-px-4 tw-py-3">
                      <span className="tw-text-obsidian-100 tw-font-medium">{agent.name}</span>
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">{agent.publisher}</td>
                    <td className="tw-px-4 tw-py-3">
                      <Badge variant="error" size="sm">
                        {FAILURE_CATEGORY_LABELS[agent.category as FailureCategory] ?? agent.category}
                      </Badge>
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">
                      {formatDate(agent.submitted, 'MMM d')}
                    </td>
                    <td className="tw-px-4 tw-py-3">
                      <span
                        className={cn(
                          'tw-font-medium',
                          agent.daysAgo > 3 ? 'tw-text-status-critical' : 'tw-text-obsidian-200'
                        )}
                      >
                        {agent.daysAgo}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      {insight && (
        <Card>
          <CardHeader title="AI Insight" />
          <CardContent>
            <KPIInsightCard insight={insight} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
