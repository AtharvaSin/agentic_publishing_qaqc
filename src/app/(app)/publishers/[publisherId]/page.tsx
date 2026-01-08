'use client';

import { use, FC } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  FileText,
  Bot,
  Sparkles,
  AlertTriangle,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import { TIER_LABELS, PublisherTier, Region } from '@/lib/constants';

// Publisher detail type
interface PublisherDetail {
  id: string;
  name: string;
  tier: PublisherTier;
  region: Region;
  supportPlan: string;
  contactEmail: string;
  createdAt: string;
  activeAgents: number;
  totalSubmissions: number;
  passRate: number;
  passRateTrend: 'up' | 'down' | 'neutral';
  avgLeadTime: number;
  avgLeadTimeTrend: 'up' | 'down' | 'neutral';
  description: string;
}

// KPI data type
interface PublisherKPI {
  id: string;
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  status: 'healthy' | 'warning' | 'critical';
  icon: FC<{ className?: string }>;
}

// Mock publisher detail data
const getPublisherDetail = (id: string): PublisherDetail => ({
  id,
  name: 'Contoso Ltd',
  tier: 'strategic' as PublisherTier,
  region: 'NOAM' as Region,
  supportPlan: 'Premier',
  contactEmail: 'partnerships@contoso.com',
  createdAt: '2024-03-15',
  activeAgents: 8,
  totalSubmissions: 45,
  passRate: 72,
  passRateTrend: 'down' as const,
  avgLeadTime: 5.2,
  avgLeadTimeTrend: 'up' as const,
  description:
    'Enterprise software provider specializing in productivity and collaboration tools for large organizations.',
});

// Mock KPI data for the publisher
const getPublisherKPIs = (publisher: PublisherDetail): PublisherKPI[] => [
  {
    id: 'pass-rate',
    title: 'Pass Rate',
    value: publisher.passRate.toString(),
    unit: '%',
    trend: publisher.passRateTrend,
    trendValue: 8,
    status:
      publisher.passRate >= 80 ? 'healthy' : publisher.passRate >= 70 ? 'warning' : 'critical',
    icon: CheckCircle,
  },
  {
    id: 'avg-lead-time',
    title: 'Avg Lead Time',
    value: publisher.avgLeadTime.toFixed(1),
    unit: 'days',
    trend: publisher.avgLeadTimeTrend,
    trendValue: 0.5,
    status:
      publisher.avgLeadTime <= 4 ? 'healthy' : publisher.avgLeadTime <= 6 ? 'warning' : 'critical',
    icon: Clock,
  },
  {
    id: 'total-submissions',
    title: 'Total Submissions',
    value: publisher.totalSubmissions.toString(),
    unit: '',
    trend: 'up' as const,
    trendValue: 12,
    status: 'healthy' as const,
    icon: FileText,
  },
  {
    id: 'active-agents',
    title: 'Active Agents',
    value: publisher.activeAgents.toString(),
    unit: '',
    trend: 'up' as const,
    trendValue: 2,
    status: 'healthy' as const,
    icon: Bot,
  },
];

// Mock failure category breakdown for this publisher
const failureCategoriesData = [
  { category: 'Manifest Mismatch', count: 12, percentage: 35 },
  { category: 'RAI Violation', count: 8, percentage: 24 },
  { category: 'Metadata Issues', count: 6, percentage: 18 },
  { category: 'Functional Test', count: 5, percentage: 15 },
  { category: 'Security Concerns', count: 3, percentage: 8 },
];

// Mock recent submissions from this publisher
const recentSubmissions = [
  {
    id: 'SUB045',
    agentName: 'Sales Assistant Pro',
    agentId: 'AGT001',
    version: '2.1.0',
    submittedAt: '2025-12-28',
    status: 'action_required',
    stage: 'Human Review',
  },
  {
    id: 'SUB044',
    agentName: 'HR Helper Bot',
    agentId: 'AGT002',
    version: '1.3.2',
    submittedAt: '2025-12-26',
    status: 'approved',
    stage: 'Published',
  },
  {
    id: 'SUB043',
    agentName: 'Data Insights Agent',
    agentId: 'AGT003',
    version: '1.0.5',
    submittedAt: '2025-12-24',
    status: 'rejected',
    stage: 'Completed',
  },
  {
    id: 'SUB042',
    agentName: 'Inventory Manager',
    agentId: 'AGT005',
    version: '2.0.0',
    submittedAt: '2025-12-22',
    status: 'approved',
    stage: 'Published',
  },
  {
    id: 'SUB041',
    agentName: 'Customer Support AI',
    agentId: 'AGT004',
    version: '1.8.0',
    submittedAt: '2025-12-20',
    status: 'approved',
    stage: 'Published',
  },
];

