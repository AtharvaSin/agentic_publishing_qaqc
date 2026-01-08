'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { useAgent, usePublisher } from '@/hooks';
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// Mock submission history (would need its own endpoint)
const submissionHistory = [
  {
    id: 'SUB001',
    version: '2.1.0',
    submittedAt: '2025-12-28',
    status: 'action_required',
    stage: 'Human Review',
    duration: 14,
    outcome: null,
  },
  {
    id: 'SUB002',
    version: '2.0.1',
    submittedAt: '2025-12-15',
    status: 'rejected',
    stage: 'Completed',
    duration: 5,
    outcome: 'Rejected - RAI Violation',
  },
  {
    id: 'SUB003',
    version: '2.0.0',
    submittedAt: '2025-12-01',
    status: 'approved',
    stage: 'Published',
    duration: 3,
    outcome: 'Approved',
  },
  {
    id: 'SUB004',
    version: '1.5.0',
    submittedAt: '2025-11-15',
    status: 'approved',
    stage: 'Published',
    duration: 4,
    outcome: 'Approved',
  },
];

// Mock validation findings (would need its own endpoint)
const validationFindings = [
  {
    id: 'VF001',
    category: 'Manifest Mismatch',
    severity: 'must_fix',
    message: 'Declared capabilities do not match implemented features',
    remediation: 'Update manifest to accurately reflect agent capabilities',
    raiFlag: false,
  },
  {
    id: 'VF002',
    category: 'RAI Violation',
    severity: 'must_fix',
    message: 'Potential harmful content generation detected in sales pitch mode',
    remediation: 'Add guardrails to prevent aggressive or misleading sales language',
    raiFlag: true,
  },
  {
    id: 'VF003',
    category: 'Latency',
    severity: 'should_fix',
    message: 'p99 response time exceeds 3 second threshold',
    remediation: 'Optimize API calls and implement response caching',
    raiFlag: false,
  },
];

interface PageProps {
  params: Promise<{ agentId: string }>;
}

