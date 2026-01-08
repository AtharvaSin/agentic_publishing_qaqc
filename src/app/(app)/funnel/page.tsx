'use client';

import type { FC } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BacklogTrendChart } from '@/components/charts';
import { useSnapshots } from '@/hooks';
import { cn } from '@/lib/utils';
import { STAGE_LABELS, SubmissionStage } from '@/lib/constants';

// Mock stage distribution data
const stageDistribution = [
  { stage: 'draft' as SubmissionStage, count: 12, avgDays: 1.2 },
  { stage: 'submitted' as SubmissionStage, count: 8, avgDays: 0.3 },
  { stage: 'automated_checks' as SubmissionStage, count: 15, avgDays: 0.5 },
  { stage: 'human_review' as SubmissionStage, count: 45, avgDays: 3.2 },
  { stage: 'action_required' as SubmissionStage, count: 28, avgDays: 4.5 },
  { stage: 'approved' as SubmissionStage, count: 156, avgDays: 0.1 },
  { stage: 'published' as SubmissionStage, count: 142, avgDays: 0 },
  { stage: 'rejected' as SubmissionStage, count: 18, avgDays: 0 },
];

// Mock oldest items in queue
const oldestItems = [
  { id: 'SUB001', agentName: 'Sales Assistant Pro', publisher: 'Contoso Ltd', stage: 'human_review' as SubmissionStage, age: 14, resubmissions: 2 },
  { id: 'SUB002', agentName: 'Inventory Manager', publisher: 'Contoso Ltd', stage: 'action_required' as SubmissionStage, age: 12, resubmissions: 3 },
  { id: 'SUB003', agentName: 'HR Helper Bot', publisher: 'Fabrikam Inc', stage: 'human_review' as SubmissionStage, age: 10, resubmissions: 1 },
  { id: 'SUB004', agentName: 'Customer Insights AI', publisher: 'Northwind', stage: 'action_required' as SubmissionStage, age: 9, resubmissions: 2 },
  { id: 'SUB005', agentName: 'Project Tracker', publisher: 'Adventure Works', stage: 'human_review' as SubmissionStage, age: 8, resubmissions: 0 },
  { id: 'SUB006', agentName: 'Meeting Scheduler', publisher: 'Tailspin Toys', stage: 'action_required' as SubmissionStage, age: 7, resubmissions: 1 },
];

// Mini KPI component
const MiniKPI: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="tw-text-center">
    <div className="tw-text-subtitle tw-font-bold tw-text-obsidian-100">{value}</div>
    <div className="tw-text-caption tw-text-obsidian-400">{label}</div>
  </div>
);

