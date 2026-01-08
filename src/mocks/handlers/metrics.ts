/**
 * MSW handlers for metrics API
 */

import { http, HttpResponse, delay } from 'msw';
import { snapshots, getSnapshotsInRange } from '@/data/snapshots';
import { submissions } from '@/data/submissions';
import { incidents, getOpenIncidents } from '@/data/incidents';
import { API_ENDPOINTS, SUBMISSION_STAGES, SubmissionStage } from '@/lib/constants';
import { toDateString, subtractDays } from '@/data/generator';

export const metricsHandlers = [
  // Get daily snapshots
  http.get(API_ENDPOINTS.snapshots, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let filteredSnapshots = [...snapshots];

    if (startDate && endDate) {
      filteredSnapshots = getSnapshotsInRange(startDate, endDate);
    }

    return HttpResponse.json({
      data: filteredSnapshots,
      total: filteredSnapshots.length,
    });
  }),

  // Get computed metrics
  http.get(API_ENDPOINTS.metrics, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') ?? '30', 10);
    const today = new Date();
    const startDate = toDateString(subtractDays(today, days));
    const endDate = toDateString(today);

    const rangeSnapshots = getSnapshotsInRange(startDate, endDate);
    const latestSnapshot = rangeSnapshots[rangeSnapshots.length - 1];

    // Calculate stage distribution
    const stageDistribution: Record<SubmissionStage, number> = {} as Record<SubmissionStage, number>;
    for (const stage of SUBMISSION_STAGES) {
      stageDistribution[stage] = submissions.filter((s) => s.stage === stage).length;
    }

    // Calculate average time in stage
    const avgTimeInStage: Record<SubmissionStage, number> = {} as Record<SubmissionStage, number>;
    for (const stage of SUBMISSION_STAGES) {
      const stageSubmissions = submissions.filter((s) => {
        const stageDuration = s.stageDurations.find((d) => d.stage === stage);
        return stageDuration && stageDuration.durationDays > 0;
      });
      if (stageSubmissions.length > 0) {
        const totalDays = stageSubmissions.reduce((sum, s) => {
          const duration = s.stageDurations.find((d) => d.stage === stage);
          return sum + (duration?.durationDays ?? 0);
        }, 0);
        avgTimeInStage[stage] = Math.round((totalDays / stageSubmissions.length) * 10) / 10;
      } else {
        avgTimeInStage[stage] = 0;
      }
    }

    // Calculate backlog
    const backlog = submissions.filter(
      (s) => s.stage === 'human_review' || s.stage === 'action_required'
    );

    // Calculate oldest in queue
    const oldestSubmission = backlog.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    const oldestDays = oldestSubmission
      ? Math.floor((today.getTime() - new Date(oldestSubmission.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate approval metrics
    const rangeSubmissions = submissions.filter(
      (s) => s.createdAt >= startDate && s.createdAt <= endDate
    );
    const completedSubmissions = rangeSubmissions.filter((s) => s.outcome);
    const approvedSubmissions = completedSubmissions.filter((s) => s.outcome === 'approved');
    const firstPassApproved = approvedSubmissions.filter((s) => s.resubmissionCount === 0);

    // Calculate SLA compliance
    const slaCompliant = completedSubmissions.filter((s) => !s.slaBreached);

    const metrics = {
      // KPIs
      timeToPublishP50: latestSnapshot?.avgTimeToApprove ?? 4.2,
      timeToPublishP90: (latestSnapshot?.avgTimeToApprove ?? 4.2) * 1.8,
      firstPassApprovalRate:
        completedSubmissions.length > 0
          ? Math.round((firstPassApproved.length / completedSubmissions.length) * 100)
          : 68,
      slaComplianceRate:
        completedSubmissions.length > 0
          ? Math.round((slaCompliant.length / completedSubmissions.length) * 100)
          : 82,
      raiPassRate: latestSnapshot?.raiPassRate ?? 91,
      activeIncidents: getOpenIncidents().length,

      // Funnel
      stageDistribution,
      avgTimeInStage,
      backlogSize: backlog.length,
      oldestInQueue: oldestDays,

      // Quality
      latencyP50: latestSnapshot?.p50Latency ?? 450,
      latencyP75: latestSnapshot?.p75Latency ?? 850,
      latencyP99: latestSnapshot?.p99Latency ?? 2500,
      availabilityPct: latestSnapshot?.availabilityPct ?? 99.6,
      regressionCount: 2,

      // Trends
      dailyTrends: rangeSnapshots,
    };

    return HttpResponse.json({ data: metrics });
  }),

  // Get incidents
  http.get(API_ENDPOINTS.incidents, async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const status = url.searchParams.get('status');

    let filteredIncidents = [...incidents];

    if (agentId) {
      filteredIncidents = filteredIncidents.filter((i) => i.agentId === agentId);
    }

    if (status && status !== 'all') {
      filteredIncidents = filteredIncidents.filter((i) => i.status === status);
    }

    return HttpResponse.json({
      data: filteredIncidents,
      total: filteredIncidents.length,
    });
  }),
];
