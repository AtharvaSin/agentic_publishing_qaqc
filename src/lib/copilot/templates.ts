/**
 * Narrative templates for AI-powered insights
 * Template interpolation uses ${variable} syntax
 */

import { NarrativeTemplate, TemplateVariables } from '@/types/copilot';

/**
 * Metric change narratives
 */
export const METRIC_CHANGE_TEMPLATES: Record<string, NarrativeTemplate> = {
  positive_strong: {
    id: 'metric_positive_strong',
    category: 'metric_change',
    tone: 'positive',
    templates: [
      '${metric} exceeded targets with a ${change}% improvement to ${value}${unit}.',
      'Strong performance in ${metric}: up ${change}% to ${value}${unit} this ${period}.',
      '${metric} has improved significantly, reaching ${value}${unit} (+${change}%).',
    ],
  },
  positive_moderate: {
    id: 'metric_positive_moderate',
    category: 'metric_change',
    tone: 'positive',
    templates: [
      '${metric} showed steady improvement at ${value}${unit} (+${change}%).',
      'Gradual improvement in ${metric} to ${value}${unit} this ${period}.',
    ],
  },
  negative_strong: {
    id: 'metric_negative_strong',
    category: 'metric_change',
    tone: 'negative',
    templates: [
      '${metric} declined significantly by ${change}% to ${value}${unit}.',
      'Concerning drop in ${metric}: down ${change}% from the previous ${period}.',
      '${metric} has degraded to ${value}${unit}, a ${change}% decrease requiring attention.',
    ],
  },
  negative_moderate: {
    id: 'metric_negative_moderate',
    category: 'metric_change',
    tone: 'warning',
    templates: [
      '${metric} dipped slightly to ${value}${unit} (-${change}%).',
      'Minor decline in ${metric} to ${value}${unit} this ${period}.',
    ],
  },
  stable: {
    id: 'metric_stable',
    category: 'metric_change',
    tone: 'neutral',
    templates: [
      '${metric} remained stable at ${value}${unit} with minimal variance.',
      '${metric} held steady at ${value}${unit} over the ${period}.',
    ],
  },
};

/**
 * Bottleneck narratives
 */
export const BOTTLENECK_TEMPLATES: NarrativeTemplate = {
  id: 'bottleneck',
  category: 'bottleneck',
  tone: 'warning',
  templates: [
    'The primary bottleneck is ${stage} with ${count} items averaging ${avgDays} days.',
    '${stage} is causing delays: ${count} submissions have been waiting ${avgDays}+ days.',
    'Submissions are backing up at ${stage}, with ${count} items currently queued.',
    'The ${stage} stage shows significant congestion with ${count} pending items.',
  ],
};

/**
 * Recommendation templates by category
 */
export const RECOMMENDATION_TEMPLATES: Record<string, string[]> = {
  high_backlog: [
    'Consider temporarily increasing review capacity or enabling fast-track for low-risk submissions.',
    'Prioritize clearing the backlog by focusing on submissions closest to SLA breach.',
    'Enable automated approval for declarative agents with clean validation results.',
  ],
  high_failure_rate: [
    'Focus on publisher education around ${topCategory} requirements.',
    'Implement pre-submission validation checks to catch ${topCategory} issues earlier.',
    'Create documentation improvements for ${topCategory} compliance.',
  ],
  sla_breach_risk: [
    'Escalate ${count} submissions at risk of SLA breach within 24 hours.',
    'Reassign pending reviews to available team members to meet SLA targets.',
    'Consider fast-tracking low-complexity submissions to free up review capacity.',
  ],
  publisher_coaching: [
    'Schedule a review session with ${publisherName} to address recurring ${topCategory} issues.',
    'Share the validation checklist with ${publisherName} to improve first-pass approval.',
    'Recommend ${publisherName} use the pre-validation tool before submission.',
  ],
  quality_degradation: [
    'Investigate root cause of ${metric} degradation over the past ${period}.',
    'Review recent platform changes that may have impacted ${metric}.',
    'Set up alerts for ${metric} to catch future degradations early.',
  ],
  rai_failures: [
    'Review RAI policy updates and ensure publishers are aware of new requirements.',
    'Add RAI validation checks to the pre-submission checklist.',
    'Provide RAI compliance training resources to publishers with recurring failures.',
  ],
};

/**
 * Summary templates by scenario
 */
