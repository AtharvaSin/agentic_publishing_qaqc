/**
 * Synthetic daily snapshot data for metrics aggregation
 */

import { DailySnapshot } from '@/types/entities';
import { FailureCategory, FAILURE_CATEGORIES } from '@/lib/constants';
import { random, toDateString, subtractDays } from './generator';
import { submissions } from './submissions';

// Generate daily snapshots for the past 60 days
function generateSnapshots(): DailySnapshot[] {
  const snapshots: DailySnapshot[] = [];
  const today = new Date();

  for (let i = 60; i >= 0; i--) {
    const date = subtractDays(today, i);
    const dateStr = toDateString(date);

    // Get submissions for this day
    const daySubmissions = submissions.filter((s) => s.createdAt === dateStr);
    const dayApprovals = submissions.filter(
      (s) => s.completedAt === dateStr && s.outcome === 'approved'
    );
    const dayRejections = submissions.filter(
      (s) => s.completedAt === dateStr && s.outcome === 'rejected'
    );

    // Calculate backlog (submissions in review stages)
    const backlogReview = submissions.filter(
      (s) =>
        s.createdAt <= dateStr &&
        (!s.completedAt || s.completedAt > dateStr) &&
        s.stage === 'human_review'
    ).length;

    const backlogAction = submissions.filter(
      (s) =>
        s.createdAt <= dateStr &&
        (!s.completedAt || s.completedAt > dateStr) &&
        s.stage === 'action_required'
    ).length;

    // Calculate SLA breaches
    const slaBreaches = submissions.filter(
      (s) => s.slaBreached && s.createdAt <= dateStr && (!s.completedAt || s.completedAt > dateStr)
    ).length;

    // Generate latency metrics with some variance
    // Add a "scenario" where latency degrades in weeks 3-4
    const weekNum = Math.floor(i / 7);
    const latencyMultiplier = weekNum === 2 || weekNum === 3 ? 1.3 : 1.0;

    const baseP50 = 400 + random.int(-50, 50);
    const baseP75 = 800 + random.int(-100, 100);
    const baseP99 = 2200 + random.int(-200, 300);

    // Generate failure categories distribution
    const failureCategories: Record<FailureCategory, number> = {} as Record<FailureCategory, number>;
    for (const category of FAILURE_CATEGORIES) {
      failureCategories[category] = random.int(0, 5);
    }

    // Add RAI spike scenario for days 45-60 (recent days)
    if (i < 15) {
      failureCategories.rai_violation = random.int(3, 8);
    }

    snapshots.push({
      date: dateStr,
      submissions: daySubmissions.length || random.int(3, 8),
      approvals: dayApprovals.length || random.int(2, 6),
      rejections: dayRejections.length || random.int(0, 2),
      backlogReview: backlogReview || random.int(30, 50),
      backlogActionRequired: backlogAction || random.int(15, 30),
      avgTimeToApprove: random.float(3, 6),
      slaBreachCount: slaBreaches || random.int(0, 3),
      p50Latency: Math.round(baseP50 * latencyMultiplier),
      p75Latency: Math.round(baseP75 * latencyMultiplier),
      p99Latency: Math.round(baseP99 * latencyMultiplier),
      availabilityPct: random.float(99.2, 99.9),
      raiPassRate: i < 15 ? random.float(85, 92) : random.float(92, 98),
      incidentsCount: random.int(0, 2),
      failureCategories,
    });
  }

  return snapshots;
}

export const snapshots = generateSnapshots();

// Helper to get snapshots in range
export function getSnapshotsInRange(startDate: string, endDate: string): DailySnapshot[] {
  return snapshots.filter((s) => s.date >= startDate && s.date <= endDate);
}

// Helper to get latest snapshot
export function getLatestSnapshot(): DailySnapshot | undefined {
  return snapshots[snapshots.length - 1];
}

// Helper to calculate average over range
export function calculateAverages(
  snapshotRange: DailySnapshot[]
): {
  avgSubmissions: number;
  avgApprovals: number;
  avgTimeToApprove: number;
  avgSlaBreaches: number;
  avgRaiPassRate: number;
} {
  const count = snapshotRange.length;
  if (count === 0) {
    return {
      avgSubmissions: 0,
      avgApprovals: 0,
      avgTimeToApprove: 0,
      avgSlaBreaches: 0,
      avgRaiPassRate: 0,
    };
  }

  return {
    avgSubmissions: snapshotRange.reduce((sum, s) => sum + s.submissions, 0) / count,
    avgApprovals: snapshotRange.reduce((sum, s) => sum + s.approvals, 0) / count,
    avgTimeToApprove: snapshotRange.reduce((sum, s) => sum + s.avgTimeToApprove, 0) / count,
    avgSlaBreaches: snapshotRange.reduce((sum, s) => sum + s.slaBreachCount, 0) / count,
    avgRaiPassRate: snapshotRange.reduce((sum, s) => sum + s.raiPassRate, 0) / count,
  };
}