// Mock coaching recommendations
const coachingRecommendations = [
  {
    id: 'CR001',
    issue: 'Manifest Mismatch',
    count: 12,
    severity: 'high' as const,
    preCheckSteps: [
      'Validate manifest schema against latest spec before submission',
      'Ensure all declared capabilities are implemented and tested',
      'Use the Manifest Validator tool in Partner Center',
    ],
  },
  {
    id: 'CR002',
    issue: 'RAI Violation',
    count: 8,
    severity: 'critical' as const,
    preCheckSteps: [
      'Run RAI pre-flight checks locally before submission',
      'Review content moderation guidelines in documentation',
      'Test edge cases with adversarial prompts',
    ],
  },
  {
    id: 'CR003',
    issue: 'Metadata Issues',
    count: 6,
    severity: 'medium' as const,
    preCheckSteps: [
      'Ensure all required metadata fields are populated',
      'Verify descriptions meet minimum character requirements',
      'Check icon dimensions and format requirements',
    ],
  },
];

// KPI Tile Component
interface KPITileProps {
  title: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  status?: 'healthy' | 'warning' | 'critical';
  icon?: FC<{ className?: string }>;
}

const KPITile: FC<KPITileProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  status = 'healthy',
  icon: Icon,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  // Determine if trend is positive or negative based on context
  const isTrendPositive = (kpiTitle: string, trendDirection: string): boolean => {
    if (kpiTitle === 'Avg Lead Time') {
      return trendDirection === 'down';
    }
    return trendDirection === 'up';
  };

  const trendIsGood = trend ? isTrendPositive(title, trend) : true;

  return (
    <Card className="tw-relative tw-overflow-hidden">
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
        </div>
        {trend && trendValue !== undefined && (
          <div
            className={cn(
              'tw-flex tw-items-center tw-gap-1 tw-mt-2 tw-text-caption tw-font-medium',
              trendIsGood ? 'tw-text-status-success' : 'tw-text-status-critical'
            )}
          >
            <TrendIcon className="tw-w-3 tw-h-3" />
            <span>
              {trendValue}
              {title === 'Avg Lead Time' ? ' days' : '%'} vs last period
            </span>
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
    </Card>
  );
};

interface PageProps {
  params: Promise<{ publisherId: string }>;
}

export default function PublisherDetailPage({ params }: PageProps): React.ReactElement {
  const { publisherId } = use(params);
  const publisher = getPublisherDetail(publisherId);
  const kpis = getPublisherKPIs(publisher);

  const getTierBadgeVariant = (tier: PublisherTier): 'purple' | 'blue' | 'default' => {
    switch (tier) {
      case 'strategic':
        return 'purple';
      case 'standard':
        return 'blue';
      case 'emerging':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="tw-space-y-6">
      {/* Back Navigation */}
      <Link
        href="/publishers"
        className="tw-inline-flex tw-items-center tw-gap-2 tw-text-obsidian-400 hover:tw-text-obsidian-200 tw-transition-colors"
      >
        <ArrowLeft className="tw-w-4 tw-h-4" />
        <span className="tw-text-body">Back to Publishers</span>
      </Link>

      {/* Publisher Header */}
      <Card>
        <CardContent>
          <div className="tw-flex tw-items-start tw-justify-between">
            <div className="tw-flex tw-items-start tw-gap-4">
              <div className="tw-w-16 tw-h-16 tw-rounded-fluent-lg tw-bg-gradient-to-br tw-from-aurora-purple/20 tw-to-aurora-cyan/20 tw-flex tw-items-center tw-justify-center tw-border tw-border-obsidian-700">
                <Building2 className="tw-w-8 tw-h-8 tw-text-aurora-purple" />
              </div>
              <div>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-1">
                  <h1 className="tw-text-subtitle tw-font-semibold tw-text-obsidian-100">
                    {publisher.name}
                  </h1>
                </div>
                <p className="tw-text-body tw-text-obsidian-400 tw-mb-2">{publisher.description}</p>
                <div className="tw-flex tw-items-center tw-gap-4 tw-text-caption tw-text-obsidian-500">
                  <span>{publisher.id}</span>
                </div>
              </div>
            </div>
            <div className="tw-flex tw-gap-2">
              <Badge variant={getTierBadgeVariant(publisher.tier)}>
                {TIER_LABELS[publisher.tier]}
              </Badge>
              <Badge variant="teal">{publisher.region}</Badge>
              <Badge variant="info" dot>
                {publisher.supportPlan}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Tiles Row */}
      <section>
        <div className="tw-grid tw-grid-cols-4 tw-gap-4">
          {kpis.map((kpi) => (
            <KPITile
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              status={kpi.status as 'healthy' | 'warning' | 'critical'}
              icon={kpi.icon}
            />
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="tw-grid tw-grid-cols-3 tw-gap-6">
        {/* Left Column - Charts & Submissions */}
        <div className="tw-col-span-2 tw-space-y-6">
          {/* Failure Categories Breakdown */}
          <Card>
            <CardHeader
              title="Failure Categories Breakdown"
              subtitle="Recurring issues from this publisher's submissions"
            />
            <CardContent>
              <div className="tw-space-y-3">
                {failureCategoriesData.map((item, index) => (
                  <div key={item.category} className="tw-flex tw-items-center tw-gap-4">
                    <div className="tw-w-32 tw-text-body tw-text-obsidian-300 tw-truncate">
                      {item.category}
                    </div>
                    <div className="tw-flex-1 tw-h-6 tw-bg-obsidian-700 tw-rounded-fluent tw-overflow-hidden">
                      <div
                        className={cn(
                          'tw-h-full tw-rounded-fluent tw-transition-all tw-duration-500',
                          index === 0 && 'tw-bg-aurora-cyan',
                          index === 1 && 'tw-bg-aurora-pink',
                          index === 2 && 'tw-bg-aurora-purple',
                          index === 3 && 'tw-bg-aurora-blue',
                          index === 4 && 'tw-bg-aurora-teal'
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="tw-w-20 tw-text-right">
                      <span className="tw-text-body tw-font-medium tw-text-obsidian-100">
                        {item.count}
                      </span>
                      <span className="tw-text-caption tw-text-obsidian-500 tw-ml-1">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions Table */}
          <Card>
            <CardHeader
              title="Recent Submissions"
              subtitle="Last 5 submissions from this publisher"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ExternalLink className="tw-w-3 tw-h-3" />}
                >
                  View All
                </Button>
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
                        Version
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Submitted
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Status
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Stage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-cursor-pointer tw-transition-colors"
                      >
                        <td className="tw-px-4 tw-py-3">
                          <Link href={`/agents/${submission.agentId}`}>
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span className="tw-text-obsidian-100 tw-font-medium hover:tw-text-aurora-cyan tw-transition-colors">
                                {submission.agentName}
                              </span>
                              <ChevronRight className="tw-w-3 tw-h-3 tw-text-obsidian-500" />
                            </div>
                          </Link>
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">
                          v{submission.version}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">
                          {submission.submittedAt}
                        </td>
                        <td className="tw-px-4 tw-py-3">
                          {submission.status === 'approved' && (
                            <CheckCircle className="tw-w-4 tw-h-4 tw-text-status-success" />
                          )}
                          {submission.status === 'rejected' && (
                            <AlertTriangle className="tw-w-4 tw-h-4 tw-text-status-critical" />
                          )}
                          {submission.status === 'action_required' && (
                            <Clock className="tw-w-4 tw-h-4 tw-text-status-medium" />
                          )}
                        </td>
                        <td className="tw-px-4 tw-py-3">
                          <Badge
                            variant={
                              submission.status === 'approved'
                                ? 'success'
                                : submission.status === 'rejected'
                                  ? 'error'
                                  : 'warning'
                            }
                            size="sm"
                          >
                            {submission.stage}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details, Coaching, Actions */}
        <div className="tw-space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <div className="tw-space-y-2">
                <Button
                  variant="primary"
                  className="tw-w-full"
                  leftIcon={<Sparkles className="tw-w-4 tw-h-4" />}
                >
                  Generate Coaching Report
                </Button>
                <Button
                  variant="secondary"
                  className="tw-w-full"
                  leftIcon={<MessageSquare className="tw-w-4 tw-h-4" />}
                >
                  Draft Partner Message
                </Button>
                <Link href={`/agents?publisher=${publisherId}`}>
                  <Button
                    variant="ghost"
                    className="tw-w-full"
                    rightIcon={<ExternalLink className="tw-w-3 tw-h-3" />}
                  >
                    View All Agents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Publisher Details */}
          <Card>
            <CardHeader title="Publisher Details" />
            <CardContent>
              <dl className="tw-space-y-3">
                <div className="tw-flex tw-items-center tw-justify-between">
                  <dt className="tw-flex tw-items-center tw-gap-2 tw-text-caption tw-text-obsidian-400">
                    <Mail className="tw-w-3 tw-h-3" />
                    Contact Email
                  </dt>
                  <dd className="tw-text-body tw-text-aurora-cyan">
                    <a href={`mailto:${publisher.contactEmail}`} className="hover:tw-underline">
                      {publisher.contactEmail}
                    </a>
                  </dd>
                </div>
                <div className="tw-flex tw-items-center tw-justify-between">
                  <dt className="tw-flex tw-items-center tw-gap-2 tw-text-caption tw-text-obsidian-400">
                    <Calendar className="tw-w-3 tw-h-3" />
                    Created Date
                  </dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{publisher.createdAt}</dd>
                </div>
                <div className="tw-flex tw-items-center tw-justify-between">
                  <dt className="tw-flex tw-items-center tw-gap-2 tw-text-caption tw-text-obsidian-400">
                    <Shield className="tw-w-3 tw-h-3" />
                    Support Plan
                  </dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{publisher.supportPlan}</dd>
                </div>
                <div className="tw-flex tw-items-center tw-justify-between">
                  <dt className="tw-flex tw-items-center tw-gap-2 tw-text-caption tw-text-obsidian-400">
                    <Building2 className="tw-w-3 tw-h-3" />
                    Region
                  </dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{publisher.region}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Coaching Recommendations Panel */}
          <Card>
            <CardHeader
              title="Coaching Recommendations"
              subtitle="AI-generated suggestions based on recurring issues"
            />
            <CardContent>
              <div className="tw-space-y-4">
                {coachingRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={cn(
                      'tw-p-3 tw-rounded-fluent tw-border',
                      rec.severity === 'critical' &&
                        'tw-border-status-critical/30 tw-bg-status-critical/5',
                      rec.severity === 'high' && 'tw-border-aurora-pink/30 tw-bg-aurora-pink/5',
                      rec.severity === 'medium' && 'tw-border-status-medium/30 tw-bg-status-medium/5'
                    )}
                  >
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <Lightbulb
                          className={cn(
                            'tw-w-4 tw-h-4',
                            rec.severity === 'critical' && 'tw-text-status-critical',
                            rec.severity === 'high' && 'tw-text-aurora-pink',
                            rec.severity === 'medium' && 'tw-text-status-medium'
                          )}
                        />
                        <span className="tw-text-body tw-font-medium tw-text-obsidian-200">
                          {rec.issue}
                        </span>
                      </div>
                      <Badge
                        variant={
                          rec.severity === 'critical'
                            ? 'error'
                            : rec.severity === 'high'
                              ? 'pink'
                              : 'warning'
                        }
                        size="sm"
                      >
                        {rec.count} occurrences
                      </Badge>
                    </div>
                    <div className="tw-space-y-1">
                      <p className="tw-text-caption tw-text-obsidian-400 tw-font-medium">
                        Pre-check steps:
                      </p>
                      <ul className="tw-space-y-1">
                        {rec.preCheckSteps.map((step, index) => (
                          <li
                            key={index}
                            className="tw-text-caption tw-text-obsidian-400 tw-flex tw-items-start tw-gap-2"
                          >
                            <span className="tw-text-aurora-cyan tw-font-mono tw-text-[10px] tw-mt-0.5">
                              {index + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}

                {/* CTA buttons for AI features */}
                <div className="tw-pt-2 tw-border-t tw-border-obsidian-700 tw-space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="tw-w-full"
                    leftIcon={<Sparkles className="tw-w-3 tw-h-3 tw-text-aurora-cyan" />}
                  >
                    Generate Detailed Analysis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="tw-w-full"
                    leftIcon={<FileText className="tw-w-3 tw-h-3 tw-text-aurora-purple" />}
                  >
                    Export Coaching Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
