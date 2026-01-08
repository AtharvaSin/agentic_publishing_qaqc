/**
 * Context-aware prompt suggestions for the Copilot panel
 */

import { PromptChip, CopilotPage, DataContext } from '@/types/copilot';

/**
 * All available prompt chips
 */
export const PROMPT_CHIPS: PromptChip[] = [
  // Overview prompts
  {
    id: 'summarize_view',
    label: 'Summarize this view',
    icon: '📊',
    scenario: 'general',
    relevantPages: ['overview', 'funnel', 'quality', 'agents', 'publishers'],
    priority: 100,
  },
  {
    id: 'weekly_update',
    label: 'Generate weekly update',
    icon: '📝',
    scenario: 'weekly_summary',
    relevantPages: ['overview'],
    priority: 95,
  },
  {
    id: 'bottleneck',
    label: 'What is the bottleneck?',
    icon: '🔍',
    scenario: 'bottleneck_explainer',
    relevantPages: ['overview', 'funnel'],
    priority: 90,
  },
  {
    id: 'top_failures',
    label: 'Top failure reasons',
    icon: '❌',
    scenario: 'general',
    relevantPages: ['overview', 'funnel', 'quality'],
    priority: 85,
  },
  {
    id: 'at_risk_agents',
    label: 'At-risk agents',
    icon: '⚠️',
    scenario: 'at_risk_agents',
    relevantPages: ['overview', 'quality', 'agents'],
    priority: 80,
  },
  {
    id: 'sla_analysis',
    label: 'SLA compliance analysis',
    icon: '⏱️',
    scenario: 'general',
    relevantPages: ['overview', 'funnel'],
    priority: 75,
  },

  // Funnel-specific prompts
  {
    id: 'backlog_drivers',
    label: 'Why is backlog growing?',
    icon: '📈',
    scenario: 'bottleneck_explainer',
    relevantPages: ['funnel'],
    priority: 88,
  },
  {
    id: 'oldest_submissions',
    label: 'Oldest pending items',
    icon: '🕐',
    scenario: 'general',
    relevantPages: ['funnel'],
    priority: 70,
  },

  // Quality-specific prompts
  {
    id: 'quality_issues',
    label: 'Quality threshold violations',
    icon: '🎯',
    scenario: 'quality_analysis',
    relevantPages: ['quality'],
    priority: 85,
  },
  {
    id: 'latency_analysis',
    label: 'Latency trend analysis',
    icon: '📉',
    scenario: 'quality_analysis',
    relevantPages: ['quality'],
    priority: 75,
  },
  {
    id: 'rai_failures',
    label: 'RAI failure breakdown',
    icon: '🛡️',
    scenario: 'quality_analysis',
    relevantPages: ['quality'],
    priority: 70,
  },

  // Agent detail prompts
  {
    id: 'explain_failure',
    label: 'Explain this failure',
    icon: '🔬',
    scenario: 'submission_triage',
    relevantPages: ['agent-detail'],
    priority: 100,
    requiresEntity: true,
  },
  {
    id: 'remediation_checklist',
    label: 'Generate fix checklist',
    icon: '✅',
    scenario: 'submission_triage',
    relevantPages: ['agent-detail'],
    priority: 95,
    requiresEntity: true,
  },
  {
    id: 'submission_history',
    label: 'Analyze submission history',
    icon: '📜',
    scenario: 'submission_triage',
    relevantPages: ['agent-detail'],
    priority: 80,
    requiresEntity: true,
  },
  {
    id: 'draft_partner_message',
    label: 'Draft partner message',
    icon: '✉️',
    scenario: 'submission_triage',
    relevantPages: ['agent-detail'],
    priority: 75,
    requiresEntity: true,
  },

  // Publisher detail prompts
  {
    id: 'publisher_assessment',
    label: 'Publisher assessment',
    icon: '📋',
    scenario: 'publisher_coaching',
    relevantPages: ['publisher-detail'],
    priority: 100,
    requiresEntity: true,
  },
  {
    id: 'coaching_recommendations',
    label: 'Coaching recommendations',
    icon: '🎓',
    scenario: 'publisher_coaching',
    relevantPages: ['publisher-detail'],
    priority: 95,
    requiresEntity: true,
  },
  {
    id: 'recurring_issues',
    label: 'Recurring failure patterns',
    icon: '🔄',
    scenario: 'publisher_coaching',
    relevantPages: ['publisher-detail', 'publishers'],
    priority: 85,
    requiresEntity: true,
  },
  {
    id: 'draft_qbr_summary',
    label: 'Draft QBR summary',
    icon: '📊',
    scenario: 'publisher_coaching',
    relevantPages: ['publisher-detail'],
    priority: 70,
    requiresEntity: true,
  },

  // Agent list prompts
  {
    id: 'agents_needing_attention',
    label: 'Agents needing attention',
    icon: '👀',
    scenario: 'at_risk_agents',
    relevantPages: ['agents'],
    priority: 85,
  },
  {
    id: 'status_distribution',
    label: 'Status distribution analysis',
    icon: '📊',
    scenario: 'general',
    relevantPages: ['agents'],
    priority: 70,
  },

  // Publisher list prompts
  {
    id: 'publisher_ranking',
    label: 'Publisher performance ranking',
    icon: '🏆',
    scenario: 'general',
    relevantPages: ['publishers'],
    priority: 85,
  },
  {
    id: 'publishers_needing_coaching',
    label: 'Publishers needing coaching',
    icon: '📚',
    scenario: 'publisher_coaching',
    relevantPages: ['publishers'],
    priority: 80,
  },
];

