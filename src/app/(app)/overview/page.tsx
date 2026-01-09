'use client';

import type { FC } from 'react';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SubmissionsTrendChart, FailureCategoriesChart } from '@/components/charts';
import type { FailureCategoryDataPoint } from '@/components/charts';
import { KPIDetailModal } from '@/components/features/overview';
import { useSnapshots, useKPIDetailData } from '@/hooks';
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle, AlertTriangle, Shield, Activity, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAILURE_CATEGORY_LABELS, FailureCategory } from '@/lib/constants';
import { useDateRange } from '@/contexts/FilterContext';

// KPI data with identifiers for drilldown
const kpiData = [
  {
    id: 'time-to-publish',
    title: 'Time to Publish',
    value: '4.2',
    unit: 'days',
    subValue: 'p50',
    delta: { value: 12, direction: 'down' as const },
    status: 'healthy' as const,
    icon: Clock,
  },
  {
    id: 'approval-rate',
    title: 'First-Pass Approval',
    value: '68',
    unit: '%',
    delta: { value: 5, direction: 'up' as const },
    status: 'healthy' as const,
    icon: CheckCircle,
  },
  {
    id: 'sla-compliance',
    title: 'SLA Compliance',
    value: '82',
    unit: '%',
    delta: { value: 8, direction: 'down' as const },
    status: 'warning' as const,
    icon: AlertTriangle,
  },
  {
    id: 'rai-pass',
    title: 'RAI Pass Rate',
    value: '91',
    unit: '%',
    delta: { value: 3, direction: 'down' as const },
    status: 'warning' as const,
    icon: Shield,
  },
  {
    id: 'incidents',
    title: 'Active Incidents',
    value: '3',
    unit: '',
    delta: { value: 2, direction: 'up' as const },
    status: 'critical' as const,
    icon: Activity,
  },
];

// KPI Tile Component with click handler
interface KPITileProps {
  id: string;
  title: string;
  value: string;
  unit?: string | undefined;
  subValue?: string | undefined;
  delta?: { value: number; direction: 'up' | 'down' | 'neutral' } | undefined;
  status?: 'healthy' | 'warning' | 'critical' | undefined;
  icon?: FC<{ className?: string }> | undefined;
  onClick?: () => void;
}

