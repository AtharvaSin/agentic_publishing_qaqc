/**
 * TanStack Query hook for agents data
 */

import { useQuery } from '@tanstack/react-query';
import { Agent } from '@/types/entities';
import { API_ENDPOINTS } from '@/lib/constants';
import { AgentType, AgentStatus } from '@/lib/constants';

interface AgentsResponse {
  data: Agent[];
  total: number;
}

interface AgentResponse {
  data: Agent;
}

interface UseAgentsOptions {
  publisherId?: string;
  type?: AgentType | 'all';
  status?: AgentStatus | 'all';
  search?: string;
}

async function fetchAgents(options: UseAgentsOptions = {}): Promise<AgentsResponse> {
  const params = new URLSearchParams();

  if (options.publisherId && options.publisherId !== 'all') {
    params.set('publisherId', options.publisherId);
  }
  if (options.type && options.type !== 'all') {
    params.set('type', options.type);
  }
  if (options.status && options.status !== 'all') {
    params.set('status', options.status);
  }
  if (options.search) {
    params.set('search', options.search);
  }

  const url = `${API_ENDPOINTS.agents}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch agents');
  }

  return response.json() as Promise<AgentsResponse>;
}

async function fetchAgent(agentId: string): Promise<AgentResponse> {
  const response = await fetch(`${API_ENDPOINTS.agents}/${agentId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch agent');
  }

  return response.json() as Promise<AgentResponse>;
}

export function useAgents(options: UseAgentsOptions = {}) {
  return useQuery({
    queryKey: ['agents', options],
    queryFn: () => fetchAgents(options),
  });
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgent(agentId),
    enabled: !!agentId,
  });
}
