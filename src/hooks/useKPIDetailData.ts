'use client';

import { useMemo } from 'react';
import { useSnapshots } from './useMetrics';
import type { KPIDetailData } from '@/components/features/overview/KPIDetailModal';
import type { SparklineDataPoint } from '@/components/features/overview/SparklineChart';

interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Get date range for the last N days
 */
function getDateRange(days: number): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0] as string,
    endDate: endDate.toISOString().split('T')[0] as string,
  };
}

/**
 * Hook to generate KPI detail data for modals
 */
export function useKPIDetailData(kpiId: string): {
  data: KPIDetailData | null;
  isLoading: boolean;
  error: Error | null;
} {
  // Get 30-day snapshot data
  const dateRange = useMemo(() => getDateRange(30), []);
  const { data: snapshotsResponse, isLoading, error } = useSnapshots(dateRange);

  // Generate KPI detail data based on the kpiId
  const kpiDetailData = useMemo((): KPIDetailData | null => {
    if (!snapshotsResponse?.data || snapshotsResponse.data.length === 0) {
      return null;
    }

    const snapshots = snapshotsResponse.data;
    const last7Days = snapshots.slice(-7);
    const previous7Days = snapshots.slice(-14, -7);

    switch (kpiId) {
      case 'time-to-publish':
        return generateTimeToPublishData(snapshots, last7Days, previous7Days);
      case 'approval-rate':
        return generateApprovalRateData(snapshots, last7Days, previous7Days);
      case 'sla-compliance':
        return generateSLAComplianceData(snapshots, last7Days, previous7Days);
      case 'rai-pass':
        return generateRAIPassRateData(snapshots, last7Days, previous7Days);
      case 'incidents':
        return generateIncidentsData(snapshots, last7Days, previous7Days);
      default:
        return null;
    }
  }, [snapshotsResponse?.data, kpiId]);

  return {
    data: kpiDetailData,
    isLoading,
    error: error as Error | null,
  };
}

// Helper to calculate average from snapshots
function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

