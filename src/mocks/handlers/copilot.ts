/**
 * MSW handler for Copilot API
 */

import { http, HttpResponse, delay } from 'msw';
import { CopilotRequest, CopilotApiResponse } from '@/types/copilot';
import { ruleEngine } from '@/lib/copilot';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Copilot API handlers
 */
export const copilotHandlers = [
  /**
   * POST /api/copilot - Process a copilot prompt
   */
  http.post(API_ENDPOINTS.copilot, async ({ request }) => {
    // Simulate AI processing delay
    await delay(1500);

    try {
      const body = (await request.json()) as CopilotRequest;
      const { prompt, context } = body;

      if (!prompt) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Prompt is required',
          } as CopilotApiResponse,
          { status: 400 }
        );
      }

      // Process with rule engine
      const response = ruleEngine.process(prompt, context);

      return HttpResponse.json({
        success: true,
        data: response,
      } as CopilotApiResponse);
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: 'Failed to process copilot request',
        } as CopilotApiResponse,
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/copilot/prompts - Get context-aware prompts
   */
  http.get(`${API_ENDPOINTS.copilot}/prompts`, async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const page = url.searchParams.get('page') || 'overview';

    // Return prompts based on page
    const prompts = getPromptsForPage(page);

    return HttpResponse.json({
      success: true,
      data: prompts,
    });
  }),
];

/**
 * Get relevant prompts for a page
 */
function getPromptsForPage(page: string): { id: string; label: string; icon: string }[] {
  const basePrompts = [
    { id: 'summarize', label: 'Summarize this view', icon: '📊' },
  ];

  switch (page) {
    case 'overview':
      return [
        ...basePrompts,
        { id: 'weekly_update', label: 'Generate weekly update', icon: '📝' },
        { id: 'bottleneck', label: 'What is the bottleneck?', icon: '🔍' },
        { id: 'top_failures', label: 'Top failure reasons', icon: '❌' },
        { id: 'at_risk', label: 'At-risk agents', icon: '⚠️' },
      ];

    case 'funnel':
      return [
        ...basePrompts,
        { id: 'bottleneck', label: 'What is the bottleneck?', icon: '🔍' },
        { id: 'backlog_drivers', label: 'Why is backlog growing?', icon: '📈' },
        { id: 'oldest', label: 'Oldest pending items', icon: '🕐' },
      ];

    case 'quality':
      return [
        ...basePrompts,
        { id: 'quality_issues', label: 'Quality threshold violations', icon: '🎯' },
        { id: 'latency', label: 'Latency trend analysis', icon: '📉' },
        { id: 'rai', label: 'RAI failure breakdown', icon: '🛡️' },
      ];

    case 'agent-detail':
      return [
        { id: 'explain_failure', label: 'Explain this failure', icon: '🔬' },
        { id: 'remediation', label: 'Generate fix checklist', icon: '✅' },
        { id: 'history', label: 'Analyze submission history', icon: '📜' },
        { id: 'draft_message', label: 'Draft partner message', icon: '✉️' },
      ];

    case 'publisher-detail':
      return [
        { id: 'assessment', label: 'Publisher assessment', icon: '📋' },
        { id: 'coaching', label: 'Coaching recommendations', icon: '🎓' },
        { id: 'recurring', label: 'Recurring failure patterns', icon: '🔄' },
        { id: 'qbr', label: 'Draft QBR summary', icon: '📊' },
      ];

    default:
      return basePrompts;
  }
}

export default copilotHandlers;
