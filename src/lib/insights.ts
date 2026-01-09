/**
 * Insight generation logic for KPI drilldowns
 * Rule-based natural language insight generation
 */

import { formatPercent } from './utils';

// Types for insight generation
export type KPIType =
  | 'time_to_publish'
  | 'approval_rate'
  | 'sla_compliance'
  | 'rai_pass_rate'
  | 'active_incidents';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface InsightContext {
  metricType: KPIType;
  currentValue: number;
  previousValue: number;
  trend: TrendDirection;
  trendPercent: number;
  contributingFactors?: ContributingFactor[];
  additionalData?: Record<string, unknown>;
}

export interface ContributingFactor {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface Insight {
  text: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  actionItems?: string[];
}

/**
 * Generate natural language insight for Time to Publish KPI
 */
function generateTimeToPublishInsight(context: InsightContext): Insight {
  const { currentValue, trend, trendPercent, additionalData } = context;
  const bottleneck = additionalData?.bottleneck as string | undefined;
  const stuckAgents = additionalData?.stuckAgents as number | undefined;

  if (trend === 'down') {
    return {
      text: `Time-to-publish decreased by ${formatPercent(trendPercent)} this period. ${
        bottleneck
          ? `${bottleneck} optimization is driving improvement.`
          : 'Publishing velocity is improving across all stages.'
      }`,
      severity: 'success',
      actionItems: ['Continue monitoring stage-level metrics for sustained improvement'],
    };
  }

  if (trend === 'up') {
    return {
      text: `Time-to-publish increased by ${formatPercent(trendPercent)} due to ${
        bottleneck ?? 'increased backlog in review stages'
      }. ${
        stuckAgents
          ? `${stuckAgents} agents are stuck longer than 5 days.`
          : 'Consider scaling reviewer capacity or improving pre-validation.'
      }`,
      severity: currentValue > 5 ? 'warning' : 'info',
      actionItems: [
        'Review agents stuck in "Action Required" stage',
        'Consider expedited processing for high-priority submissions',
      ],
    };
  }

  return {
    text: `Publishing velocity stable at ${currentValue.toFixed(1)} days. Review capacity matches current submission volume.`,
    severity: 'info',
  };
}

/**
 * Generate natural language insight for First-Pass Approval Rate KPI
 */
function generateApprovalRateInsight(context: InsightContext): Insight {
  const { currentValue, trend, trendPercent, contributingFactors, additionalData } = context;
  const topFailure = contributingFactors?.[0];
  const affectedPublishers = additionalData?.affectedPublishers as number | undefined;

  if (trend === 'down') {
    return {
      text: `${
        topFailure
          ? `${topFailure.name} failures driving ${formatPercent(trendPercent)} decline.`
          : `First-pass approval declined ${formatPercent(trendPercent)}.`
      } ${
        affectedPublishers
          ? `${affectedPublishers} publishers need remediation support.`
          : 'Review failure patterns for targeted guidance.'
      }`,
      severity: currentValue < 60 ? 'critical' : 'warning',
      actionItems: [
        'Review top failure categories for common patterns',
        'Update publisher guidelines for recurring issues',
        'Consider pre-submission validation improvements',
      ],
    };
  }

  if (trend === 'up') {
    return {
      text: `First-pass approval improved ${formatPercent(trendPercent)} ${
        topFailure ? `as ${topFailure.name} failures decreased.` : 'across all validation categories.'
      } Proactive guidance is reducing submission errors.`,
      severity: 'success',
      actionItems: ['Document successful patterns for knowledge sharing'],
    };
  }

  return {
    text: `Approval rate stable at ${formatPercent(currentValue)}. ${
      currentValue >= 80 ? 'Meeting quality targets.' : 'Consider initiatives to improve first-pass success.'
    }`,
    severity: currentValue >= 70 ? 'info' : 'warning',
  };
}

/**
 * Generate natural language insight for SLA Compliance KPI
 */
function generateSLAComplianceInsight(context: InsightContext): Insight {
  const { currentValue, trend, trendPercent, additionalData } = context;
  const breachCount = additionalData?.breachCount as number | undefined;
  const atRiskCount = additionalData?.atRiskCount as number | undefined;
  const topPublishers = additionalData?.topPublishers as string[] | undefined;

  if (trend === 'down') {
    const publisherNote = topPublishers?.length
      ? `${topPublishers.slice(0, 2).join(', ')} account for majority of breaches.`
      : 'SLA breaches concentrated in manual review phase.';

    return {
      text: `SLA compliance dropped ${formatPercent(trendPercent)}. ${
        breachCount ? `${breachCount} agents currently in breach.` : ''
      } ${publisherNote} Consider dedicated support for struggling publishers.`,
      severity: currentValue < 75 ? 'critical' : 'warning',
      actionItems: [
        'Prioritize SLA-breached agents for immediate review',
        'Contact publishers with multiple breaches',
        'Review staffing for review bottleneck stages',
      ],
    };
  }

  if (trend === 'up') {
    return {
      text: `SLA compliance improved to ${formatPercent(currentValue)} ${
        atRiskCount ? `with only ${atRiskCount} agents at risk.` : 'with reduced breach rates.'
      } Process improvements are taking effect.`,
      severity: 'success',
    };
  }

  return {
    text: `SLA compliance stable at ${formatPercent(currentValue)}. ${
      breachCount ? `${breachCount} agents need attention to prevent further breaches.` : 'Continue monitoring at-risk items.'
    }`,
    severity: currentValue >= 85 ? 'info' : 'warning',
  };
}

/**
 * Generate natural language insight for RAI Pass Rate KPI
 */
function generateRAIPassRateInsight(context: InsightContext): Insight {
  const { currentValue, trend, trendPercent, contributingFactors, additionalData } = context;
  const topFailure = contributingFactors?.[0];
  const agentTypeImpact = additionalData?.agentTypeImpact as Record<string, number> | undefined;
  const recentFailures = additionalData?.recentFailures as number | undefined;

  if (trend === 'down') {
    const typeNote = agentTypeImpact
      ? `Custom engine agents fail RAI checks ${((agentTypeImpact['custom_engine'] ?? 0) / (agentTypeImpact['declarative'] ?? 1)).toFixed(1)}x more than declarative agents.`
      : '';

    return {
      text: `RAI failures increased after policy update. ${
        recentFailures ? `${recentFailures} agents need re-review.` : ''
      } ${typeNote} Recommend enhanced pre-submission validation for custom agents.`,
      severity: currentValue < 85 ? 'critical' : 'warning',
      actionItems: [
        'Review RAI policy update impact',
        'Update validation documentation',
        'Provide targeted guidance for custom engine publishers',
      ],
    };
  }

  if (trend === 'up') {
    return {
      text: `RAI compliance improved ${formatPercent(trendPercent)}. ${
        topFailure ? `${topFailure.name} failures decreased significantly.` : 'Proactive validation preventing failures.'
      } Publisher guidance is effective.`,
      severity: 'success',
    };
  }

  return {
    text: `RAI pass rate stable at ${formatPercent(currentValue)}. ${
      currentValue >= 95 ? 'Excellent compliance levels.' : 'Monitor for emerging policy gaps.'
    }`,
    severity: currentValue >= 90 ? 'info' : 'warning',
  };
}

/**
 * Generate natural language insight for Active Incidents KPI
 */
function generateIncidentsInsight(context: InsightContext): Insight {
  const { currentValue, additionalData } = context;
  const criticalCount = additionalData?.criticalCount as number | undefined;
  const topIncident = additionalData?.topIncident as { name: string; impact: string } | undefined;

  // Low incident count
  if (currentValue <= 2) {
    return {
      text: 'Healthy incident count. Continue monitoring post-publish metrics for early detection.',
      severity: 'success',
    };
  }

  // Medium incident count
  if (currentValue <= 5) {
    const baseResult: Insight = {
      text: `${currentValue} incidents active. ${
        criticalCount
          ? `${criticalCount} critical incident${criticalCount > 1 ? 's' : ''} require${criticalCount === 1 ? 's' : ''} immediate attention.`
          : 'Monitor for escalation patterns.'
      }${topIncident ? ` Top concern: ${topIncident.name}.` : ''}`,
      severity: criticalCount && criticalCount > 0 ? 'warning' : 'info',
    };
    if (criticalCount) {
      baseResult.actionItems = ['Address critical incidents within 24 hours', 'Prepare rollback plans if needed'];
    }
    return baseResult;
  }

  // High incident count
  return {
    text: `Elevated incident level (${currentValue} active). ${
      topIncident
        ? `"${topIncident.name}" affecting ${topIncident.impact}.`
        : 'Multiple agents experiencing post-publish issues.'
    } Consider temporary submission pause for affected publishers.`,
    severity: 'critical',
    actionItems: [
      'Triage all critical incidents immediately',
      'Consider rollback for failing agents',
      'Communicate status to affected publishers',
    ],
  };
}

/**
 * Main insight generation function
 */
export function generateInsight(context: InsightContext): Insight {
  switch (context.metricType) {
    case 'time_to_publish':
      return generateTimeToPublishInsight(context);
    case 'approval_rate':
      return generateApprovalRateInsight(context);
    case 'sla_compliance':
      return generateSLAComplianceInsight(context);
    case 'rai_pass_rate':
      return generateRAIPassRateInsight(context);
    case 'active_incidents':
      return generateIncidentsInsight(context);
    default:
      return {
        text: 'Unable to generate insight for this metric.',
        severity: 'info',
      };
  }
}

/**
 * Determine trend direction based on current and previous values
 */
export function determineTrend(
  current: number,
  previous: number,
  threshold: number = 0.5
): TrendDirection {
  const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;

  if (changePercent > threshold) return 'up';
  if (changePercent < -threshold) return 'down';
  return 'stable';
}

/**
 * Calculate trend percentage
 */
export function calculateTrendPercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.abs(((current - previous) / previous) * 100);
}

/**
 * Get insight severity color for UI
 */
export function getInsightSeverityColor(severity: Insight['severity']): string {
  switch (severity) {
    case 'critical':
      return 'tw-text-status-critical';
    case 'warning':
      return 'tw-text-status-medium';
    case 'success':
      return 'tw-text-status-success';
    case 'info':
    default:
      return 'tw-text-aurora-cyan';
  }
}

/**
 * Get insight severity icon name
 */
export function getInsightSeverityIcon(severity: Insight['severity']): string {
  switch (severity) {
    case 'critical':
      return 'AlertTriangle';
    case 'warning':
      return 'AlertCircle';
    case 'success':
      return 'CheckCircle';
    case 'info':
    default:
      return 'Info';
  }
}
