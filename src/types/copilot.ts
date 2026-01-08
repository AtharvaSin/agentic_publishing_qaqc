/**
 * Copilot AI Insights type definitions
 */

import { Agent, Publisher, Submission, ComputedMetrics, FilterParams, DailySnapshot } from './entities';

/**
 * AI Response structure - consistent across all scenarios
 */
export interface AIResponse {
  summary: string;
  keyDrivers: KeyDriver[];
  recommendations: Recommendation[];
  suggestedPrompts: string[];
  metadata: AIResponseMetadata;
}

export interface KeyDriver {
  driver: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  metric?: string;
  delta?: number;
}

export interface Recommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  timeEstimate?: string;
  link?: {
    label: string;
    href: string;
  };
}

export interface AIResponseMetadata {
  confidence: number;
  sources: string[];
  generatedAt: string;
  scenario: CopilotScenario;
  processingTime?: number;
}

/**
 * Copilot scenarios
 */
export type CopilotScenario =
  | 'submission_triage'
  | 'bottleneck_explainer'
  | 'publisher_coaching'
  | 'weekly_summary'
  | 'quality_analysis'
  | 'at_risk_agents'
  | 'general';

/**
 * Data context for AI processing
 */
export interface DataContext {
  currentPage: CopilotPage;
  filters: FilterParams;
  computedMetrics?: ComputedMetrics | undefined;
  selectedEntity?: SelectedEntity | undefined;
  dailyTrends?: DailySnapshot[] | undefined;
}

export type CopilotPage =
  | 'overview'
  | 'funnel'
  | 'quality'
  | 'agents'
  | 'agent-detail'
  | 'publishers'
  | 'publisher-detail';

export type SelectedEntity =
  | { type: 'agent'; data: Agent; submissions?: Submission[] | undefined }
  | { type: 'publisher'; data: Publisher; agents?: Agent[] | undefined }
  | { type: 'submission'; data: Submission };

/**
 * Prompt chip definition
 */
export interface PromptChip {
  id: string;
  label: string;
  icon: string;
  scenario: CopilotScenario;
  /** Pages where this prompt is relevant */
  relevantPages: CopilotPage[];
  /** Priority for ordering (higher = shown first) */
  priority: number;
  /** Whether this prompt requires a selected entity */
  requiresEntity?: boolean;
}

/**
 * Pattern rule for deterministic AI engine
 */
export interface PatternRule {
  id: string;
  name: string;
  /** Regex patterns to match user prompts */
  patterns: RegExp[];
  /** Function to check if rule applies to current context */
  contextMatch?: (context: DataContext) => boolean;
  /** Higher priority = evaluated first */
  priority: number;
  /** Handler function to generate response */
  handler: (prompt: string, context: DataContext) => AIResponse;
}

/**
 * Narrative template
 */
export interface NarrativeTemplate {
  id: string;
  category: 'metric_change' | 'bottleneck' | 'recommendation' | 'assessment' | 'summary';
  tone: 'positive' | 'negative' | 'neutral' | 'warning';
  templates: string[];
}

/**
 * Template variables for interpolation
 */
export interface TemplateVariables {
  // Metric variables
  metric?: string;
  value?: string | number;
  unit?: string;
  change?: number;
  period?: string;
  direction?: 'up' | 'down' | 'stable';

  // Entity variables
  entityName?: string;
  entityType?: string;
  publisherName?: string;
  agentName?: string;

  // Bottleneck variables
  stage?: string;
  count?: number;
  avgDays?: number;

  // Failure variables
  topCategory?: string;
  failureCount?: number;

  // Custom variables
  [key: string]: string | number | undefined;
}

/**
 * Copilot request payload
 */
export interface CopilotRequest {
  prompt: string;
  context: DataContext;
}

/**
 * Copilot API response
 */
export interface CopilotApiResponse {
  success: boolean;
  data?: AIResponse;
  error?: string;
}

/**
 * Streaming chunk for typing effect
 */
export interface StreamingChunk {
  type: 'summary' | 'driver' | 'recommendation' | 'prompt' | 'complete';
  content: string | KeyDriver | Recommendation;
  index?: number;
}

/**
 * Export default response for empty states
 */
export const EMPTY_AI_RESPONSE: AIResponse = {
  summary: '',
  keyDrivers: [],
  recommendations: [],
  suggestedPrompts: [],
  metadata: {
    confidence: 0,
    sources: [],
    generatedAt: new Date().toISOString(),
    scenario: 'general',
  },
};
