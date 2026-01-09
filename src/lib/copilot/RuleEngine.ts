/**
 * Deterministic Rule Engine for AI Insights
 * Matches prompts to patterns and generates context-aware responses
 */

import {
  AIResponse,
  PatternRule,
  DataContext,
  KeyDriver,
  Recommendation,
  CopilotScenario,
} from '@/types/copilot';
// ComputedMetrics and DailySnapshot types are used via DataContext
import { FAILURE_CATEGORY_LABELS, STAGE_LABELS } from '@/lib/constants';
import {
  interpolateTemplate,
  selectTemplate,
  BOTTLENECK_TEMPLATES,
  RECOMMENDATION_TEMPLATES,
} from './templates';

/**
 * Pattern rules for the AI engine
 * Rules are evaluated in priority order (highest first)
 */
const PATTERN_RULES: PatternRule[] = [
  // Weekly update generation
  {
    id: 'weekly_update',
    name: 'Generate Weekly Update',
    patterns: [
      /weekly\s*update/i,
      /stakeholder\s*(update|summary)/i,
      /generate\s*(update|summary|report)/i,
      /status\s*report/i,
    ],
    priority: 100,
    handler: generateWeeklyUpdate,
  },

  // Bottleneck analysis
  {
    id: 'bottleneck',
    name: 'Bottleneck Analysis',
    patterns: [
      /bottleneck/i,
      /what.*(stuck|blocked|delayed)/i,
      /why.*(slow|waiting|backlog)/i,
      /where.*(congestion|backup)/i,
      /backlog.*grow/i,
    ],
    priority: 95,
    handler: analyzeBottleneck,
  },

  // Failure analysis
  {
    id: 'failures',
    name: 'Failure Analysis',
    patterns: [
      /fail(ure|ed|ing)?\s*(reason|cause|why)/i,
      /top\s*fail/i,
      /why.*(reject|fail)/i,
      /what.*(fail|reject)/i,
    ],
    priority: 90,
    handler: analyzeFailures,
  },

  // At-risk agents
  {
    id: 'at_risk',
    name: 'At-Risk Agents',
    patterns: [
      /at.?risk/i,
      /need(ing)?\s*attention/i,
      /critical\s*agents/i,
      /agents.*(problem|issue|concern)/i,
    ],
    priority: 85,
    handler: analyzeAtRiskAgents,
  },

  // SLA analysis
  {
    id: 'sla',
    name: 'SLA Analysis',
    patterns: [
      /sla/i,
      /compliance/i,
      /service\s*level/i,
      /target.*(met|miss)/i,
    ],
    priority: 80,
    handler: analyzeSLA,
  },

  // Quality/readiness analysis
  {
    id: 'quality',
    name: 'Quality Analysis',
    patterns: [
      /quality/i,
      /readiness/i,
      /latency/i,
      /availability/i,
      /threshold/i,
      /violation/i,
    ],
    priority: 75,
    handler: analyzeQuality,
  },

  // RAI analysis
  {
    id: 'rai',
    name: 'RAI Analysis',
    patterns: [
      /rai/i,
      /responsible\s*ai/i,
      /safety/i,
      /ai\s*check/i,
    ],
    priority: 70,
    handler: analyzeRAI,
  },

  // Submission triage (agent detail)
  {
    id: 'triage',
    name: 'Submission Triage',
    patterns: [
      /explain.*(fail|issue|problem)/i,
      /fix\s*(checklist|list|steps)/i,
      /remediat/i,
      /what.*(wrong|fix)/i,
      /submission\s*history/i,
    ],
    contextMatch: (ctx) => ctx.currentPage === 'agent-detail' && !!ctx.selectedEntity,
    priority: 100,
    handler: triageSubmission,
  },

  // Publisher coaching
  {
    id: 'coaching',
    name: 'Publisher Coaching',
    patterns: [
      /coach/i,
      /publisher.*(assessment|review|summary)/i,
      /recurring\s*(issue|fail|pattern)/i,
      /qbr/i,
      /improvement/i,
    ],
    contextMatch: (ctx) =>
      ctx.currentPage === 'publisher-detail' ||
      (ctx.currentPage === 'publishers' && !!ctx.selectedEntity),
    priority: 100,
    handler: generatePublisherCoaching,
  },

  // General summary (fallback)
  {
    id: 'summarize',
    name: 'Summarize View',
    patterns: [/summarize/i, /summary/i, /overview/i, /what.*(see|show)/i],
    priority: 50,
    handler: generateSummary,
  },
];

