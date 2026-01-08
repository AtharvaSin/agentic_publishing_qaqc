/**
 * Core entity type definitions
 */

import {
  AgentId,
  PublisherId,
  SubmissionId,
  IncidentId,
  ValidationFindingId,
} from './branded';
import {
  AgentType,
  AgentStatus,
  DistributionMethod,
  PublisherTier,
  Region,
  SubmissionStage,
  FailureCategory,
  Severity,
  IncidentSeverity,
} from '@/lib/constants';

/**
 * Publisher entity
 */
export interface Publisher {
  id: PublisherId;
  name: string;
  tier: PublisherTier;
  region: Region;
  supportPlan: 'premium' | 'standard' | 'community';
  createdAt: string;
  contactEmail?: string;
}

/**
 * Agent entity
 */
export interface Agent {
  id: AgentId;
  name: string;
  type: AgentType;
  category: string;
  description?: string;
  ownerId: PublisherId;
  distributionMethod: DistributionMethod;
  currentStatus: AgentStatus;
  createdAt: string;
  lastPublishedAt: string | null;
  version?: string;
}

/**
 * Validation finding for submissions
 */
export interface ValidationFinding {
  id: ValidationFindingId;
  ruleId: string;
  category: FailureCategory;
  severity: Severity;
  message: string;
  remediationHint: string;
  raiFlag: boolean;
}

/**
 * Stage duration tracking
 */
export interface StageDuration {
  stage: SubmissionStage;
  enteredAt: string;
  exitedAt?: string | undefined;
  durationDays: number;
}

/**
 * Submission entity
 */
export interface Submission {
  id: SubmissionId;
  agentId: AgentId;
  publisherId: PublisherId;
  version: string;
  stage: SubmissionStage;
  stageDurations: StageDuration[];
  validationFindings: ValidationFinding[];
  slaTargetDays: number;
  slaBreached: boolean;
  resubmissionCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | undefined;
  outcome?: 'approved' | 'rejected' | undefined;
}

/**
 * Incident entity (post-publish issues)
 */
export interface Incident {
  id: IncidentId;
  agentId: AgentId;
  severity: IncidentSeverity;
  title: string;
  description: string;
  causeCategory: string;
  openedAt: string;
  resolvedAt?: string | undefined;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

/**
 * Daily snapshot for metrics aggregation
 */
export interface DailySnapshot {
  date: string;
  submissions: number;
  approvals: number;
  rejections: number;
  backlogReview: number;
  backlogActionRequired: number;
  avgTimeToApprove: number;
  slaBreachCount: number;
  p50Latency: number;
  p75Latency: number;
  p99Latency: number;
  availabilityPct: number;
  raiPassRate: number;
  incidentsCount: number;
  failureCategories: Record<FailureCategory, number>;
}

/**
 * Computed metrics for dashboard
 */
export interface ComputedMetrics {
  // KPIs
  timeToPublishP50: number;
  timeToPublishP90: number;
  firstPassApprovalRate: number;
  slaComplianceRate: number;
  raiPassRate: number;
  activeIncidents: number;

  // Funnel
  stageDistribution: Record<SubmissionStage, number>;
  avgTimeInStage: Record<SubmissionStage, number>;
  backlogSize: number;
  oldestInQueue: number;

  // Quality
  latencyP50: number;
  latencyP75: number;
  latencyP99: number;
  availabilityPct: number;
  regressionCount: number;

  // Trends (arrays for charts)
  dailyTrends: DailySnapshot[];
}

/**
 * Filter parameters for queries
 */
export interface FilterParams {
  datePreset: string;
  startDate?: string;
  endDate?: string;
  publisher?: PublisherId | 'all';
  agentType?: AgentType | 'all';
  distributionMethod?: DistributionMethod | 'all';
  status?: AgentStatus | 'all';
  stage?: SubmissionStage | 'all';
}
