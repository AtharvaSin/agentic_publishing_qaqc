'use client';

import { FC, useMemo, useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
  MoreVertical,
  Eye,
  PhoneForwarded,
  Mail,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { KPIInsightCard } from '@/components/features/overview';
import { cn } from '@/lib/utils';
import { generateInsight } from '@/lib/insights';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { chartColors, chartConfig } from '@/lib/chartTheme';

// Risk type filter options
const riskTypeOptions: SelectOption[] = [
  { value: 'all', label: 'All Risk Types' },
  { value: 'sla_breach', label: 'SLA Breach' },
  { value: 'rai_failure', label: 'RAI Failure' },
  { value: 'latency', label: 'Latency Issues' },
  { value: 'regression', label: 'Regression' },
];

// Sort options
const sortOptions: SelectOption[] = [
  { value: 'days_desc', label: 'Days in Review (High to Low)' },
  { value: 'days_asc', label: 'Days in Review (Low to High)' },
  { value: 'risk', label: 'Risk Type' },
  { value: 'publisher', label: 'Publisher' },
];

// Extended at-risk agents data
const atRiskAgentsData = [
  {
    id: 'agt_001',
    name: 'Sales Assistant Pro',
    publisher: 'Contoso Ltd',
    riskType: 'sla_breach',
    riskLabel: 'SLA Breach',
    daysInReview: 12,
    status: 'action_required',
    severity: 'critical',
    impactedUsers: 1200,
    slaDeadline: '2026-01-02',
  },
  {
    id: 'agt_002',
    name: 'HR Helper Bot',
    publisher: 'Fabrikam Inc',
    riskType: 'rai_failure',
    riskLabel: 'RAI Failure',
    daysInReview: 8,
    status: 'human_review',
    severity: 'high',
    impactedUsers: 450,
    failureType: 'Content Policy',
  },
  {
    id: 'agt_003',
    name: 'Data Insights Agent',
    publisher: 'Northwind',
    riskType: 'latency',
    riskLabel: 'Latency',
    daysInReview: 6,
    status: 'action_required',
    severity: 'medium',
    p99Latency: '2.4s',
  },
  {
    id: 'agt_004',
    name: 'Customer Support AI',
    publisher: 'Adventure Works',
    riskType: 'regression',
    riskLabel: 'Regression',
    daysInReview: 5,
    status: 'human_review',
    severity: 'medium',
    failureRate: 12,
  },
  {
    id: 'agt_005',
    name: 'Inventory Manager',
    publisher: 'Contoso Ltd',
    riskType: 'sla_breach',
    riskLabel: 'SLA Breach',
    daysInReview: 10,
    status: 'action_required',
    severity: 'high',
    slaDeadline: '2026-01-04',
  },
  {
    id: 'agt_006',
    name: 'Meeting Scheduler',
    publisher: 'Woodgrove Bank',
    riskType: 'rai_failure',
    riskLabel: 'RAI Failure',
    daysInReview: 4,
    status: 'human_review',
    severity: 'high',
    failureType: 'Prompt Safety',
  },
  {
    id: 'agt_007',
    name: 'Finance Bot',
    publisher: 'Fabrikam Inc',
    riskType: 'latency',
    riskLabel: 'Latency',
    daysInReview: 3,
    status: 'action_required',
    severity: 'low',
    p99Latency: '1.8s',
  },
  {
    id: 'agt_008',
    name: 'Document Analyzer',
    publisher: 'Northwind',
    riskType: 'sla_breach',
    riskLabel: 'SLA Breach',
    daysInReview: 7,
    status: 'human_review',
    severity: 'medium',
    slaDeadline: '2026-01-06',
  },
];

// Risk distribution for donut chart
const riskDistribution = [
  { name: 'SLA Breach', value: 4, color: chartColors.error },
  { name: 'RAI Failure', value: 3, color: chartColors.series[2] },
  { name: 'Latency', value: 2, color: chartColors.warning },
  { name: 'Regression', value: 1, color: chartColors.series[1] },
];

// Mini KPI
interface MiniKPIProps {
  label: string;
  value: string | number;
  icon: FC<{ className?: string }>;
  variant?: 'default' | 'critical' | 'warning' | 'success';
}

const MiniKPI: FC<MiniKPIProps> = ({ label, value, icon: Icon, variant = 'default' }) => {
  return (
    <div className="tw-bg-obsidian-700/50 tw-rounded-fluent-lg tw-p-4 tw-flex tw-items-center tw-gap-3">
      <div
        className={cn(
          'tw-p-2 tw-rounded-fluent',
          variant === 'default' && 'tw-bg-obsidian-600',
          variant === 'critical' && 'tw-bg-status-critical/20',
          variant === 'warning' && 'tw-bg-status-medium/20',
          variant === 'success' && 'tw-bg-status-success/20'
        )}
      >
        <Icon
          className={cn(
            'tw-w-5 tw-h-5',
            variant === 'default' && 'tw-text-aurora-cyan',
            variant === 'critical' && 'tw-text-status-critical',
            variant === 'warning' && 'tw-text-status-medium',
            variant === 'success' && 'tw-text-status-success'
          )}
        />
      </div>
      <div>
        <div className="tw-text-caption tw-text-obsidian-400">{label}</div>
        <div className="tw-text-subtitle tw-font-bold tw-text-obsidian-100">{value}</div>
      </div>
    </div>
  );
};

// Custom tooltip for donut chart
const CustomTooltip: FC<{ active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          ...chartConfig.tooltip.contentStyle,
        }}
      >
        <div className="tw-font-medium" style={{ color: data?.payload?.color }}>{data?.name}</div>
        <div className="tw-text-obsidian-200">{data?.value} agents</div>
      </div>
    );
  }
  return null;
};