// Generate Time to Publish KPI data
function generateTimeToPublishData(
  _allSnapshots: Array<{ date: string; avgTimeToApprove: number; backlogReview: number; backlogActionRequired: number }>,
  last7Days: Array<{ date: string; avgTimeToApprove: number; backlogReview: number; backlogActionRequired: number }>,
  previous7Days: Array<{ date: string; avgTimeToApprove: number }>
): KPIDetailData {
  const currentAvg = calculateAverage(last7Days.map((s) => s.avgTimeToApprove));
  const previousAvg = calculateAverage(previous7Days.map((s) => s.avgTimeToApprove));

  // Generate sparkline data
  const sparklineData: SparklineDataPoint[] = last7Days.map((s) => ({
    value: Math.round(s.avgTimeToApprove * 10) / 10,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Stage breakdown (simulated based on typical patterns)
  const totalDays = currentAvg;
  const breakdown = [
    {
      label: 'Submission → Review',
      value: `${(totalDays * 0.28).toFixed(1)} days`,
      subLabel: '28% of total',
    },
    {
      label: 'Review → Decision',
      value: `${(totalDays * 0.5).toFixed(1)} days`,
      subLabel: '50% of total',
      highlight: true,
    },
    {
      label: 'Decision → Published',
      value: `${(totalDays * 0.22).toFixed(1)} days`,
      subLabel: '22% of total',
    },
  ];

  // Additional metrics
  const lastSnapshot = last7Days[last7Days.length - 1];
  const additionalMetrics = [
    { label: 'In Review', value: lastSnapshot?.backlogReview ?? 0 },
    { label: 'Action Required', value: lastSnapshot?.backlogActionRequired ?? 0, subValue: 'agents stuck' },
    { label: 'P90 Time', value: `${(currentAvg * 1.8).toFixed(1)}d` },
  ];

  return {
    id: 'time-to-publish',
    value: Math.round(currentAvg * 10) / 10,
    previousValue: Math.round(previousAvg * 10) / 10,
    sparklineData,
    breakdown,
    additionalMetrics,
    contextData: {
      bottleneck: 'Review → Decision stage',
      stuckAgents: lastSnapshot?.backlogActionRequired ?? 0,
    },
  };
}

// Generate Approval Rate KPI data
function generateApprovalRateData(
  _allSnapshots: Array<{ date: string; submissions: number; approvals: number; rejections: number; failureCategories: Record<string, number> }>,
  last7Days: Array<{ date: string; submissions: number; approvals: number; failureCategories: Record<string, number> }>,
  previous7Days: Array<{ date: string; submissions: number; approvals: number }>
): KPIDetailData {
  const last7Submissions = last7Days.reduce((sum, s) => sum + s.submissions, 0);
  const last7Approvals = last7Days.reduce((sum, s) => sum + s.approvals, 0);
  const prev7Submissions = previous7Days.reduce((sum, s) => sum + s.submissions, 0);
  const prev7Approvals = previous7Days.reduce((sum, s) => sum + s.approvals, 0);

  const currentRate = last7Submissions > 0 ? (last7Approvals / last7Submissions) * 100 : 0;
  const previousRate = prev7Submissions > 0 ? (prev7Approvals / prev7Submissions) * 100 : 0;

  // Generate sparkline data (daily approval rate)
  const sparklineData: SparklineDataPoint[] = last7Days.map((s) => ({
    value: s.submissions > 0 ? Math.round((s.approvals / s.submissions) * 100) : 0,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Aggregate failure categories
  const failureTotals: Record<string, number> = {};
  last7Days.forEach((s) => {
    Object.entries(s.failureCategories).forEach(([cat, count]) => {
      failureTotals[cat] = (failureTotals[cat] ?? 0) + count;
    });
  });

  // Top failures as breakdown
  const sortedFailures = Object.entries(failureTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalFailures = sortedFailures.reduce((sum, [, count]) => sum + count, 0);
  const breakdown = sortedFailures.map(([category, count], index) => {
    const baseItem = {
      label: formatCategoryLabel(category),
      value: count,
      subLabel: `${totalFailures > 0 ? Math.round((count / totalFailures) * 100) : 0}%`,
      highlight: index === 0,
    };
    if (index === 0) {
      return { ...baseItem, trend: 'up' as const };
    }
    return baseItem;
  });

  const additionalMetrics = [
    { label: 'Submissions', value: last7Submissions },
    { label: 'Approvals', value: last7Approvals },
    { label: 'Target', value: '80%' },
  ];

  return {
    id: 'approval-rate',
    value: Math.round(currentRate),
    previousValue: Math.round(previousRate),
    sparklineData,
    breakdown,
    additionalMetrics,
    contextData: {
      affectedPublishers: 4,
    },
  };
}

// Generate SLA Compliance KPI data
function generateSLAComplianceData(
  _allSnapshots: Array<{ date: string; slaBreachCount: number; backlogReview: number; backlogActionRequired: number }>,
  last7Days: Array<{ date: string; slaBreachCount: number; backlogReview: number }>,
  previous7Days: Array<{ date: string; slaBreachCount: number }>
): KPIDetailData {
  // Calculate compliance (inverse of breach rate)
  const last7Breaches = last7Days.reduce((sum, s) => sum + s.slaBreachCount, 0);
  const prev7Breaches = previous7Days.reduce((sum, s) => sum + s.slaBreachCount, 0);

  // Assuming ~10 active submissions per day on average
  const estimatedActiveLast7 = last7Days.length * 10;
  const estimatedActivePrev7 = previous7Days.length * 10;

  const currentCompliance = estimatedActiveLast7 > 0
    ? Math.max(0, 100 - (last7Breaches / estimatedActiveLast7) * 100 * 5)
    : 82;
  const previousCompliance = estimatedActivePrev7 > 0
    ? Math.max(0, 100 - (prev7Breaches / estimatedActivePrev7) * 100 * 5)
    : 90;

  // Sparkline shows daily breach counts (inverted for visual)
  const sparklineData: SparklineDataPoint[] = last7Days.map((s) => ({
    value: Math.max(0, 100 - s.slaBreachCount * 10),
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const breakdown = [
    { label: 'Standard SLA (5 days)', value: '87%', subLabel: 'compliance' },
    { label: 'Expedited SLA (2 days)', value: '72%', subLabel: 'compliance', highlight: true },
    { label: 'Enterprise SLA (3 days)', value: '91%', subLabel: 'compliance' },
  ];

  const lastSnapshot = last7Days[last7Days.length - 1];
  const additionalMetrics = [
    { label: 'Current Breaches', value: lastSnapshot?.slaBreachCount ?? 0 },
    { label: 'At Risk', value: Math.max(0, (lastSnapshot?.backlogReview ?? 0) - 2), subValue: '24-48 hrs' },
    { label: 'SLA Target', value: '95%' },
  ];

  return {
    id: 'sla-compliance',
    value: Math.round(currentCompliance),
    previousValue: Math.round(previousCompliance),
    sparklineData,
    breakdown,
    additionalMetrics,
    contextData: {
      breachCount: lastSnapshot?.slaBreachCount ?? 0,
      atRiskCount: Math.max(0, (lastSnapshot?.backlogReview ?? 0) - 2),
      topPublishers: ['Contoso Ltd', 'Fabrikam Inc'],
    },
  };
}

// Generate RAI Pass Rate KPI data
function generateRAIPassRateData(
  _allSnapshots: Array<{ date: string; raiPassRate: number; failureCategories: Record<string, number> }>,
  last7Days: Array<{ date: string; raiPassRate: number; failureCategories: Record<string, number> }>,
  previous7Days: Array<{ date: string; raiPassRate: number }>
): KPIDetailData {
  const currentRate = calculateAverage(last7Days.map((s) => s.raiPassRate));
  const previousRate = calculateAverage(previous7Days.map((s) => s.raiPassRate));

  const sparklineData: SparklineDataPoint[] = last7Days.map((s) => ({
    value: Math.round(s.raiPassRate),
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // RAI-specific breakdown
  const raiFailures = last7Days.reduce((sum, s) => sum + (s.failureCategories['rai_violation'] ?? 0), 0);

  const breakdown = [
    { label: 'Content Policy', value: Math.round(raiFailures * 0.4), subLabel: 'failures' },
    { label: 'Prompt Safety', value: Math.round(raiFailures * 0.25), subLabel: 'failures' },
    { label: 'Output Guardrails', value: Math.round(raiFailures * 0.2), subLabel: 'failures' },
    { label: 'Harmful Content', value: Math.round(raiFailures * 0.15), subLabel: 'failures', highlight: true },
  ];

  const additionalMetrics = [
    { label: 'Declarative', value: '94%', subValue: 'pass rate' },
    { label: 'Custom Engine', value: '87%', subValue: 'pass rate' },
    { label: 'Target', value: '95%' },
  ];

  return {
    id: 'rai-pass',
    value: Math.round(currentRate),
    previousValue: Math.round(previousRate),
    sparklineData,
    breakdown,
    additionalMetrics,
    contextData: {
      recentFailures: raiFailures,
      agentTypeImpact: {
        declarative: 6,
        custom_engine: 13,
      },
    },
  };
}

// Generate Incidents KPI data
function generateIncidentsData(
  _allSnapshots: Array<{ date: string; incidentsCount: number }>,
  last7Days: Array<{ date: string; incidentsCount: number }>,
  previous7Days: Array<{ date: string; incidentsCount: number }>
): KPIDetailData {
  const lastSnapshot = last7Days[last7Days.length - 1];
  const currentCount = lastSnapshot?.incidentsCount ?? 3;
  const prevLastSnapshot = previous7Days[previous7Days.length - 1];
  const previousCount = prevLastSnapshot?.incidentsCount ?? 1;

  const sparklineData: SparklineDataPoint[] = last7Days.map((s) => ({
    value: s.incidentsCount,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Incident severity breakdown (simulated)
  const breakdown = [
    { label: 'Critical', value: 1, subLabel: 'immediate attention', highlight: true },
    { label: 'High', value: 1, subLabel: 'within 24 hours' },
    { label: 'Medium', value: 1, subLabel: 'within 72 hours' },
  ];

  const additionalMetrics = [
    { label: 'Avg Resolution', value: '18h' },
    { label: 'Users Impacted', value: '~2.4k' },
    { label: 'MTTR Target', value: '24h' },
  ];

  return {
    id: 'incidents',
    value: currentCount,
    previousValue: previousCount,
    sparklineData,
    breakdown,
    additionalMetrics,
    contextData: {
      criticalCount: 1,
      topIncident: {
        name: 'Sales Assistant Pro',
        impact: '1.2k users',
      },
    },
  };
}

// Helper to format category labels
function formatCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    rai_violation: 'RAI Violation',
    metadata_issues: 'Metadata Issues',
    manifest_mismatch: 'Manifest Mismatch',
    policy_violation: 'Policy Violation',
    security_concerns: 'Security Issues',
    functional_test: 'Functional Test',
    icons_screenshots: 'Icons/Screenshots',
    test_instructions: 'Test Instructions',
    scope_permissions: 'Scope/Permissions',
  };
  return labels[category] ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default useKPIDetailData;
