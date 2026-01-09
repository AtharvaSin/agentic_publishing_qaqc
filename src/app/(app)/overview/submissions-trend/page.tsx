'use client';

import { FC, useMemo, useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { SubmissionsTrendChart } from '@/components/charts';
import { KPIInsightCard } from '@/components/features/overview';
import { useSnapshots } from '@/hooks';
import { cn, formatDate, formatPercent } from '@/lib/utils';
import { generateInsight, determineTrend, calculateTrendPercent } from '@/lib/insights';

// Date range options
const dateRangeOptions: SelectOption[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
];

// Mini KPI Tile for summary metrics
interface MiniKPIProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  highlight?: boolean;
}

const MiniKPI: FC<MiniKPIProps> = ({ label, value, trend, trendValue, highlight }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'tw-bg-obsidian-700/50 tw-rounded-fluent-lg tw-p-4',
        highlight && 'tw-ring-2 tw-ring-aurora-cyan/30'
      )}
    >
      <div className="tw-text-caption tw-text-obsidian-400 tw-mb-1">{label}</div>
      <div className="tw-text-subtitle tw-font-bold tw-text-obsidian-100">{value}</div>
      {trend && trendValue && (
        <div
          className={cn(
            'tw-flex tw-items-center tw-gap-1 tw-mt-1 tw-text-caption',
            trend === 'up' && 'tw-text-status-success',
            trend === 'down' && 'tw-text-status-critical',
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

export default function SubmissionsTrendPage(): React.ReactElement {
  const router = useRouter();
  const [dateRangeDays, setDateRangeDays] = useState('30');

  const handleDateRangeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setDateRangeDays(e.target.value);
  }, []);

  // Get snapshot data for the selected period
  const dateRange = useMemo(() => getDateRange(parseInt(dateRangeDays)), [dateRangeDays]);
  const { data: snapshotsResponse, isLoading, isError } = useSnapshots(dateRange);

  // Transform and calculate metrics
  const { chartData, summaryMetrics, dailyBreakdown, insight } = useMemo(() => {
    if (!snapshotsResponse?.data || snapshotsResponse.data.length === 0) {
      return { chartData: [], summaryMetrics: null, dailyBreakdown: [], insight: null };
    }

    const snapshots = snapshotsResponse.data;
    const midpoint = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, midpoint);
    const secondHalf = snapshots.slice(midpoint);

    // Calculate totals
    const totalSubmissions = snapshots.reduce((sum, s) => sum + s.submissions, 0);
    const totalApprovals = snapshots.reduce((sum, s) => sum + s.approvals, 0);
    const totalRejections = snapshots.reduce((sum, s) => sum + s.rejections, 0);
    const approvalRate = totalSubmissions > 0 ? (totalApprovals / totalSubmissions) * 100 : 0;

    // Calculate trend
    const firstHalfSubmissions = firstHalf.reduce((sum, s) => sum + s.submissions, 0);
    const secondHalfSubmissions = secondHalf.reduce((sum, s) => sum + s.submissions, 0);
    const trend = determineTrend(secondHalfSubmissions, firstHalfSubmissions);
    const trendPercent = calculateTrendPercent(secondHalfSubmissions, firstHalfSubmissions);

    // Chart data
    const chartData = snapshots.map((snapshot) => ({
      date: new Date(snapshot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      submissions: snapshot.submissions,
      approvals: snapshot.approvals,
    }));

    // Daily breakdown (most recent first)
    const dailyBreakdown = [...snapshots]
      .reverse()
      .slice(0, 10)
      .map((snapshot) => ({
        date: formatDate(snapshot.date, 'MMM d, yyyy'),
        submissions: snapshot.submissions,
        approvals: snapshot.approvals,
        rejections: snapshot.rejections,
        pending: Math.max(0, snapshot.submissions - snapshot.approvals - snapshot.rejections),
        approvalRate: snapshot.submissions > 0 ? (snapshot.approvals / snapshot.submissions) * 100 : 0,
      }));

    // Generate insight
    const insight = generateInsight({
      metricType: 'approval_rate',
      currentValue: approvalRate,
      previousValue: firstHalfSubmissions > 0 ? (firstHalf.reduce((sum, s) => sum + s.approvals, 0) / firstHalfSubmissions) * 100 : 0,
      trend,
      trendPercent,
      additionalData: {
        affectedPublishers: 4,
      },
    });

    return {
      chartData,
      summaryMetrics: {
        totalSubmissions,
        totalApprovals,
        totalRejections,
        approvalRate,
        trend,
        trendPercent,
      },
      dailyBreakdown,
      insight,
    };
  }, [snapshotsResponse?.data]);

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
              Submissions vs Approvals Analysis
            </h1>
            <p className="tw-text-caption tw-text-obsidian-400">
              Detailed analysis of submission and approval patterns
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
          <Button variant="secondary" leftIcon={<Download className="tw-w-4 tw-h-4" />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      {summaryMetrics && (
        <div className="tw-grid tw-grid-cols-4 tw-gap-4">
          <MiniKPI
            label="Total Submissions"
            value={summaryMetrics.totalSubmissions}
            trend={summaryMetrics.trend}
            trendValue={`${formatPercent(summaryMetrics.trendPercent, 0)} vs prior period`}
          />
          <MiniKPI label="Total Approvals" value={summaryMetrics.totalApprovals} />
          <MiniKPI label="Total Rejections" value={summaryMetrics.totalRejections} />
          <MiniKPI
            label="Approval Rate"
            value={formatPercent(summaryMetrics.approvalRate, 0)}
            highlight
          />
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader
          title="Submissions Trend"
          subtitle="Click on data points to view details for that day"
        />
        <CardContent>
          {isError ? (
            <div className="tw-h-80 tw-flex tw-items-center tw-justify-center tw-text-status-critical">
              Failed to load chart data
            </div>
          ) : (
            <SubmissionsTrendChart data={chartData} isLoading={isLoading} height={320} />
          )}
        </CardContent>
      </Card>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader title="Daily Breakdown" subtitle="Most recent 10 days" />
        <CardContent>
          <div className="tw-overflow-x-auto">
            <table className="tw-w-full tw-text-body">
              <thead>
                <tr className="tw-border-b tw-border-obsidian-700">
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Date
                  </th>
                  <th className="tw-text-right tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Submissions
                  </th>
                  <th className="tw-text-right tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Approvals
                  </th>
                  <th className="tw-text-right tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Rejections
                  </th>
                  <th className="tw-text-right tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Pending
                  </th>
                  <th className="tw-text-right tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Approval Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyBreakdown.map((day, index) => (
                  <tr
                    key={index}
                    className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-transition-colors"
                  >
                    <td className="tw-px-4 tw-py-3 tw-text-obsidian-100 tw-font-medium">
                      {day.date}
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-right tw-text-obsidian-200">
                      {day.submissions}
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-right tw-text-status-success">
                      {day.approvals}
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-right tw-text-status-critical">
                      {day.rejections}
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-right tw-text-obsidian-400">
                      {day.pending}
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-right">
                      <Badge
                        variant={day.approvalRate >= 80 ? 'success' : day.approvalRate >= 60 ? 'warning' : 'error'}
                        size="sm"
                      >
                        {formatPercent(day.approvalRate, 0)}
                      </Badge>
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
