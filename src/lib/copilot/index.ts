/**
 * Copilot AI Insights Engine exports
 */

// Rule Engine
export { RuleEngine, ruleEngine } from './RuleEngine';

// Narrative Generator
export { NarrativeGenerator, narrativeGenerator } from './NarrativeGenerator';

// Templates
export {
  METRIC_CHANGE_TEMPLATES,
  BOTTLENECK_TEMPLATES,
  RECOMMENDATION_TEMPLATES,
  SUMMARY_TEMPLATES,
  ASSESSMENT_TEMPLATES,
  interpolateTemplate,
  selectTemplate,
  generateNarrative,
  generateRecommendation,
  generateSummary,
} from './templates';

// Prompts
export {
  PROMPT_CHIPS,
  getRelevantPrompts,
  getTopPrompts,
  generateFollowUpPrompts,
  pathToCopilotPage,
  getPageDisplayName,
} from './prompts';
