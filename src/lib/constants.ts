/**
 * Application-wide constants
 */

// Date presets for filtering
export const DATE_PRESETS = [
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '60 Days', value: '60d', days: 60 },
  { label: '90 Days', value: '90d', days: 90 },
] as const;

export type DatePresetValue = (typeof DATE_PRESETS)[number]['value'];

// Submission stages
export const SUBMISSION_STAGES = [
  'draft',
  'submitted',
  'automated_checks',
  'human_review',
  'action_required',
  'approved',
  'published',
  'rejected',
] as const;

export type SubmissionStage = (typeof SUBMISSION_STAGES)[number];

export const STAGE_LABELS: Record<SubmissionStage, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  automated_checks: 'Automated Checks',
  human_review: 'Human Review',
  action_required: 'Action Required',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
};

export const STAGE_COLORS: Record<SubmissionStage, string> = {
  draft: 'obsidian-400',
  submitted: 'aurora-blue',
  automated_checks: 'aurora-purple',
  human_review: 'aurora-teal',
  action_required: 'status-medium',
  approved: 'status-success',
  published: 'status-success',
  rejected: 'status-critical',
};

// Agent types
export const AGENT_TYPES = ['declarative', 'custom_engine', 'message_extension'] as const;
export type AgentType = (typeof AGENT_TYPES)[number];

export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  declarative: 'Declarative Agent',
  custom_engine: 'Custom Engine Agent',
  message_extension: 'Message Extension',
};

// Distribution methods
export const DISTRIBUTION_METHODS = ['org_catalog', 'teams_store', 'marketplace'] as const;
export type DistributionMethod = (typeof DISTRIBUTION_METHODS)[number];

export const DISTRIBUTION_LABELS: Record<DistributionMethod, string> = {
  org_catalog: 'Org Catalog',
  teams_store: 'Teams Store',
  marketplace: 'Marketplace',
};

// Publisher tiers
export const PUBLISHER_TIERS = ['strategic', 'standard', 'emerging'] as const;
export type PublisherTier = (typeof PUBLISHER_TIERS)[number];

export const TIER_LABELS: Record<PublisherTier, string> = {
  strategic: 'Strategic',
  standard: 'Standard',
  emerging: 'Emerging',
};

// Regions
export const REGIONS = ['NOAM', 'EMEA', 'APAC', 'LATAM'] as const;
export type Region = (typeof REGIONS)[number];

// Failure categories
export const FAILURE_CATEGORIES = [
  'manifest_mismatch',
  'metadata_issues',
  'policy_violation',
  'security_concerns',
  'functional_test',
  'rai_violation',
  'icons_screenshots',
  'test_instructions',
  'scope_permissions',
] as const;

export type FailureCategory = (typeof FAILURE_CATEGORIES)[number];

export const FAILURE_CATEGORY_LABELS: Record<FailureCategory, string> = {
  manifest_mismatch: 'Manifest Mismatch',
  metadata_issues: 'Metadata Issues',
  policy_violation: 'Policy Violation',
  security_concerns: 'Security Concerns',
  functional_test: 'Functional Test Failure',
  rai_violation: 'RAI Violation',
  icons_screenshots: 'Icons/Screenshots',
  test_instructions: 'Test Instructions',
  scope_permissions: 'Scope/Permissions',
};

export const FAILURE_CATEGORY_COLORS: Record<FailureCategory, string> = {
  manifest_mismatch: 'aurora-cyan',
  metadata_issues: 'aurora-blue',
  policy_violation: 'status-critical',
  security_concerns: 'status-critical',
  functional_test: 'aurora-purple',
  rai_violation: 'status-high',
  icons_screenshots: 'aurora-teal',
  test_instructions: 'status-medium',
  scope_permissions: 'aurora-pink',
};

// Severity levels
export const SEVERITIES = ['must_fix', 'should_fix', 'good_to_fix'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_LABELS: Record<Severity, string> = {
  must_fix: 'Must Fix',
  should_fix: 'Should Fix',
  good_to_fix: 'Good to Fix',
};

// Incident severities
export const INCIDENT_SEVERITIES = ['sev0', 'sev1', 'sev2', 'sev3'] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

// Status types
export const AGENT_STATUSES = [
  'active',
  'pending_review',
  'action_required',
  'suspended',
  'draft',
] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const STATUS_LABELS: Record<AgentStatus, string> = {
  active: 'Active',
  pending_review: 'Pending Review',
  action_required: 'Action Required',
  suspended: 'Suspended',
  draft: 'Draft',
};

export const STATUS_COLORS: Record<AgentStatus, string> = {
  active: 'status-success',
  pending_review: 'aurora-blue',
  action_required: 'status-medium',
  suspended: 'status-critical',
  draft: 'obsidian-400',
};

// SLA thresholds
export const SLA_THRESHOLDS = {
  standard: 7, // 7 days for standard submissions
  fast_track: 3, // 3 days for fast-track
  critical: 1, // 1 day for critical fixes
} as const;

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  p99_latency_ms: 3000, // 3 seconds
  p95_latency_ms: 2000,
  p50_latency_ms: 500,
  availability_percent: 99.5,
  error_rate_percent: 1,
  rai_pass_rate: 95,
} as const;

// Chart colors (for Recharts)
export const CHART_COLORS = {
  primary: '#00D4FF', // aurora-cyan
  secondary: '#8B5CF6', // aurora-purple
  tertiary: '#EC4899', // aurora-pink
  quaternary: '#3B82F6', // aurora-blue
  quinary: '#14B8A6', // aurora-teal
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: '#6B7280',
} as const;

// Navigation items
export const NAV_ITEMS = [
  { label: 'Overview', href: '/overview', icon: 'LayoutDashboard' },
  { label: 'Funnel', href: '/funnel', icon: 'Filter' },
  { label: 'Quality', href: '/quality', icon: 'ShieldCheck' },
  { label: 'Agents', href: '/agents', icon: 'Bot' },
  { label: 'Publishers', href: '/publishers', icon: 'Building2' },
] as const;

// API endpoints
export const API_ENDPOINTS = {
  agents: '/api/agents',
  publishers: '/api/publishers',
  submissions: '/api/submissions',
  metrics: '/api/metrics',
  snapshots: '/api/snapshots',
  incidents: '/api/incidents',
  copilot: '/api/copilot',
} as const;

// Refresh intervals (ms)
export const REFRESH_INTERVALS = {
  realtime: 5000,
  frequent: 30000,
  standard: 60000,
  background: 300000,
} as const;