/**
 * Get relevant prompts for current page and context
 */
export function getRelevantPrompts(context: DataContext): PromptChip[] {
  const { currentPage, selectedEntity } = context;

  return PROMPT_CHIPS
    .filter((chip) => {
      // Must be relevant to current page
      if (!chip.relevantPages.includes(currentPage)) {
        return false;
      }

      // If requires entity, must have one selected
      if (chip.requiresEntity && !selectedEntity) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get top N prompts for current context
 */
export function getTopPrompts(context: DataContext, limit: number = 5): PromptChip[] {
  return getRelevantPrompts(context).slice(0, limit);
}

/**
 * Generate follow-up prompts based on current response
 */
export function generateFollowUpPrompts(
  currentScenario: string,
  context: DataContext
): string[] {
  const followUps: string[] = [];

  switch (currentScenario) {
    case 'bottleneck_explainer':
      followUps.push(
        'Show oldest pending submissions',
        'Which publishers are affected?',
        'Generate escalation email'
      );
      break;

    case 'submission_triage':
      followUps.push(
        'Show similar past failures',
        'Draft fix instructions for publisher',
        'Estimate time to resolution'
      );
      break;

    case 'publisher_coaching':
      followUps.push(
        'Show detailed failure breakdown',
        'Compare to similar publishers',
        'Generate improvement roadmap'
      );
      break;

    case 'at_risk_agents':
      followUps.push(
        'Show risk details for top agent',
        'Generate risk summary report',
        'Prioritize review queue'
      );
      break;

    case 'quality_analysis':
      followUps.push(
        'Show affected agents',
        'Trend over last 30 days',
        'Generate quality report'
      );
      break;

    case 'weekly_summary':
      followUps.push(
        'Add more detail on failures',
        'Include publisher breakdown',
        'Format for email'
      );
      break;

    default:
      // Generic follow-ups based on page
      if (context.currentPage === 'overview') {
        followUps.push('Drill into top issue', 'Generate weekly update');
      } else if (context.currentPage === 'funnel') {
        followUps.push('Show bottleneck details', 'Oldest pending items');
      } else if (context.currentPage === 'quality') {
        followUps.push('Show violations', 'RAI failure details');
      }
  }

  return followUps.slice(0, 3);
}

/**
 * Map page path to CopilotPage type
 */
export function pathToCopilotPage(path: string): CopilotPage {
  const cleanPath = path.replace(/^\//, '').toLowerCase();

  if (cleanPath.startsWith('agents/') && cleanPath !== 'agents') {
    return 'agent-detail';
  }
  if (cleanPath.startsWith('publishers/') && cleanPath !== 'publishers') {
    return 'publisher-detail';
  }

  switch (cleanPath) {
    case 'overview':
    case '':
      return 'overview';
    case 'funnel':
      return 'funnel';
    case 'quality':
      return 'quality';
    case 'agents':
      return 'agents';
    case 'publishers':
      return 'publishers';
    default:
      return 'overview';
  }
}

/**
 * Get page display name
 */
export function getPageDisplayName(page: CopilotPage): string {
  const names: Record<CopilotPage, string> = {
    overview: 'Overview',
    funnel: 'Publishing Funnel',
    quality: 'Quality & Readiness',
    agents: 'Agents',
    'agent-detail': 'Agent Detail',
    publishers: 'Publishers',
    'publisher-detail': 'Publisher Detail',
  };
  return names[page] || 'Dashboard';
}
