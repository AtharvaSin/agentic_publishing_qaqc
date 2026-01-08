/**
 * Narrative Generator for creating natural language summaries
 * Uses template interpolation and context-aware text generation
 */

import { ComputedMetrics, DailySnapshot, Agent, Publisher, Submission } from '@/types/entities';
import { DataContext, KeyDriver, Recommendation, TemplateVariables } from '@/types/copilot';
import { FAILURE_CATEGORY_LABELS, STAGE_LABELS } from '@/lib/constants';
import {
  interpolateTemplate,
  selectTemplate,
  METRIC_CHANGE_TEMPLATES,
  BOTTLENECK_TEMPLATES,
  SUMMARY_TEMPLATES,
  ASSESSMENT_TEMPLATES,
  RECOMMENDATION_TEMPLATES,
} from './templates';

/**
 * Narrative Generator class for creating natural language insights
 */
export class NarrativeGenerator {
  /**
   * Generate a metric change narrative
   */
  generateMetricChange(
    metric: string,
    current: number,
    previous: number,
    unit: string = '',
    period: string = 'week'
  ): string {
    const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    const absChange = Math.abs(change);

    let templateKey: keyof typeof METRIC_CHANGE_TEMPLATES;
    if (absChange < 5) {
      templateKey = 'stable';
    } else if (change > 0) {
      templateKey = absChange > 15 ? 'positive_strong' : 'positive_moderate';
    } else {
      templateKey = absChange > 15 ? 'negative_strong' : 'negative_moderate';
    }

    const variables: TemplateVariables = {
      metric,
      value: current.toFixed(1),
      unit,
      change: Number(absChange.toFixed(0)),
      period,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };

    const templateGroup = METRIC_CHANGE_TEMPLATES[templateKey];
    if (!templateGroup) {
      return `${metric} is at ${current.toFixed(1)}${unit}`;
    }

    return interpolateTemplate(
      selectTemplate(templateGroup.templates),
      variables
    );
  }

  /**
   * Generate a bottleneck narrative
   */
  generateBottleneckNarrative(
    stage: string,
    count: number,
    avgDays: number
  ): string {
    const stageLabel = STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage;

    return interpolateTemplate(
      selectTemplate(BOTTLENECK_TEMPLATES.templates),
      {
        stage: stageLabel,
        count,
        avgDays: Number(avgDays.toFixed(1)),
      }
    );
  }

