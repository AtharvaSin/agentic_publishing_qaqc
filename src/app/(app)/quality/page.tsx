'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LatencyTrendChart } from '@/components/charts';
import { useSnapshots } from '@/hooks';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Readiness scorecard data
const scorecards = [
  {
    id: 'latency',
    title: 'p99 Latency',
    value: '2.8s',
    target: '< 3.0s',
    status: 'healthy' as const,
    trend: 'stable',
  },
  {
    id: 'availability',
    title: 'Availability',
    value: '99.7%',
    target: '> 99.5%',
    status: 'healthy' as const,
    trend: 'up',
  },
  {
    id: 'regressions',
    title: 'Regressions',
    value: '2',
    target: '0',
    status: 'warning' as const,
    trend: 'up',
  },
  {
    id: 'rai',
    title: 'RAI Pass Rate',
    value: '91%',
    target: '> 95%',
    status: 'warning' as const,
    trend: 'down',
  },
];

// RAI failure reasons
const raiFailures = [
  { reason: 'Harmful content generation', count: 12, percentage: 35 },
  { reason: 'Privacy violation potential', count: 8, percentage: 23 },
  { reason: 'Bias detection', count: 6, percentage: 18 },
  { reason: 'Hallucination risk', count: 5, percentage: 15 },
  { reason: 'Security concerns', count: 3, percentage: 9 },
];

// Readiness checklist items
const checklistItems = [
  { id: 'p99', label: 'p99 latency within threshold', status: 'pass' as const },
  { id: 'availability', label: 'Availability above 99.5%', status: 'pass' as const },
  { id: 'regressions', label: 'Zero regressions detected', status: 'fail' as const },
  { id: 'rai', label: 'RAI validation passed', status: 'at-risk' as const },
  { id: 'manifest', label: 'Manifest validation complete', status: 'pass' as const },
  { id: 'security', label: 'Security scan passed', status: 'pass' as const },
];

// Scorecard component
const Scorecard: FC<{
  title: string;
  value: string;
  target: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: string;
}> = ({ title, value, target, status }) => (
  <Card className="tw-relative tw-overflow-hidden">
    <div className="tw-p-4">
      <div className="tw-text-caption tw-text-obsidian-400 tw-mb-2">{title}</div>
      <div className="tw-text-title tw-font-bold tw-text-obsidian-100">{value}</div>
      <div className="tw-text-caption tw-text-obsidian-500 tw-mt-1">Target: {target}</div>
    </div>
    <div
      className={cn(
        'tw-absolute tw-top-4 tw-right-4 tw-w-3 tw-h-3 tw-rounded-full',
        status === 'healthy' && 'tw-bg-status-success',
        status === 'warning' && 'tw-bg-status-medium',
        status === 'critical' && 'tw-bg-status-critical'
      )}
    />
    <div
      className={cn(
        'tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-1',
        status === 'healthy' && 'tw-bg-status-success',
        status === 'warning' && 'tw-bg-status-medium',
        status === 'critical' && 'tw-bg-status-critical'
      )}
    />
  </Card>
);

export default function QualityPage(): React.ReactElement {
  // Calculate date range for last 30 days
  const dateRange = useMemo((): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return {
      startDate: startDate.toISOString().split('T')[0] as string,
      endDate: endDate.toISOString().split('T')[0] as string,
    };
  }, []);

  // Fetch snapshot data for latency chart
  const { data: snapshotsResponse, isLoading } = useSnapshots(dateRange);

  // Transform snapshot data to chart format
  const latencyChartData = useMemo(() => {
    if (!snapshotsResponse?.data) return [];
    return snapshotsResponse.data.map((s) => ({
      date: s.date,
      p50: s.p50Latency,
      p75: s.p75Latency,
      p99: s.p99Latency,
    }));
  }, [snapshotsResponse?.data]);

  return (
    <div className="tw-space-y-6">
      {/* Readiness Scorecards */}
      <section>
        <div className="tw-grid tw-grid-cols-4 tw-gap-4">
          {scorecards.map((card) => (
            <Scorecard key={card.id} {...card} />
          ))}
        </div>
      </section>

      {/* Charts Row */}
      <section className="tw-grid tw-grid-cols-2 tw-gap-6">
        {/* Latency Percentiles Trend */}
        <Card>
          <CardHeader
            title="Latency Percentiles"
            subtitle="p50, p75, p99 over time"
          />
          <CardContent>
            <LatencyTrendChart
              data={latencyChartData}
              isLoading={isLoading}
              threshold={3000}
              height={256}
            />
          </CardContent>
        </Card>

        {/* RAI Failure Reasons */}
        <Card>
          <CardHeader
            title="RAI Failure Reasons"
            subtitle="Distribution of responsible AI validation failures"
          />
          <CardContent>
            <div className="tw-space-y-3">
              {raiFailures.map((item) => (
                <div key={item.reason}>
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                    <span className="tw-text-body tw-text-obsidian-200">{item.reason}</span>
                    <span className="tw-text-body tw-font-medium tw-text-obsidian-100">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="tw-h-4 tw-bg-obsidian-700 tw-rounded-fluent tw-overflow-hidden">
                    <div
                      className="tw-h-full tw-bg-aurora-pink tw-rounded-fluent tw-transition-all tw-duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Readiness Checklist */}
      <section>
        <Card>
          <CardHeader
            title="Readiness Checklist"
            subtitle="Pre-publish validation requirements"
          />
          <CardContent>
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'tw-flex tw-items-center tw-gap-3 tw-p-3 tw-rounded-fluent tw-border',
                    item.status === 'pass' && 'tw-border-status-success/30 tw-bg-status-success/5',
                    item.status === 'fail' && 'tw-border-status-critical/30 tw-bg-status-critical/5',
                    item.status === 'at-risk' && 'tw-border-status-medium/30 tw-bg-status-medium/5'
                  )}
                >
                  {item.status === 'pass' && (
                    <CheckCircle className="tw-w-5 tw-h-5 tw-text-status-success tw-flex-shrink-0" />
                  )}
                  {item.status === 'fail' && (
                    <XCircle className="tw-w-5 tw-h-5 tw-text-status-critical tw-flex-shrink-0" />
                  )}
                  {item.status === 'at-risk' && (
                    <AlertTriangle className="tw-w-5 tw-h-5 tw-text-status-medium tw-flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'tw-text-body',
                      item.status === 'pass' && 'tw-text-obsidian-200',
                      item.status === 'fail' && 'tw-text-status-critical',
                      item.status === 'at-risk' && 'tw-text-status-medium'
                    )}
                  >
                    {item.label}
                  </span>
                  <Badge
                    variant={
                      item.status === 'pass'
                        ? 'success'
                        : item.status === 'fail'
                          ? 'error'
                          : 'warning'
                    }
                    size="sm"
                    className="tw-ml-auto"
                  >
                    {item.status === 'pass' ? 'Pass' : item.status === 'fail' ? 'Fail' : 'At Risk'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
