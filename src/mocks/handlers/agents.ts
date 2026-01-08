/**
 * MSW handlers for agents API
 */

import { http, HttpResponse, delay } from 'msw';
import { agents, getAgentById } from '@/data/agents';
import { API_ENDPOINTS, AgentType, AgentStatus } from '@/lib/constants';

export const agentHandlers = [
  // Get all agents with optional filters
  http.get(API_ENDPOINTS.agents, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const publisherId = url.searchParams.get('publisherId');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.toLowerCase();

    let filteredAgents = [...agents];

    if (publisherId && publisherId !== 'all') {
      filteredAgents = filteredAgents.filter((a) => a.ownerId === publisherId);
    }

    if (type && type !== 'all') {
      filteredAgents = filteredAgents.filter((a) => a.type === (type as AgentType));
    }

    if (status && status !== 'all') {
      filteredAgents = filteredAgents.filter((a) => a.currentStatus === (status as AgentStatus));
    }

    if (search) {
      filteredAgents = filteredAgents.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.id.toLowerCase().includes(search) ||
          a.category.toLowerCase().includes(search)
      );
    }

    return HttpResponse.json({
      data: filteredAgents,
      total: filteredAgents.length,
    });
  }),

  // Get single agent by ID
  http.get(`${API_ENDPOINTS.agents}/:agentId`, async ({ params }) => {
    await delay(200);

    const { agentId } = params;
    const agent = getAgentById(agentId as string);

    if (!agent) {
      return HttpResponse.json(
        { error: 'Agent not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: agent });
  }),
];