export default function FunnelPage(): React.ReactElement {
  // Fetch snapshot data for the last 60 days
  const { data: snapshotsResponse, isLoading } = useSnapshots();

  // Transform snapshot data for the backlog trend chart
  const backlogTrendData = snapshotsResponse?.data?.map((s) => ({
    date: s.date,
    humanReview: s.backlogReview,
    actionRequired: s.backlogActionRequired,
  })) ?? [];

  // Calculate totals
  const totalInProgress = stageDistribution
    .filter((s) => !['approved', 'published', 'rejected'].includes(s.stage))
    .reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="tw-space-y-6">
      {/* Mini KPI Strip */}
      <section>
        <div className="tw-grid tw-grid-cols-4 tw-gap-4">
          <Card className="tw-p-4">
            <MiniKPI label="Total Submissions" value="324" />
          </Card>
          <Card className="tw-p-4">
            <MiniKPI label="In Progress" value={totalInProgress} />
          </Card>
          <Card className="tw-p-4">
            <MiniKPI label="Completed" value="298" />
          </Card>
          <Card className="tw-p-4">
            <MiniKPI label="Avg. Lead Time" value="4.2 days" />
          </Card>
        </div>
      </section>

      {/* Stage Distribution + Time in Stage */}
      <section className="tw-grid tw-grid-cols-2 tw-gap-6">
        {/* Stage Distribution */}
        <Card>
          <CardHeader
            title="Stage Distribution"
            subtitle="Current submissions by pipeline stage"
          />
          <CardContent>
            <div className="tw-space-y-3">
              {stageDistribution.map((item) => {
                const maxCount = Math.max(...stageDistribution.map((s) => s.count));
                const width = (item.count / maxCount) * 100;

                return (
                  <div key={item.stage} className="tw-group">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                      <span className="tw-text-body tw-text-obsidian-200">
                        {STAGE_LABELS[item.stage]}
                      </span>
                      <span className="tw-text-body tw-font-medium tw-text-obsidian-100">
                        {item.count}
                      </span>
                    </div>
                    <div className="tw-h-6 tw-bg-obsidian-700 tw-rounded-fluent tw-overflow-hidden">
                      <div
                        className="tw-h-full tw-rounded-fluent tw-transition-all tw-duration-500"
                        style={{ width: `${width}%`, backgroundColor: getStageColor(item.stage) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Average Time in Stage */}
        <Card>
          <CardHeader
            title="Average Time in Stage"
            subtitle="Days spent in each pipeline stage"
          />
          <CardContent>
            <div className="tw-space-y-3">
              {stageDistribution
                .filter((s) => s.avgDays > 0)
                .sort((a, b) => b.avgDays - a.avgDays)
                .map((item) => {
                  const maxDays = Math.max(...stageDistribution.map((s) => s.avgDays));
                  const width = (item.avgDays / maxDays) * 100;
                  const isBottleneck = item.avgDays > 3;

                  return (
                    <div key={item.stage}>
                      <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                        <span className="tw-text-body tw-text-obsidian-200">
                          {STAGE_LABELS[item.stage]}
                          {isBottleneck && (
                            <Badge variant="warning" size="sm" className="tw-ml-2">
                              Bottleneck
                            </Badge>
                          )}
                        </span>
                        <span
                          className={cn(
                            'tw-text-body tw-font-medium',
                            isBottleneck ? 'tw-text-status-medium' : 'tw-text-obsidian-100'
                          )}
                        >
                          {item.avgDays.toFixed(1)} days
                        </span>
                      </div>
                      <div className="tw-h-4 tw-bg-obsidian-700 tw-rounded-fluent tw-overflow-hidden">
                        <div
                          className={cn(
                            'tw-h-full tw-rounded-fluent tw-transition-all tw-duration-500',
                            isBottleneck ? 'tw-bg-status-medium' : 'tw-bg-aurora-cyan'
                          )}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Backlog Trend Chart */}
      <section>
        <Card>
          <CardHeader title="Backlog Trend" subtitle="Review queue size over time" />
          <CardContent>
            <BacklogTrendChart
              data={backlogTrendData}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </section>

      {/* Oldest Items Table */}
      <section>
        <Card>
          <CardHeader
            title="Oldest Items in Queue"
            subtitle="Submissions waiting longest for resolution"
            action={
              <button className="tw-text-caption tw-text-aurora-cyan hover:tw-underline">
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
                      Stage
                    </th>
                    <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                      Age
                    </th>
                    <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                      Resubmissions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {oldestItems.map((item) => (
                    <tr
                      key={item.id}
                      className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-cursor-pointer tw-transition-colors"
                    >
                      <td className="tw-px-4 tw-py-3">
                        <div>
                          <span className="tw-text-obsidian-100 tw-font-medium">{item.agentName}</span>
                          <span className="tw-text-caption tw-text-obsidian-500 tw-ml-2">{item.id}</span>
                        </div>
                      </td>
                      <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">{item.publisher}</td>
                      <td className="tw-px-4 tw-py-3">
                        <Badge
                          variant={item.stage === 'action_required' ? 'warning' : 'teal'}
                        >
                          {STAGE_LABELS[item.stage]}
                        </Badge>
                      </td>
                      <td className="tw-px-4 tw-py-3">
                        <span
                          className={cn(
                            'tw-font-medium',
                            item.age > 10
                              ? 'tw-text-status-critical'
                              : item.age > 7
                                ? 'tw-text-status-medium'
                                : 'tw-text-obsidian-200'
                          )}
                        >
                          {item.age} days
                        </span>
                      </td>
                      <td className="tw-px-4 tw-py-3">
                        <span
                          className={cn(
                            item.resubmissions > 2 ? 'tw-text-status-medium' : 'tw-text-obsidian-300'
                          )}
                        >
                          {item.resubmissions}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Helper function to get stage colors
function getStageColor(stage: SubmissionStage): string {
  const colors: Record<SubmissionStage, string> = {
    draft: '#6B7280',
    submitted: '#3B82F6',
    automated_checks: '#8B5CF6',
    human_review: '#14B8A6',
    action_required: '#F59E0B',
    approved: '#10B981',
    published: '#10B981',
    rejected: '#EF4444',
  };
  return colors[stage];
}