/**
 * Main rule engine class
 */
export class RuleEngine {
  private rules: PatternRule[];

  constructor() {
    this.rules = [...PATTERN_RULES].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process a prompt and return AI response
   */
  process(prompt: string, context: DataContext): AIResponse {
    const startTime = Date.now();

    // Find matching rule
    const matchedRule = this.findMatchingRule(prompt, context);

    if (matchedRule) {
      const response = matchedRule.handler(prompt, context);
      response.metadata.processingTime = Date.now() - startTime;
      return response;
    }

    // Fallback to general summary
    const response = generateSummary(prompt, context);
    response.metadata.processingTime = Date.now() - startTime;
    return response;
  }

  /**
   * Find the first matching rule for the prompt
   */
  private findMatchingRule(prompt: string, context: DataContext): PatternRule | null {
    for (const rule of this.rules) {
      // Check if any pattern matches
      const patternMatch = rule.patterns.some((pattern) => pattern.test(prompt));
      if (!patternMatch) continue;

      // Check context match if defined
      if (rule.contextMatch && !rule.contextMatch(context)) continue;

      return rule;
    }
    return null;
  }
}

// ============================================================================
// Handler Functions
// ============================================================================

function generateWeeklyUpdate(_prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;
  const trends = context.dailyTrends || [];

  // Calculate week-over-week changes
  const recentWeek = trends.slice(-7);
  const previousWeek = trends.slice(-14, -7);

  const recentSubmissions = recentWeek.reduce((sum, d) => sum + d.submissions, 0);
  const previousSubmissions = previousWeek.reduce((sum, d) => sum + d.submissions, 0);
  const submissionChange = previousSubmissions
    ? ((recentSubmissions - previousSubmissions) / previousSubmissions) * 100
    : 0;

  const recentApprovals = recentWeek.reduce((sum, d) => sum + d.approvals, 0);
  const approvalRate = recentSubmissions ? (recentApprovals / recentSubmissions) * 100 : 0;

  const summary = `Weekly Publishing Operations Summary

📊 **This Week's Numbers:**
- Total Submissions: ${recentSubmissions} (${submissionChange >= 0 ? '+' : ''}${submissionChange.toFixed(0)}% vs last week)
- Approvals: ${recentApprovals} (${approvalRate.toFixed(0)}% approval rate)
- SLA Compliance: ${metrics?.slaComplianceRate?.toFixed(0) || 'N/A'}%
- Review Backlog: ${metrics?.backlogSize || 0} items
- Active Incidents: ${metrics?.activeIncidents || 0}

📈 **Key Trends:**
- First-pass approval rate: ${metrics?.firstPassApprovalRate?.toFixed(0) || 'N/A'}%
- Average time to publish (p50): ${metrics?.timeToPublishP50?.toFixed(1) || 'N/A'} days
- RAI pass rate: ${metrics?.raiPassRate?.toFixed(0) || 'N/A'}%`;

  const keyDrivers: KeyDriver[] = [];

  if (metrics?.slaComplianceRate && metrics.slaComplianceRate < 90) {
    keyDrivers.push({
      driver: `SLA compliance at ${metrics.slaComplianceRate.toFixed(0)}%, below 90% target`,
      impact: 'high',
      metric: 'SLA Compliance',
      delta: metrics.slaComplianceRate - 90,
    });
  }

  if (metrics?.backlogSize && metrics.backlogSize > 20) {
    keyDrivers.push({
      driver: `Review backlog at ${metrics.backlogSize} items requires attention`,
      impact: 'high',
      metric: 'Backlog Size',
    });
  }

  if (metrics?.raiPassRate && metrics.raiPassRate < 95) {
    keyDrivers.push({
      driver: `RAI pass rate dropped to ${metrics.raiPassRate.toFixed(0)}%`,
      impact: 'medium',
      metric: 'RAI Pass Rate',
    });
  }

  const recommendations: Recommendation[] = [];

  if (metrics?.backlogSize && metrics.backlogSize > 20) {
    recommendations.push({
      action: 'Prioritize clearing the review backlog to improve SLA compliance',
      priority: 'high',
    });
  }

  recommendations.push({
    action: 'Review publishers with highest failure rates for coaching opportunities',
    priority: 'medium',
  });

  recommendations.push({
    action: 'Monitor RAI validation changes and communicate updates to publishers',
    priority: 'medium',
  });

  return createResponse(summary, keyDrivers, recommendations, 'weekly_summary', [
    'Add more detail on failures',
    'Include publisher breakdown',
    'Format for email',
  ]);
}

function analyzeBottleneck(_prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;

  if (!metrics) {
    return createErrorResponse('No metrics data available for bottleneck analysis');
  }

  // Find the stage with most items
  const stageDistribution = metrics.stageDistribution;
  const bottleneckStage = Object.entries(stageDistribution)
    .filter(([stage]) => !['approved', 'published', 'rejected', 'draft'].includes(stage))
    .sort(([, a], [, b]) => b - a)[0];

  const avgTimeInStage = metrics.avgTimeInStage;
  const slowestStage = Object.entries(avgTimeInStage)
    .filter(([stage]) => !['approved', 'published', 'rejected', 'draft'].includes(stage))
    .sort(([, a], [, b]) => b - a)[0];

  const bottleneckName = bottleneckStage
    ? STAGE_LABELS[bottleneckStage[0] as keyof typeof STAGE_LABELS] || bottleneckStage[0]
    : 'Unknown';

  const template = selectTemplate(BOTTLENECK_TEMPLATES.templates);
  const summary = interpolateTemplate(template, {
    stage: bottleneckName,
    count: bottleneckStage?.[1] ?? 0,
    avgDays: slowestStage?.[1] !== undefined ? Number(slowestStage[1].toFixed(1)) : 0,
  });

  const keyDrivers: KeyDriver[] = [];

  if (bottleneckStage) {
    keyDrivers.push({
      driver: `${bottleneckName} has ${bottleneckStage[1]} items queued`,
      impact: bottleneckStage[1] > 15 ? 'critical' : bottleneckStage[1] > 8 ? 'high' : 'medium',
      metric: 'Queue Size',
    });
  }

  if (slowestStage && slowestStage[1] > 3) {
    const slowestName = STAGE_LABELS[slowestStage[0] as keyof typeof STAGE_LABELS] || slowestStage[0];
    keyDrivers.push({
      driver: `Average time in ${slowestName}: ${slowestStage[1].toFixed(1)} days`,
      impact: slowestStage[1] > 5 ? 'high' : 'medium',
      metric: 'Stage Duration',
    });
  }

  if (metrics.backlogSize > 20) {
    keyDrivers.push({
      driver: `Total backlog size: ${metrics.backlogSize} submissions`,
      impact: 'high',
      metric: 'Backlog',
    });
  }

  const recommendations: Recommendation[] = [];

  if (bottleneckStage && bottleneckStage[1] > 10) {
    const highBacklogTemplates = RECOMMENDATION_TEMPLATES.high_backlog;
    if (highBacklogTemplates) {
      recommendations.push({
        action: interpolateTemplate(selectTemplate(highBacklogTemplates), {}),
        priority: 'high',
      });
    }
  }

  recommendations.push({
    action: 'Review oldest items in queue for potential fast-tracking',
    priority: 'medium',
  });

  recommendations.push({
    action: 'Analyze if recent submissions are more complex than average',
    priority: 'low',
  });

  return createResponse(summary, keyDrivers, recommendations, 'bottleneck_explainer', [
    'Show oldest pending submissions',
    'Which publishers are affected?',
    'Generate escalation email',
  ]);
}

function analyzeFailures(_prompt: string, context: DataContext): AIResponse {
  const trends = context.dailyTrends || [];

  // Aggregate failure categories from trends
  const failureCounts: Record<string, number> = {};
  trends.forEach((day) => {
    Object.entries(day.failureCategories).forEach(([cat, count]) => {
      failureCounts[cat] = (failureCounts[cat] || 0) + count;
    });
  });

  const sortedFailures = Object.entries(failureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalFailures = sortedFailures.reduce((sum, [, count]) => sum + count, 0);
  const topCategory = sortedFailures[0];

  const summary = `Failure Analysis Summary

Total failures in period: ${totalFailures}
Top failure category: ${FAILURE_CATEGORY_LABELS[topCategory?.[0] as keyof typeof FAILURE_CATEGORY_LABELS] || topCategory?.[0]} (${((topCategory?.[1] || 0) / totalFailures * 100).toFixed(0)}%)

Breakdown:
${sortedFailures
  .map(([cat, count], i) => {
    const label = FAILURE_CATEGORY_LABELS[cat as keyof typeof FAILURE_CATEGORY_LABELS] || cat;
    const pct = ((count / totalFailures) * 100).toFixed(0);
    return `${i + 1}. ${label}: ${count} (${pct}%)`;
  })
  .join('\n')}`;

  const keyDrivers: KeyDriver[] = sortedFailures.slice(0, 3).map(([cat, count]) => ({
    driver: `${FAILURE_CATEGORY_LABELS[cat as keyof typeof FAILURE_CATEGORY_LABELS] || cat}: ${count} failures`,
    impact: count > totalFailures * 0.3 ? 'high' : count > totalFailures * 0.15 ? 'medium' : 'low',
    metric: 'Failure Count',
  }));

  const recommendations: Recommendation[] = [];

  if (topCategory) {
    const topCatLabel = FAILURE_CATEGORY_LABELS[topCategory[0] as keyof typeof FAILURE_CATEGORY_LABELS] || topCategory[0];
    recommendations.push({
      action: `Focus on reducing ${topCatLabel} failures through improved documentation`,
      priority: 'high',
    });
  }

  recommendations.push({
    action: 'Implement pre-submission validation for common failure categories',
    priority: 'medium',
  });

  recommendations.push({
    action: 'Schedule publisher education sessions on validation requirements',
    priority: 'medium',
  });

  return createResponse(summary, keyDrivers, recommendations, 'general', [
    'Which publishers have most failures?',
    'Show failure trend over time',
    'Draft publisher guidance',
  ]);
}

function analyzeAtRiskAgents(_prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;

  const summary = `At-Risk Agents Analysis

Agents requiring attention based on current metrics:

🔴 **Critical (SLA Breach Risk):** ${metrics?.backlogSize || 0} submissions approaching deadline
⚠️ **Warning (Quality Issues):** Agents with latency or availability concerns
📊 **Monitor (Trending Down):** Agents with declining metrics

Key Risk Indicators:
- SLA Compliance: ${metrics?.slaComplianceRate?.toFixed(0) || 'N/A'}%
- Active Incidents: ${metrics?.activeIncidents || 0}
- Oldest in Queue: ${metrics?.oldestInQueue || 0} days`;

  const keyDrivers: KeyDriver[] = [];

  if (metrics?.slaComplianceRate && metrics.slaComplianceRate < 90) {
    keyDrivers.push({
      driver: `SLA compliance below target at ${metrics.slaComplianceRate.toFixed(0)}%`,
      impact: 'critical',
      metric: 'SLA',
    });
  }

  if (metrics?.activeIncidents && metrics.activeIncidents > 0) {
    keyDrivers.push({
      driver: `${metrics.activeIncidents} active incidents require attention`,
      impact: metrics.activeIncidents > 3 ? 'high' : 'medium',
      metric: 'Incidents',
    });
  }

  if (metrics?.latencyP99 && metrics.latencyP99 > 3000) {
    keyDrivers.push({
      driver: `p99 latency at ${metrics.latencyP99}ms exceeds 3s threshold`,
      impact: 'high',
      metric: 'Latency',
    });
  }

  const recommendations: Recommendation[] = [
    {
      action: 'Review and prioritize submissions closest to SLA breach',
      priority: 'high',
    },
    {
      action: 'Investigate active incidents and assign owners',
      priority: 'high',
    },
    {
      action: 'Contact publishers of at-risk agents for status updates',
      priority: 'medium',
    },
  ];

  return createResponse(summary, keyDrivers, recommendations, 'at_risk_agents', [
    'Show risk details for top agent',
    'Generate risk summary report',
    'Prioritize review queue',
  ]);
}

function analyzeSLA(_prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;
  const trends = context.dailyTrends || [];

  const recentBreaches = trends.slice(-7).reduce((sum, d) => sum + d.slaBreachCount, 0);
  const previousBreaches = trends.slice(-14, -7).reduce((sum, d) => sum + d.slaBreachCount, 0);
  const breachTrend = previousBreaches ? ((recentBreaches - previousBreaches) / previousBreaches) * 100 : 0;

  const summary = `SLA Compliance Analysis

Current SLA Performance:
- Compliance Rate: ${metrics?.slaComplianceRate?.toFixed(0) || 'N/A'}%
- Time to Publish (p50): ${metrics?.timeToPublishP50?.toFixed(1) || 'N/A'} days
- Time to Publish (p90): ${metrics?.timeToPublishP90?.toFixed(1) || 'N/A'} days

This Week:
- SLA Breaches: ${recentBreaches} (${breachTrend >= 0 ? '+' : ''}${breachTrend.toFixed(0)}% vs last week)
- Items at Risk: ${metrics?.backlogSize || 0} in queue
- Oldest Item: ${metrics?.oldestInQueue || 0} days`;

  const keyDrivers: KeyDriver[] = [];

  if (metrics?.slaComplianceRate && metrics.slaComplianceRate < 95) {
    keyDrivers.push({
      driver: `SLA compliance at ${metrics.slaComplianceRate.toFixed(0)}%, ${metrics.slaComplianceRate < 90 ? 'critical' : 'needs attention'}`,
      impact: metrics.slaComplianceRate < 90 ? 'critical' : 'high',
    });
  }

  if (recentBreaches > 0) {
    keyDrivers.push({
      driver: `${recentBreaches} SLA breaches this week`,
      impact: recentBreaches > 5 ? 'high' : 'medium',
    });
  }

  if (metrics?.oldestInQueue && metrics.oldestInQueue > 5) {
    keyDrivers.push({
      driver: `Oldest pending item is ${metrics.oldestInQueue} days old`,
      impact: metrics.oldestInQueue > 7 ? 'high' : 'medium',
    });
  }

  const recommendations: Recommendation[] = [
    {
      action: 'Fast-track items closest to SLA breach',
      priority: 'high',
    },
    {
      action: 'Review bottleneck stages for process improvements',
      priority: 'medium',
    },
    {
      action: 'Consider capacity adjustments for high-volume periods',
      priority: 'low',
    },
  ];

  return createResponse(summary, keyDrivers, recommendations, 'general', [
    'What is causing delays?',
    'Which publishers have breaches?',
    'Generate SLA report',
  ]);
}

function analyzeQuality(_prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;

  const latencyStatus = metrics?.latencyP99 && metrics.latencyP99 <= 3000 ? '✅ Pass' : '❌ Fail';
  const availabilityStatus = metrics?.availabilityPct && metrics.availabilityPct >= 99.5 ? '✅ Pass' : '❌ Fail';
  const raiStatus = metrics?.raiPassRate && metrics.raiPassRate >= 95 ? '✅ Pass' : '⚠️ Warning';

  const summary = `Quality & Readiness Assessment

Readiness Checklist:
${latencyStatus} p99 Latency: ${metrics?.latencyP99?.toFixed(0) || 'N/A'}ms (target: ≤3000ms)
${availabilityStatus} Availability: ${metrics?.availabilityPct?.toFixed(1) || 'N/A'}% (target: ≥99.5%)
${raiStatus} RAI Pass Rate: ${metrics?.raiPassRate?.toFixed(0) || 'N/A'}% (target: ≥95%)
📊 Regressions: ${metrics?.regressionCount || 0} detected

Latency Percentiles:
- p50: ${metrics?.latencyP50?.toFixed(0) || 'N/A'}ms
- p75: ${metrics?.latencyP75?.toFixed(0) || 'N/A'}ms
- p99: ${metrics?.latencyP99?.toFixed(0) || 'N/A'}ms`;

  const keyDrivers: KeyDriver[] = [];

  if (metrics?.latencyP99 && metrics.latencyP99 > 3000) {
    keyDrivers.push({
      driver: `p99 latency ${metrics.latencyP99}ms exceeds 3s threshold`,
      impact: 'critical',
      metric: 'Latency',
    });
  }

  if (metrics?.availabilityPct && metrics.availabilityPct < 99.5) {
    keyDrivers.push({
      driver: `Availability ${metrics.availabilityPct.toFixed(1)}% below 99.5% target`,
      impact: 'high',
      metric: 'Availability',
    });
  }

  if (metrics?.raiPassRate && metrics.raiPassRate < 95) {
    keyDrivers.push({
      driver: `RAI pass rate ${metrics.raiPassRate.toFixed(0)}% below 95% target`,
      impact: 'medium',
      metric: 'RAI',
    });
  }

  const recommendations: Recommendation[] = [];

  if (metrics?.latencyP99 && metrics.latencyP99 > 3000) {
    recommendations.push({
      action: 'Investigate agents with high latency and request optimization',
      priority: 'high',
    });
  }

  recommendations.push({
    action: 'Monitor quality trends and set up alerts for threshold violations',
    priority: 'medium',
  });

  recommendations.push({
    action: 'Review RAI validation requirements with affected publishers',
    priority: 'medium',
  });

  return createResponse(summary, keyDrivers, recommendations, 'quality_analysis', [
    'Show affected agents',
    'Trend over last 30 days',
    'Generate quality report',
  ]);
}

function analyzeRAI(_prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;
  const trends = context.dailyTrends || [];

  const avgRaiRate = trends.length
    ? trends.reduce((sum, d) => sum + d.raiPassRate, 0) / trends.length
    : metrics?.raiPassRate || 0;

  const summary = `RAI (Responsible AI) Compliance Analysis

Current Status:
- RAI Pass Rate: ${metrics?.raiPassRate?.toFixed(0) || 'N/A'}%
- Target: ≥95%
- Status: ${(metrics?.raiPassRate || 0) >= 95 ? '✅ Compliant' : '⚠️ Below Target'}

Period Average: ${avgRaiRate.toFixed(0)}%

RAI validation ensures agents meet responsible AI guidelines including:
- Content safety and moderation
- Privacy protection
- Fairness and bias prevention
- Transparency requirements`;

  const keyDrivers: KeyDriver[] = [];

  if (metrics?.raiPassRate && metrics.raiPassRate < 95) {
    keyDrivers.push({
      driver: `RAI pass rate at ${metrics.raiPassRate.toFixed(0)}%, below 95% target`,
      impact: metrics.raiPassRate < 90 ? 'high' : 'medium',
    });
  }

  keyDrivers.push({
    driver: 'RAI validation includes content safety, privacy, and bias checks',
    impact: 'low',
  });

  const recommendations: Recommendation[] = [
    {
      action: 'Share RAI compliance checklist with publishers',
      priority: 'high',
    },
    {
      action: 'Provide RAI training resources for common failure patterns',
      priority: 'medium',
    },
    {
      action: 'Set up early RAI pre-checks in submission workflow',
      priority: 'medium',
    },
  ];

  return createResponse(summary, keyDrivers, recommendations, 'quality_analysis', [
    'RAI failure breakdown by type',
    'Publishers with RAI issues',
    'RAI compliance guidelines',
  ]);
}

function triageSubmission(_prompt: string, context: DataContext): AIResponse {
  const entity = context.selectedEntity;

  if (!entity || entity.type !== 'agent') {
    return createErrorResponse('Please select an agent to analyze');
  }

  const agent = entity.data;
  const submissions = entity.submissions || [];
  const latestSubmission = submissions[0];

  const findings = latestSubmission?.validationFindings || [];
  const mustFixCount = findings.filter((f) => f.severity === 'must_fix').length;
  const shouldFixCount = findings.filter((f) => f.severity === 'should_fix').length;

  const summary = `Submission Triage: ${agent.name}

Status: ${agent.currentStatus}
Latest Submission: ${latestSubmission?.outcome || latestSubmission?.stage || 'N/A'}
Validation Findings: ${findings.length} total (${mustFixCount} must-fix, ${shouldFixCount} should-fix)

${findings.length > 0 ? 'Issues Found:' : 'No validation issues found.'}
${findings
  .slice(0, 5)
  .map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.message}`)
  .join('\n')}`;

  const keyDrivers: KeyDriver[] = findings.slice(0, 3).map((f) => ({
    driver: f.message,
    impact: f.severity === 'must_fix' ? 'critical' : f.severity === 'should_fix' ? 'medium' : 'low',
  }));

  const recommendations: Recommendation[] = findings.slice(0, 3).map((f) => ({
    action: f.remediationHint,
    priority: f.severity === 'must_fix' ? 'high' : 'medium',
  }));

  if (recommendations.length === 0) {
    recommendations.push({
      action: 'Review submission for any edge cases or improvements',
      priority: 'low',
    });
  }

  return createResponse(summary, keyDrivers, recommendations, 'submission_triage', [
    'Show similar past failures',
    'Draft fix instructions',
    'Estimate time to resolution',
  ]);
}

function generatePublisherCoaching(_prompt: string, context: DataContext): AIResponse {
  const entity = context.selectedEntity;

  if (!entity || entity.type !== 'publisher') {
    return createErrorResponse('Please select a publisher to analyze');
  }

  const publisher = entity.data;
  const agents = entity.agents || [];

  const summary = `Publisher Assessment: ${publisher.name}

Profile:
- Tier: ${publisher.tier}
- Region: ${publisher.region}
- Support Plan: ${publisher.supportPlan}
- Active Agents: ${agents.length}

Coaching Focus Areas:
Based on submission patterns, focus on improving:
1. Pre-submission validation compliance
2. Documentation completeness
3. Test coverage requirements`;

  const keyDrivers: KeyDriver[] = [
    {
      driver: `${publisher.tier} tier publisher with ${agents.length} agents`,
      impact: 'low',
    },
    {
      driver: 'Review pre-submission checklist adherence',
      impact: 'medium',
    },
    {
      driver: 'Ensure comprehensive test instructions',
      impact: 'medium',
    },
  ];

  const recommendations: Recommendation[] = [
    {
      action: `Schedule quarterly review session with ${publisher.name}`,
      priority: 'medium',
    },
    {
      action: 'Share updated validation guidelines and common failure patterns',
      priority: 'high',
    },
    {
      action: 'Recommend use of pre-validation tool before submission',
      priority: 'medium',
    },
  ];

  return createResponse(summary, keyDrivers, recommendations, 'publisher_coaching', [
    'Show detailed failure breakdown',
    'Compare to similar publishers',
    'Generate improvement roadmap',
  ]);
}

function generateSummary(prompt: string, context: DataContext): AIResponse {
  const metrics = context.computedMetrics;
  const page = context.currentPage;

  // Check if this is a custom query that didn't match any pattern
  const knownKeywords = ['summarize', 'summary', 'overview', 'what', 'see', 'show'];
  const isCustomQuery =
    prompt.length > 15 && !knownKeywords.some((k) => prompt.toLowerCase().includes(k));

  let summary = '';
  const keyDrivers: KeyDriver[] = [];
  const recommendations: Recommendation[] = [];

  switch (page) {
    case 'overview':
      summary = `Dashboard Overview

Key Metrics:
- Time to Publish (p50): ${metrics?.timeToPublishP50?.toFixed(1) || 'N/A'} days
- First-Pass Approval: ${metrics?.firstPassApprovalRate?.toFixed(0) || 'N/A'}%
- SLA Compliance: ${metrics?.slaComplianceRate?.toFixed(0) || 'N/A'}%
- RAI Pass Rate: ${metrics?.raiPassRate?.toFixed(0) || 'N/A'}%
- Active Incidents: ${metrics?.activeIncidents || 0}

Overall Status: ${(metrics?.slaComplianceRate || 0) >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`;
      break;

    case 'funnel':
      summary = `Publishing Funnel Summary

Pipeline Status:
- Total in Pipeline: ${Object.values(metrics?.stageDistribution || {}).reduce((a, b) => a + b, 0)} submissions
- Review Backlog: ${metrics?.backlogSize || 0} items
- Oldest Item: ${metrics?.oldestInQueue || 0} days

Stage Distribution shows current flow through the publishing process.`;
      break;

    case 'quality':
      summary = `Quality & Readiness Summary

Readiness Status:
- p99 Latency: ${metrics?.latencyP99?.toFixed(0) || 'N/A'}ms
- Availability: ${metrics?.availabilityPct?.toFixed(1) || 'N/A'}%
- RAI Pass Rate: ${metrics?.raiPassRate?.toFixed(0) || 'N/A'}%
- Regressions: ${metrics?.regressionCount || 0}`;
      break;

    default:
      summary = `Current view shows ${page} data. Use specific prompts for detailed analysis.`;
  }

  // If this was a custom query, prepend a helpful context message
  if (isCustomQuery) {
    const truncatedPrompt = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;
    summary = `I searched for insights related to "${truncatedPrompt}"

While I don't have a specific analysis for that query, here's the current ${page} status:

${summary}

For more specific analysis, try asking about:
• Bottlenecks and delays
• Failure reasons and categories
• SLA compliance metrics
• At-risk agents or publishers`;
  }

  keyDrivers.push({
    driver: isCustomQuery
      ? 'Try using keywords like "bottleneck", "failures", "SLA", or "at-risk"'
      : 'Use specific prompts for deeper analysis',
    impact: 'low',
  });

  recommendations.push({
    action: 'Try "What is the bottleneck?" or "Top failure reasons"',
    priority: 'low',
  });

  return createResponse(summary, keyDrivers, recommendations, 'general', [
    'What is the bottleneck?',
    'Top failure reasons',
    'Generate weekly update',
  ]);
}

// ============================================================================
// Helper Functions
// ============================================================================

function createResponse(
  summary: string,
  keyDrivers: KeyDriver[],
  recommendations: Recommendation[],
  scenario: CopilotScenario,
  suggestedPrompts: string[]
): AIResponse {
  return {
    summary,
    keyDrivers,
    recommendations,
    suggestedPrompts,
    metadata: {
      confidence: 0.85,
      sources: ['Computed Metrics', 'Daily Snapshots', 'Pattern Analysis'],
      generatedAt: new Date().toISOString(),
      scenario,
    },
  };
}

function createErrorResponse(message: string): AIResponse {
  return {
    summary: message,
    keyDrivers: [],
    recommendations: [],
    suggestedPrompts: ['Summarize this view', 'Top failure reasons'],
    metadata: {
      confidence: 0,
      sources: [],
      generatedAt: new Date().toISOString(),
      scenario: 'general',
    },
  };
}

// Export singleton instance
export const ruleEngine = new RuleEngine();