export const SUMMARY_TEMPLATES: Record<string, string[]> = {
  overview: [
    'Publishing operations are ${overallStatus} with ${approvalRate}% approval rate and ${slaCompliance}% SLA compliance. ${highlightIssue}',
    'Current performance shows ${trend} trends in key metrics. ${approvalRate}% of submissions approved, with ${backlogSize} items in review queue.',
    'The publishing pipeline processed ${totalSubmissions} submissions this ${period}, achieving ${approvalRate}% approval rate. ${highlightIssue}',
  ],
  funnel: [
    'The publishing funnel shows ${bottleneckStage} as the primary bottleneck with ${bottleneckCount} pending items. Average time to publish is ${avgTime} days.',
    'Pipeline throughput analysis reveals congestion at ${bottleneckStage}. ${percentageInReview}% of submissions are currently in review stages.',
    'Funnel health: ${totalInPipeline} submissions in progress, with ${bottleneckCount} blocked at ${bottleneckStage}.',
  ],
  quality: [
    'Quality metrics show ${qualityStatus}: p99 latency at ${p99Latency}ms, availability at ${availability}%, RAI pass rate at ${raiRate}%.',
    'Agent readiness assessment: ${passCount} of ${totalCount} agents meeting all quality thresholds. ${highlightIssue}',
    'Quality gates indicate ${issueCount} agents require attention for ${topIssue} compliance.',
  ],
  agent_detail: [
    '${agentName} is currently ${status}. ${submissionSummary}. ${primaryIssue}',
    'Agent "${agentName}" by ${publisherName}: ${status} status with ${findingsCount} validation findings.',
    'Latest submission for ${agentName} ${outcome}. ${remediationSummary}',
  ],
  publisher_detail: [
    '${publisherName} has ${approvalRate}% approval rate across ${agentCount} agents. ${topIssue} is the primary failure category.',
    'Publisher performance: ${publisherName} submitted ${submissionCount} times with ${approvalRate}% success. Key improvement area: ${topIssue}.',
    '${publisherName} (${tier} tier): ${status} with ${avgLeadTime} day average lead time.',
  ],
  weekly_update: [
    'Weekly Publishing Operations Summary (${period}):\n\n- Submissions: ${totalSubmissions} (${submissionTrend})\n- Approvals: ${totalApprovals} (${approvalTrend})\n- SLA Compliance: ${slaCompliance}%\n- Review Backlog: ${backlogSize} items\n\nKey Issues:\n${keyIssues}\n\nRecommended Actions:\n${recommendedActions}',
  ],
};

/**
 * Assessment templates for entity evaluations
 */
export const ASSESSMENT_TEMPLATES: Record<string, string[]> = {
  healthy: [
    '${entityName} is performing well with all key metrics within target ranges.',
    'No significant issues detected for ${entityName}. Operations running smoothly.',
  ],
  at_risk: [
    '${entityName} shows early warning signs: ${warningMetrics}. Monitor closely.',
    'Attention needed: ${entityName} has ${issueCount} metrics trending negatively.',
  ],
  critical: [
    '${entityName} requires immediate attention: ${criticalIssues}.',
    'Critical status for ${entityName}. Multiple thresholds breached: ${criticalIssues}.',
  ],
};

/**
 * Interpolate template with variables
 */
export function interpolateTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      return match; // Keep placeholder if variable not found
    }
    return String(value);
  });
}

/**
 * Select random template from array
 */
export function selectTemplate(templates: string[]): string {
  if (templates.length === 0) {
    return '';
  }
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  return selectedTemplate ?? '';
}

/**
 * Generate narrative from template category
 */
export function generateNarrative(
  category: keyof typeof METRIC_CHANGE_TEMPLATES | 'bottleneck',
  variables: TemplateVariables
): string {
  const templateGroup = category === 'bottleneck'
    ? BOTTLENECK_TEMPLATES
    : METRIC_CHANGE_TEMPLATES[category];

  if (!templateGroup) {
    return '';
  }

  const template = selectTemplate(templateGroup.templates);
  return interpolateTemplate(template, variables);
}

/**
 * Generate recommendation text
 */
export function generateRecommendation(
  category: keyof typeof RECOMMENDATION_TEMPLATES,
  variables: TemplateVariables
): string {
  const templates = RECOMMENDATION_TEMPLATES[category];
  if (!templates) {
    return '';
  }

  const template = selectTemplate(templates);
  return interpolateTemplate(template, variables);
}

/**
 * Generate summary for scenario
 */
export function generateSummary(
  scenario: keyof typeof SUMMARY_TEMPLATES,
  variables: TemplateVariables
): string {
  const templates = SUMMARY_TEMPLATES[scenario];
  if (!templates) {
    return '';
  }

  const template = selectTemplate(templates);
  return interpolateTemplate(template, variables);
}