export default function AgentDetailPage({ params }: PageProps): React.ReactElement {
  const { agentId } = use(params);
  const { data: agentResponse, isLoading: agentLoading, error: agentError } = useAgent(agentId);
  const agent = agentResponse?.data;

  // Get publisher name
  const { data: publisherResponse } = usePublisher(agent?.ownerId ?? '');
  const publisherName = publisherResponse?.data?.name ?? 'Loading...';

  // Loading state
  if (agentLoading) {
    return (
      <div className="tw-space-y-6">
        {/* Back Navigation Skeleton */}
        <Skeleton className="tw-h-5 tw-w-32" />

        {/* Agent Header Skeleton */}
        <Card>
          <CardContent>
            <div className="tw-flex tw-items-start tw-justify-between">
              <div className="tw-flex tw-items-start tw-gap-4">
                <Skeleton className="tw-w-16 tw-h-16 tw-rounded-fluent-lg" />
                <div className="tw-space-y-2">
                  <Skeleton className="tw-h-6 tw-w-48" />
                  <Skeleton className="tw-h-4 tw-w-96" />
                  <Skeleton className="tw-h-3 tw-w-64" />
                </div>
              </div>
              <div className="tw-flex tw-gap-2">
                <Skeleton className="tw-h-6 tw-w-20" />
                <Skeleton className="tw-h-6 tw-w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout Skeleton */}
        <div className="tw-grid tw-grid-cols-3 tw-gap-6">
          <div className="tw-col-span-2 tw-space-y-6">
            <Card>
              <CardHeader title="Submission History" subtitle="Loading..." />
              <CardContent>
                <div className="tw-space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="tw-flex tw-items-center tw-gap-4 tw-p-3">
                      <Skeleton className="tw-w-5 tw-h-5 tw-rounded-full" />
                      <div className="tw-flex-1 tw-space-y-2">
                        <Skeleton className="tw-h-4 tw-w-32" />
                        <Skeleton className="tw-h-3 tw-w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Validation Findings" subtitle="Loading..." />
              <CardContent>
                <div className="tw-space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="tw-p-4 tw-rounded-fluent tw-border tw-border-obsidian-700">
                      <Skeleton className="tw-h-5 tw-w-40 tw-mb-2" />
                      <Skeleton className="tw-h-4 tw-w-full tw-mb-2" />
                      <Skeleton className="tw-h-16 tw-w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="tw-space-y-6">
            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="tw-space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="tw-h-10 tw-w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Agent Details" />
              <CardContent>
                <div className="tw-space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="tw-flex tw-justify-between">
                      <Skeleton className="tw-h-4 tw-w-20" />
                      <Skeleton className="tw-h-4 tw-w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (agentError || !agent) {
    return (
      <div className="tw-p-8 tw-text-center">
        <p className="tw-text-status-critical">Failed to load agent details</p>
        <Link href="/agents" className="tw-text-aurora-cyan hover:tw-underline tw-mt-2 tw-inline-block">
          Back to Agents
        </Link>
      </div>
    );
  }

  // Helper to format status for display
  const getStatusVariant = (status: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'action_required':
        return 'warning';
      case 'published':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'action_required':
        return 'Action Required';
      case 'published':
        return 'Published';
      case 'in_review':
        return 'In Review';
      case 'draft':
        return 'Draft';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Format type for display
  const formatType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format distribution method for display
  const formatDistribution = (method: string): string => {
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="tw-space-y-6">
      {/* Back Navigation */}
      <Link
        href="/agents"
        className="tw-inline-flex tw-items-center tw-gap-2 tw-text-obsidian-400 hover:tw-text-obsidian-200 tw-transition-colors"
      >
        <ArrowLeft className="tw-w-4 tw-h-4" />
        <span className="tw-text-body">Back to Agents</span>
      </Link>

      {/* Agent Header */}
      <Card>
        <CardContent>
          <div className="tw-flex tw-items-start tw-justify-between">
            <div className="tw-flex tw-items-start tw-gap-4">
              <div className="tw-w-16 tw-h-16 tw-rounded-fluent-lg tw-bg-gradient-to-br tw-from-aurora-cyan/20 tw-to-aurora-purple/20 tw-flex tw-items-center tw-justify-center tw-border tw-border-obsidian-700">
                <Bot className="tw-w-8 tw-h-8 tw-text-aurora-cyan" />
              </div>
              <div>
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-1">
                  <h1 className="tw-text-subtitle tw-font-semibold tw-text-obsidian-100">{agent.name}</h1>
                  <Badge variant={getStatusVariant(agent.currentStatus)} dot>
                    {getStatusLabel(agent.currentStatus)}
                  </Badge>
                </div>
                <p className="tw-text-body tw-text-obsidian-400 tw-mb-2">
                  {agent.description ?? 'No description available'}
                </p>
                <div className="tw-flex tw-items-center tw-gap-4 tw-text-caption tw-text-obsidian-500">
                  <span>{agent.id}</span>
                  <span>-</span>
                  <span>{formatType(agent.type)}</span>
                  <span>-</span>
                  <Link
                    href={`/publishers/${agent.ownerId}`}
                    className="tw-text-aurora-cyan hover:tw-underline"
                  >
                    {publisherName}
                  </Link>
                </div>
              </div>
            </div>
            <div className="tw-flex tw-gap-2">
              <Badge variant="info">{agent.category}</Badge>
              <Badge variant="default">{formatDistribution(agent.distributionMethod)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="tw-grid tw-grid-cols-3 tw-gap-6">
        {/* Left Column - History & Findings */}
        <div className="tw-col-span-2 tw-space-y-6">
          {/* Submission History */}
          <Card>
            <CardHeader title="Submission History" subtitle="Recent submission attempts and outcomes" />
            <CardContent>
              <div className="tw-space-y-3">
                {submissionHistory.map((submission, index) => (
                  <div
                    key={submission.id}
                    className={cn(
                      'tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-fluent',
                      index === 0 && 'tw-bg-obsidian-700/50 tw-border tw-border-obsidian-600'
                    )}
                  >
                    <div className="tw-flex-shrink-0">
                      {submission.status === 'approved' && (
                        <CheckCircle className="tw-w-5 tw-h-5 tw-text-status-success" />
                      )}
                      {submission.status === 'rejected' && (
                        <XCircle className="tw-w-5 tw-h-5 tw-text-status-critical" />
                      )}
                      {submission.status === 'action_required' && (
                        <Clock className="tw-w-5 tw-h-5 tw-text-status-medium" />
                      )}
                    </div>
                    <div className="tw-flex-1">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <span className="tw-text-body tw-font-medium tw-text-obsidian-100">
                          v{submission.version}
                        </span>
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
                      </div>
                      <div className="tw-text-caption tw-text-obsidian-400 tw-mt-0.5">
                        Submitted {submission.submittedAt} - {submission.duration} days
                        {submission.outcome && ` - ${submission.outcome}`}
                      </div>
                    </div>
                    <ChevronRight className="tw-w-4 tw-h-4 tw-text-obsidian-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validation Findings */}
          <Card>
            <CardHeader
              title="Validation Findings"
              subtitle="Current issues requiring resolution"
            />
            <CardContent>
              <div className="tw-space-y-3">
                {validationFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className={cn(
                      'tw-p-4 tw-rounded-fluent tw-border',
                      finding.severity === 'must_fix'
                        ? 'tw-border-status-critical/30 tw-bg-status-critical/5'
                        : 'tw-border-status-medium/30 tw-bg-status-medium/5'
                    )}
                  >
                    <div className="tw-flex tw-items-start tw-justify-between tw-mb-2">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <Badge variant={finding.severity === 'must_fix' ? 'error' : 'warning'} size="sm">
                          {finding.severity === 'must_fix' ? 'Must Fix' : 'Should Fix'}
                        </Badge>
                        <span className="tw-text-body tw-font-medium tw-text-obsidian-200">
                          {finding.category}
                        </span>
                        {finding.raiFlag && (
                          <Badge variant="pink" size="sm">
                            RAI
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="tw-text-body tw-text-obsidian-300 tw-mb-2">{finding.message}</p>
                    <div className="tw-flex tw-items-start tw-gap-2 tw-p-2 tw-rounded tw-bg-obsidian-800">
                      <Sparkles className="tw-w-4 tw-h-4 tw-text-aurora-cyan tw-flex-shrink-0 tw-mt-0.5" />
                      <p className="tw-text-caption tw-text-obsidian-400">
                        <span className="tw-text-aurora-cyan tw-font-medium">Remediation: </span>
                        {finding.remediation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Quick Info */}
        <div className="tw-space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <div className="tw-space-y-2">
                <Button variant="primary" className="tw-w-full" leftIcon={<Sparkles className="tw-w-4 tw-h-4" />}>
                  Explain Failure
                </Button>
                <Button variant="secondary" className="tw-w-full">
                  Generate Remediation Plan
                </Button>
                <Button variant="secondary" className="tw-w-full">
                  Draft Partner Message
                </Button>
                <Button variant="ghost" className="tw-w-full">
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agent Info */}
          <Card>
            <CardHeader title="Agent Details" />
            <CardContent>
              <dl className="tw-space-y-3">
                <div className="tw-flex tw-justify-between">
                  <dt className="tw-text-caption tw-text-obsidian-400">Type</dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{formatType(agent.type)}</dd>
                </div>
                <div className="tw-flex tw-justify-between">
                  <dt className="tw-text-caption tw-text-obsidian-400">Category</dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{agent.category}</dd>
                </div>
                <div className="tw-flex tw-justify-between">
                  <dt className="tw-text-caption tw-text-obsidian-400">Distribution</dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{formatDistribution(agent.distributionMethod)}</dd>
                </div>
                <div className="tw-flex tw-justify-between">
                  <dt className="tw-text-caption tw-text-obsidian-400">Created</dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{agent.createdAt}</dd>
                </div>
                <div className="tw-flex tw-justify-between">
                  <dt className="tw-text-caption tw-text-obsidian-400">Last Published</dt>
                  <dd className="tw-text-body tw-text-obsidian-200">{agent.lastPublishedAt ?? 'Never'}</dd>
                </div>
                {agent.version && (
                  <div className="tw-flex tw-justify-between">
                    <dt className="tw-text-caption tw-text-obsidian-400">Version</dt>
                    <dd className="tw-text-body tw-text-obsidian-200">{agent.version}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Risk Summary */}
          <Card>
            <CardHeader title="Risk Summary" />
            <CardContent>
              <div className="tw-space-y-2">
                <div className="tw-flex tw-items-center tw-justify-between tw-p-2 tw-rounded tw-bg-status-critical/10">
                  <span className="tw-text-body tw-text-status-critical">SLA Breach Risk</span>
                  <Badge variant="error">14 days</Badge>
                </div>
                <div className="tw-flex tw-items-center tw-justify-between tw-p-2 tw-rounded tw-bg-status-medium/10">
                  <span className="tw-text-body tw-text-status-medium">Latency Issue</span>
                  <Badge variant="warning">p99: 3.2s</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