export default function AtRiskAgentsPage(): React.ReactElement {
  const router = useRouter();
  const [riskTypeFilter, setRiskTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('days_desc');
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  const handleRiskTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setRiskTypeFilter(e.target.value);
  }, []);

  const handleSortChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let agents = [...atRiskAgentsData];

    // Filter by risk type
    if (riskTypeFilter !== 'all') {
      agents = agents.filter((a) => a.riskType === riskTypeFilter);
    }

    // Sort
    switch (sortBy) {
      case 'days_desc':
        agents.sort((a, b) => b.daysInReview - a.daysInReview);
        break;
      case 'days_asc':
        agents.sort((a, b) => a.daysInReview - b.daysInReview);
        break;
      case 'risk':
        agents.sort((a, b) => a.riskType.localeCompare(b.riskType));
        break;
      case 'publisher':
        agents.sort((a, b) => a.publisher.localeCompare(b.publisher));
        break;
    }

    return agents;
  }, [riskTypeFilter, sortBy]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    return {
      total: atRiskAgentsData.length,
      slaBreach: atRiskAgentsData.filter((a) => a.riskType === 'sla_breach').length,
      raiFailure: atRiskAgentsData.filter((a) => a.riskType === 'rai_failure').length,
      critical: atRiskAgentsData.filter((a) => a.severity === 'critical').length,
    };
  }, []);

  // Generate AI insight
  const insight = useMemo(() => {
    return generateInsight({
      metricType: 'sla_compliance',
      currentValue: 82,
      previousValue: 90,
      trend: 'down',
      trendPercent: 8,
      additionalData: {
        breachCount: summaryMetrics.slaBreach,
        atRiskCount: summaryMetrics.total,
        topPublishers: ['Contoso Ltd', 'Fabrikam Inc'],
      },
    });
  }, [summaryMetrics]);

  // Selection handlers
  const toggleAgentSelection = useCallback((agentId: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedAgents.size === filteredAgents.length) {
      setSelectedAgents(new Set());
    } else {
      setSelectedAgents(new Set(filteredAgents.map((a) => a.id)));
    }
  }, [selectedAgents.size, filteredAgents]);

  const isAllSelected = selectedAgents.size === filteredAgents.length && filteredAgents.length > 0;

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
              At-Risk Agents Triage
            </h1>
            <p className="tw-text-caption tw-text-obsidian-400">
              Complete view of all agents requiring attention with actionable triage
            </p>
          </div>
        </div>
        <div className="tw-flex tw-items-center tw-gap-3">
          <Select
            options={riskTypeOptions}
            value={riskTypeFilter}
            onChange={handleRiskTypeChange}
            placeholder="Risk type"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={handleSortChange}
            placeholder="Sort by"
          />
          <Button variant="secondary" leftIcon={<Download className="tw-w-4 tw-h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="tw-grid tw-grid-cols-4 tw-gap-4">
        <MiniKPI label="Total At-Risk" value={summaryMetrics.total} icon={AlertTriangle} />
        <MiniKPI label="SLA Breach" value={summaryMetrics.slaBreach} icon={Clock} variant="critical" />
        <MiniKPI label="RAI Failures" value={summaryMetrics.raiFailure} icon={Shield} variant="warning" />
        <MiniKPI label="Critical Priority" value={summaryMetrics.critical} icon={Activity} variant="critical" />
      </div>

      {/* Chart and AI Insight Row */}
      <div className="tw-grid tw-grid-cols-2 tw-gap-6">
        {/* Risk Distribution Donut */}
        <Card>
          <CardHeader title="Risk Distribution" subtitle="Breakdown by risk type" />
          <CardContent>
            <div className="tw-h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="tw-text-obsidian-200 tw-text-caption">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation */}
        <Card>
          <CardHeader title="AI Recommendation" subtitle="Suggested prioritization" />
          <CardContent>
            <KPIInsightCard insight={insight} />
            <div className="tw-mt-4 tw-flex tw-gap-2">
              <Button size="sm" variant="primary">
                Apply Recommendation
              </Button>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader
          title="At-Risk Agents"
          subtitle={`${filteredAgents.length} agents requiring attention`}
          action={
            selectedAgents.size > 0 && (
              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-text-caption tw-text-obsidian-400">
                  {selectedAgents.size} selected
                </span>
                <Button size="sm" variant="secondary" leftIcon={<PhoneForwarded className="tw-w-3 tw-h-3" />}>
                  Escalate
                </Button>
                <Button size="sm" variant="secondary" leftIcon={<Mail className="tw-w-3 tw-h-3" />}>
                  Contact
                </Button>
              </div>
            )
          }
        />
        <CardContent>
          <div className="tw-overflow-x-auto">
            <table className="tw-w-full tw-text-body">
              <thead>
                <tr className="tw-border-b tw-border-obsidian-700">
                  <th className="tw-px-4 tw-py-3 tw-w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="tw-text-obsidian-400 hover:tw-text-obsidian-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan tw-rounded"
                      aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="tw-w-4 tw-h-4" />
                      ) : (
                        <Square className="tw-w-4 tw-h-4" />
                      )}
                    </button>
                  </th>
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
                    Days
                  </th>
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Status
                  </th>
                  <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <tr
                    key={agent.id}
                    className={cn(
                      'tw-border-b tw-border-obsidian-700/50 tw-transition-colors',
                      selectedAgents.has(agent.id) && 'tw-bg-aurora-cyan/5'
                    )}
                  >
                    <td className="tw-px-4 tw-py-3">
                      <button
                        onClick={() => toggleAgentSelection(agent.id)}
                        className="tw-text-obsidian-400 hover:tw-text-obsidian-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan tw-rounded"
                        aria-label={selectedAgents.has(agent.id) ? 'Deselect agent' : 'Select agent'}
                      >
                        {selectedAgents.has(agent.id) ? (
                          <CheckSquare className="tw-w-4 tw-h-4 tw-text-aurora-cyan" />
                        ) : (
                          <Square className="tw-w-4 tw-h-4" />
                        )}
                      </button>
                    </td>
                    <td className="tw-px-4 tw-py-3">
                      <button
                        onClick={() => router.push(`/agents/${agent.id}`)}
                        className="tw-text-left hover:tw-underline focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-aurora-cyan tw-rounded"
                      >
                        <span className="tw-text-obsidian-100 tw-font-medium">{agent.name}</span>
                        <span className="tw-text-caption tw-text-obsidian-500 tw-ml-2">{agent.id}</span>
                      </button>
                    </td>
                    <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">{agent.publisher}</td>
                    <td className="tw-px-4 tw-py-3">
                      <Badge
                        variant={
                          agent.riskType === 'sla_breach'
                            ? 'error'
                            : agent.riskType === 'rai_failure'
                              ? 'pink'
                              : agent.riskType === 'latency'
                                ? 'warning'
                                : 'purple'
                        }
                      >
                        {agent.riskLabel}
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
                    <td className="tw-px-4 tw-py-3">
                      <div className="tw-flex tw-items-center tw-gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => router.push(`/agents/${agent.id}`)}
                          aria-label="View agent"
                        >
                          <Eye className="tw-w-4 tw-h-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Escalate"
                        >
                          <PhoneForwarded className="tw-w-4 tw-h-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="More actions"
                        >
                          <MoreVertical className="tw-w-4 tw-h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Footer */}
      {selectedAgents.size > 0 && (
        <div className="tw-fixed tw-bottom-6 tw-left-1/2 tw-transform tw--translate-x-1/2 tw-z-40">
          <div className="tw-bg-obsidian-800 tw-border tw-border-obsidian-700 tw-rounded-fluent-lg tw-shadow-fluent-16 tw-px-6 tw-py-3 tw-flex tw-items-center tw-gap-4">
            <span className="tw-text-body tw-text-obsidian-200">
              {selectedAgents.size} agent{selectedAgents.size > 1 ? 's' : ''} selected
            </span>
            <div className="tw-w-px tw-h-6 tw-bg-obsidian-600" />
            <Button size="sm" variant="primary" leftIcon={<PhoneForwarded className="tw-w-4 tw-h-4" />}>
              Escalate Selected
            </Button>
            <Button size="sm" variant="secondary" leftIcon={<Download className="tw-w-4 tw-h-4" />}>
              Generate Report
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedAgents(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