  /**
   * Generate key drivers from metrics
   */
  generateKeyDrivers(metrics: ComputedMetrics, trends: DailySnapshot[]): KeyDriver[] {
    const drivers: KeyDriver[] = [];

    // SLA analysis
    if (metrics.slaComplianceRate < 90) {
      drivers.push({
        driver: `SLA compliance dropped to ${metrics.slaComplianceRate.toFixed(0)}%, below 90% target`,
        impact: 'critical',
        metric: 'SLA Compliance',
        delta: metrics.slaComplianceRate - 90,
      });
    } else if (metrics.slaComplianceRate < 95) {
      drivers.push({
        driver: `SLA compliance at ${metrics.slaComplianceRate.toFixed(0)}%, nearing threshold`,
        impact: 'high',
        metric: 'SLA Compliance',
      });
    }

    // Backlog analysis
    if (metrics.backlogSize > 20) {
      drivers.push({
        driver: `Review backlog at ${metrics.backlogSize} items, significantly above normal`,
        impact: 'high',
        metric: 'Backlog',
      });
    } else if (metrics.backlogSize > 10) {
      drivers.push({
        driver: `Review backlog at ${metrics.backlogSize} items`,
        impact: 'medium',
        metric: 'Backlog',
      });
    }

    // RAI analysis
    if (metrics.raiPassRate < 90) {
      drivers.push({
        driver: `RAI pass rate at ${metrics.raiPassRate.toFixed(0)}%, requiring attention`,
        impact: 'high',
        metric: 'RAI Pass Rate',
      });
    } else if (metrics.raiPassRate < 95) {
      drivers.push({
        driver: `RAI pass rate slightly below target at ${metrics.raiPassRate.toFixed(0)}%`,
        impact: 'medium',
        metric: 'RAI Pass Rate',
      });
    }

    // Latency analysis
    if (metrics.latencyP99 > 3000) {
      drivers.push({
        driver: `p99 latency at ${metrics.latencyP99.toFixed(0)}ms, exceeding 3s threshold`,
        impact: 'high',
        metric: 'Latency',
      });
    }

    // Incidents
    if (metrics.activeIncidents > 0) {
      drivers.push({
        driver: `${metrics.activeIncidents} active incident${metrics.activeIncidents > 1 ? 's' : ''} require attention`,
        impact: metrics.activeIncidents > 3 ? 'high' : 'medium',
        metric: 'Incidents',
      });
    }

    // Trend analysis
    if (trends.length >= 14) {
      const recentWeek = trends.slice(-7);
      const previousWeek = trends.slice(-14, -7);

      const recentApprovals = recentWeek.reduce((sum, d) => sum + d.approvals, 0);
      const previousApprovals = previousWeek.reduce((sum, d) => sum + d.approvals, 0);
      const approvalChange = previousApprovals
        ? ((recentApprovals - previousApprovals) / previousApprovals) * 100
        : 0;

      if (Math.abs(approvalChange) > 20) {
        drivers.push({
          driver: `Approvals ${approvalChange > 0 ? 'increased' : 'decreased'} ${Math.abs(approvalChange).toFixed(0)}% week-over-week`,
          impact: approvalChange < -20 ? 'high' : 'medium',
          metric: 'Approvals',
          delta: approvalChange,
        });
      }
    }

    return drivers.sort((a, b) => {
      const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  }

  /**
   * Generate recommendations based on context
   */
  generateRecommendations(metrics: ComputedMetrics, context: DataContext): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High backlog
    if (metrics.backlogSize > 15) {
      const highBacklogTemplates = RECOMMENDATION_TEMPLATES.high_backlog;
      if (highBacklogTemplates) {
        recommendations.push({
          action: selectTemplate(highBacklogTemplates),
          priority: 'high',
          timeEstimate: '2-3 days',
        });
      }
    }

    // SLA breach risk
    if (metrics.slaComplianceRate < 90) {
      const slaTemplates = RECOMMENDATION_TEMPLATES.sla_breach_risk;
      if (slaTemplates) {
        recommendations.push({
          action: interpolateTemplate(
            selectTemplate(slaTemplates),
            { count: Math.ceil(metrics.backlogSize * 0.3) }
          ),
          priority: 'high',
          timeEstimate: 'Immediate',
        });
      }
    }

    // Quality degradation
    if (metrics.latencyP99 > 3000 || metrics.availabilityPct < 99.5) {
      const qualityTemplates = RECOMMENDATION_TEMPLATES.quality_degradation;
      if (qualityTemplates) {
        recommendations.push({
          action: interpolateTemplate(
            selectTemplate(qualityTemplates),
            { metric: 'quality metrics', period: 'week' }
          ),
          priority: 'high',
        });
      }
    }

    // RAI issues
    if (metrics.raiPassRate < 95) {
      const raiTemplates = RECOMMENDATION_TEMPLATES.rai_failures;
      if (raiTemplates) {
        recommendations.push({
          action: selectTemplate(raiTemplates),
          priority: 'medium',
        });
      }
    }

    // General improvements
    if (metrics.firstPassApprovalRate < 80) {
      recommendations.push({
        action: 'Improve first-pass approval by enhancing pre-submission validation',
        priority: 'medium',
        timeEstimate: '1 week',
      });
    }

    // Add link to relevant page if applicable
    const firstRec = recommendations[0];
    if (firstRec && context.currentPage === 'overview') {
      firstRec.link = {
        label: 'View Details',
        href: '/funnel',
      };
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Generate overall summary for a page
   */
  generatePageSummary(context: DataContext): string {
    const { currentPage, computedMetrics: metrics, filters } = context;
    if (!metrics) return 'No data available for summary.';

    const variables: TemplateVariables = {
      period: filters.datePreset || '30 days',
      approvalRate: metrics.firstPassApprovalRate.toFixed(0),
      slaCompliance: metrics.slaComplianceRate.toFixed(0),
      backlogSize: metrics.backlogSize,
      totalSubmissions: Object.values(metrics.stageDistribution).reduce((a, b) => a + b, 0),
      p99Latency: metrics.latencyP99.toFixed(0),
      availability: metrics.availabilityPct.toFixed(1),
      raiRate: metrics.raiPassRate.toFixed(0),
    };

    // Determine overall status
    const isHealthy =
      metrics.slaComplianceRate >= 90 &&
      metrics.raiPassRate >= 95 &&
      metrics.backlogSize < 20;

    variables.overallStatus = isHealthy ? 'healthy' : 'facing challenges';
    variables.highlightIssue = this.getHighlightIssue(metrics);

    // Find bottleneck
    const stageEntries = Object.entries(metrics.stageDistribution)
      .filter(([stage]) => !['approved', 'published', 'rejected', 'draft'].includes(stage));
    const [bottleneckStage, bottleneckCount] = stageEntries.sort(([, a], [, b]) => b - a)[0] || ['none', 0];
    variables.bottleneckStage = STAGE_LABELS[bottleneckStage as keyof typeof STAGE_LABELS] || bottleneckStage;
    variables.bottleneckCount = bottleneckCount;

    const templateKey = currentPage as keyof typeof SUMMARY_TEMPLATES;
    const templates = SUMMARY_TEMPLATES[templateKey] ?? SUMMARY_TEMPLATES.overview;

    if (!templates) {
      return 'Summary not available.';
    }

    return interpolateTemplate(selectTemplate(templates), variables);
  }

  /**
   * Generate assessment for an entity
   */
  generateEntityAssessment(
    entityType: 'agent' | 'publisher',
    entity: Agent | Publisher,
    additionalData?: { submissions?: Submission[]; agents?: Agent[] }
  ): string {
    const entityName = entity.name;
    let status: 'healthy' | 'at_risk' | 'critical' = 'healthy';
    const warningMetrics: string[] = [];
    const criticalIssues: string[] = [];

    if (entityType === 'agent') {
      const agent = entity as Agent;
      if (agent.currentStatus === 'action_required') {
        status = 'at_risk';
        warningMetrics.push('action required');
      }
      if (agent.currentStatus === 'suspended') {
        status = 'critical';
        criticalIssues.push('agent suspended');
      }
    }

    if (entityType === 'publisher') {
      const agents = additionalData?.agents || [];
      const atRiskAgents = agents.filter(
        (a) => a.currentStatus === 'action_required' || a.currentStatus === 'suspended'
      );
      if (atRiskAgents.length > 0) {
        status = atRiskAgents.length > 2 ? 'critical' : 'at_risk';
        warningMetrics.push(`${atRiskAgents.length} agents need attention`);
      }
    }

    const variables: TemplateVariables = {
      entityName,
      entityType,
      warningMetrics: warningMetrics.join(', '),
      criticalIssues: criticalIssues.join(', '),
      issueCount: warningMetrics.length + criticalIssues.length,
    };

    const templates = ASSESSMENT_TEMPLATES[status];
    if (!templates) {
      return `Assessment for ${entityName}`;
    }
    return interpolateTemplate(selectTemplate(templates), variables);
  }

  /**
   * Get the most significant issue to highlight
   */
  private getHighlightIssue(metrics: ComputedMetrics): string {
    if (metrics.slaComplianceRate < 90) {
      return `SLA compliance at ${metrics.slaComplianceRate.toFixed(0)}% requires immediate attention.`;
    }
    if (metrics.backlogSize > 20) {
      return `Review backlog of ${metrics.backlogSize} items is causing delays.`;
    }
    if (metrics.raiPassRate < 95) {
      return `RAI pass rate at ${metrics.raiPassRate.toFixed(0)}% needs improvement.`;
    }
    if (metrics.activeIncidents > 0) {
      return `${metrics.activeIncidents} active incident${metrics.activeIncidents > 1 ? 's' : ''} require attention.`;
    }
    return 'Operations running smoothly within targets.';
  }

  /**
   * Generate failure analysis summary
   */
  generateFailureAnalysis(failureCounts: Record<string, number>): string {
    const total = Object.values(failureCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 'No failures recorded in this period.';

    const sorted = Object.entries(failureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const topCategory = sorted[0];
    if (!topCategory) {
      return `${total} failures recorded. Unable to determine top category.`;
    }
    const topLabel = FAILURE_CATEGORY_LABELS[topCategory[0] as keyof typeof FAILURE_CATEGORY_LABELS] || topCategory[0];
    const topPct = ((topCategory[1] / total) * 100).toFixed(0);

    return `${total} failures recorded. Top category: ${topLabel} (${topPct}%). ` +
      `Focus on ${topLabel} remediation to improve approval rates.`;
  }

  /**
   * Generate weekly update structure
   */
  generateWeeklyUpdate(metrics: ComputedMetrics, trends: DailySnapshot[]): string {
    const recentWeek = trends.slice(-7);
    const previousWeek = trends.slice(-14, -7);

    const recentSubmissions = recentWeek.reduce((sum, d) => sum + d.submissions, 0);
    const previousSubmissions = previousWeek.reduce((sum, d) => sum + d.submissions, 0);
    const submissionTrend = previousSubmissions
      ? `${((recentSubmissions - previousSubmissions) / previousSubmissions * 100).toFixed(0)}%`
      : 'N/A';

    const recentApprovals = recentWeek.reduce((sum, d) => sum + d.approvals, 0);
    const previousApprovals = previousWeek.reduce((sum, d) => sum + d.approvals, 0);
    const approvalTrend = previousApprovals
      ? `${((recentApprovals - previousApprovals) / previousApprovals * 100).toFixed(0)}%`
      : 'N/A';

    const keyIssues = this.generateKeyDrivers(metrics, trends)
      .slice(0, 3)
      .map((d) => `- ${d.driver}`)
      .join('\n');

    const recommendations = this.generateRecommendations(metrics, { currentPage: 'overview', filters: { datePreset: '7d' } })
      .slice(0, 3)
      .map((r) => `- ${r.action}`)
      .join('\n');

    const weeklyTemplates = SUMMARY_TEMPLATES.weekly_update;
    if (!weeklyTemplates) {
      return `Weekly update: ${recentSubmissions} submissions, ${recentApprovals} approvals.`;
    }
    return interpolateTemplate(
      selectTemplate(weeklyTemplates),
      {
        period: 'This Week',
        totalSubmissions: recentSubmissions,
        submissionTrend: `${submissionTrend} vs last week`,
        totalApprovals: recentApprovals,
        approvalTrend: `${approvalTrend} vs last week`,
        slaCompliance: metrics.slaComplianceRate.toFixed(0),
        backlogSize: metrics.backlogSize,
        keyIssues: keyIssues || '- No critical issues',
        recommendedActions: recommendations || '- Continue monitoring',
      }
    );
  }
}

// Export singleton instance
export const narrativeGenerator = new NarrativeGenerator();