const KPITile: FC<KPITileProps> = ({ title, value, unit, subValue, delta, status = 'healthy', icon: Icon, onClick }) => {
  const DeltaIcon = delta?.direction === 'up' ? TrendingUp : delta?.direction === 'down' ? TrendingDown : Minus;

  return (
    <Card
      className={cn(
        'tw-relative tw-overflow-hidden tw-cursor-pointer',
        'hover:tw-border-aurora-cyan/50 hover:tw-shadow-fluent-8',
        'tw-transition-all tw-duration-200'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="tw-p-4">
        <div className="tw-flex tw-items-start tw-justify-between tw-mb-3">
          <span className="tw-text-caption tw-text-obsidian-400">{title}</span>
          {Icon && (
            <Icon
              className={cn(
                'tw-w-4 tw-h-4',
                status === 'healthy' && 'tw-text-status-success',
                status === 'warning' && 'tw-text-status-medium',
                status === 'critical' && 'tw-text-status-critical'
              )}
            />
          )}
        </div>
        <div className="tw-flex tw-items-baseline tw-gap-1">
          <span className="tw-text-title tw-font-bold tw-text-obsidian-100">{value}</span>
          {unit && <span className="tw-text-body tw-text-obsidian-400">{unit}</span>}
          {subValue && <span className="tw-text-caption tw-text-obsidian-500 tw-ml-1">({subValue})</span>}
        </div>
        {delta && (
          <div
            className={cn(
              'tw-flex tw-items-center tw-gap-1 tw-mt-2 tw-text-caption tw-font-medium',
              delta.direction === 'up' && status !== 'critical' && 'tw-text-status-success',
              delta.direction === 'down' && status !== 'critical' && 'tw-text-status-critical',
              delta.direction === 'up' && status === 'critical' && 'tw-text-status-critical',
              delta.direction === 'down' && status === 'critical' && 'tw-text-status-success',
              delta.direction === 'neutral' && 'tw-text-obsidian-400'
            )}
          >
            <DeltaIcon className="tw-w-3 tw-h-3" />
            <span>{delta.value}% vs last period</span>
          </div>
        )}
      </div>
      {/* Status indicator bar */}
      <div
        className={cn(
          'tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-1',
          status === 'healthy' && 'tw-bg-status-success',
          status === 'warning' && 'tw-bg-status-medium',
          status === 'critical' && 'tw-bg-status-critical'
        )}
      />
      {/* Click indicator */}
      <div className="tw-absolute tw-top-2 tw-right-2 tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity">
        <ExternalLink className="tw-w-3 tw-h-3 tw-text-obsidian-500" />
      </div>
    </Card>
  );
};

// At-risk agents mock data with proper IDs
const atRiskAgents = [
  { id: 'agt_001', name: 'Sales Assistant Pro', publisher: 'Contoso Ltd', risk: 'SLA Breach', daysInReview: 12, status: 'action_required' },
  { id: 'agt_002', name: 'HR Helper Bot', publisher: 'Fabrikam Inc', risk: 'RAI Failure', daysInReview: 8, status: 'human_review' },
  { id: 'agt_003', name: 'Data Insights Agent', publisher: 'Northwind', risk: 'Latency', daysInReview: 6, status: 'action_required' },
  { id: 'agt_004', name: 'Customer Support AI', publisher: 'Adventure Works', risk: 'Regression', daysInReview: 5, status: 'human_review' },
  { id: 'agt_005', name: 'Inventory Manager', publisher: 'Contoso Ltd', risk: 'SLA Breach', daysInReview: 10, status: 'action_required' },
];

export default function OverviewPage(): React.ReactElement {
  const router = useRouter();

  // Modal state
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  // Get date range from global filter context
  const { startDate, endDate } = useDateRange();

  // Get snapshot data based on filter selection
  const dateRange = useMemo(() => ({
    startDate,
    endDate,
  }), [startDate, endDate]);

  const { data: snapshotsResponse, isLoading, isError } = useSnapshots(dateRange);

  // Get KPI detail data for the selected KPI
  const { data: kpiDetailData } = useKPIDetailData(selectedKPI ?? '');

  // Transform snapshot data for the submissions trend chart
  const submissionsTrendData = useMemo(() => {
    if (!snapshotsResponse?.data) return [];

    return snapshotsResponse.data.map((snapshot) => ({
      date: new Date(snapshot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      submissions: snapshot.submissions,
      approvals: snapshot.approvals,
    }));
  }, [snapshotsResponse?.data]);

  // Aggregate failure categories from snapshot data
  const failureCategoriesData = useMemo((): FailureCategoryDataPoint[] => {
    if (!snapshotsResponse?.data) return [];

    // Aggregate all failure categories across all snapshots
    const aggregated: Record<string, number> = {};

    snapshotsResponse.data.forEach((snapshot) => {
      Object.entries(snapshot.failureCategories).forEach(([category, count]) => {
        aggregated[category] = (aggregated[category] ?? 0) + count;
      });
    });

    // Transform to chart data format with labels
    return Object.entries(aggregated).map(([category, count]) => ({
      category: FAILURE_CATEGORY_LABELS[category as FailureCategory] ?? category,
      count,
    }));
  }, [snapshotsResponse?.data]);

  // Handlers
  const handleKPIClick = useCallback((kpiId: string) => {
    setSelectedKPI(kpiId);
  }, []);

  const handleKPIModalClose = useCallback((open: boolean) => {
    if (!open) {
      setSelectedKPI(null);
    }
  }, []);

  const handleViewSubmissionsTrend = useCallback(() => {
    router.push('/overview/submissions-trend');
  }, [router]);

  const handleViewFailures = useCallback(() => {
    router.push('/overview/failures');
  }, [router]);

  const handleViewAllAtRisk = useCallback(() => {
    router.push('/overview/at-risk');
  }, [router]);

  const handleAgentRowClick = useCallback((agentId: string) => {
    router.push(`/agents/${agentId}`);
  }, [router]);

  return (
    <div className="tw-space-y-6">
      {/* KPI Tiles Strip */}
      <section>
        <div className="tw-grid tw-grid-cols-5 tw-gap-4">
          {kpiData.map((kpi) => (
            <KPITile
              key={kpi.id}
              id={kpi.id}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              subValue={kpi.subValue}
              delta={kpi.delta}
              status={kpi.status}
              icon={kpi.icon}
              onClick={() => handleKPIClick(kpi.id)}
            />
          ))}
        </div>
      </section>

      {/* Charts Row */}
      <section className="tw-grid tw-grid-cols-2 tw-gap-6">
        {/* Submissions vs Approvals Trend */}
        <Card>
          <CardHeader
            title="Submissions vs Approvals"
            subtitle="Daily trend over selected period"
            action={
              <button
                className="tw-text-caption tw-text-aurora-cyan hover:tw-underline focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-ring-offset-2 focus:tw-ring-offset-obsidian-800 tw-rounded"
                onClick={handleViewSubmissionsTrend}
              >
                View details →
              </button>
            }
          />
          <CardContent>
            {isError ? (
              <div className="tw-h-64 tw-flex tw-items-center tw-justify-center tw-text-status-critical">
                Failed to load chart data
              </div>
            ) : (
              <SubmissionsTrendChart
                data={submissionsTrendData}
                isLoading={isLoading}
                height={256}
              />
            )}
          </CardContent>
        </Card>

        {/* Failure Categories */}
        <Card>
          <CardHeader
            title="Failure Categories"
            subtitle="Top failure reasons by count"
            action={
              <button
                className="tw-text-caption tw-text-aurora-cyan hover:tw-underline focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-ring-offset-2 focus:tw-ring-offset-obsidian-800 tw-rounded"
                onClick={handleViewFailures}
              >
                View details →
              </button>
            }
          />
          <CardContent>
            {isError ? (
              <div className="tw-h-64 tw-flex tw-items-center tw-justify-center tw-text-status-critical">
                Failed to load chart data
              </div>
            ) : (
              <FailureCategoriesChart
                data={failureCategoriesData}
                isLoading={isLoading}
                height={256}
                topN={6}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* At-Risk Agents Table */}
      <section>
        <Card>
          <CardHeader
            title="At-Risk Agents"
            subtitle="Agents requiring attention based on SLA, quality, or compliance"
            action={
              <button
                className="tw-text-caption tw-text-aurora-cyan hover:tw-underline focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-ring-offset-2 focus:tw-ring-offset-obsidian-800 tw-rounded"
                onClick={handleViewAllAtRisk}
              >
                View all →
              </button>
            }
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
                      Risk
                    </th>
                    <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                      Days in Review
                    </th>
                    <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-cursor-pointer tw-transition-colors"
                      onClick={() => handleAgentRowClick(agent.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAgentRowClick(agent.id);
                        }
                      }}
                    >
                      <td className="tw-px-4 tw-py-3">
                        <div>
                          <span className="tw-text-obsidian-100 tw-font-medium">{agent.name}</span>
                          <span className="tw-text-caption tw-text-obsidian-500 tw-ml-2">{agent.id}</span>
                        </div>
                      </td>
                      <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">{agent.publisher}</td>
                      <td className="tw-px-4 tw-py-3">
                        <Badge
                          variant={
                            agent.risk === 'SLA Breach'
                              ? 'error'
                              : agent.risk === 'RAI Failure'
                                ? 'pink'
                                : agent.risk === 'Latency'
                                  ? 'warning'
                                  : 'purple'
                          }
                        >
                          {agent.risk}
                        </Badge>
                      </td>
                      <td className="tw-px-4 tw-py-3">
                        <span
                          className={cn(
                            'tw-font-medium',
                            agent.daysInReview > 10
                              ? 'tw-text-status-critical'
                              : agent.daysInReview > 7
                                ? 'tw-text-status-medium'
                                : 'tw-text-obsidian-200'
                          )}
                        >
                          {agent.daysInReview} days
                        </span>
                      </td>
                      <td className="tw-px-4 tw-py-3">
                        <Badge
                          variant={agent.status === 'action_required' ? 'warning' : 'blue'}
                          dot
                        >
                          {agent.status === 'action_required' ? 'Action Required' : 'Human Review'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* KPI Detail Modal */}
      {selectedKPI && kpiDetailData && (
        <KPIDetailModal
          open={!!selectedKPI}
          onOpenChange={handleKPIModalClose}
          kpiId={selectedKPI}
          data={kpiDetailData}
        />
      )}
    </div>
  );
}
