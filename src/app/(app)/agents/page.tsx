'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Bot, ExternalLink, AlertCircle } from 'lucide-react';
import {
  AGENT_TYPE_LABELS,
  DISTRIBUTION_LABELS,
  STATUS_LABELS,
  AgentType,
  AgentStatus,
} from '@/lib/constants';
import { useAgents, usePublishers } from '@/hooks';
import type { Agent } from '@/types/entities';

// Facet filters
const statusFilters = ['all', 'active', 'pending_review', 'action_required', 'suspended'] as const;
const typeFilters = ['all', 'declarative', 'custom_engine', 'message_extension'] as const;

export default function AgentsPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Build filter options for the hook
  const agentFilterOptions = {
    type: typeFilter as AgentType | 'all',
    status: statusFilter as AgentStatus | 'all',
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  // Fetch agents with server-side filtering
  const {
    data: agentsResponse,
    isLoading,
    error,
  } = useAgents(agentFilterOptions);
  const agents = agentsResponse?.data ?? [];

  // Fetch publishers to map ownerId to publisher name
  const { data: publishersResponse } = usePublishers();
  const publisherMap = useMemo(() => {
    const map = new Map<string, string>();
    publishersResponse?.data?.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [publishersResponse?.data]);

  return (
    <div className="tw-flex tw-gap-6">
      {/* Sidebar Filters */}
      <aside className="tw-w-56 tw-flex-shrink-0">
        <Card padding="sm">
          <CardContent>
            <div className="tw-space-y-4">
              {/* Status Filter */}
              <div>
                <h4 className="tw-text-caption tw-font-semibold tw-text-obsidian-300 tw-mb-2">
                  Status
                </h4>
                <div className="tw-space-y-1">
                  {statusFilters.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        'tw-w-full tw-text-left tw-px-2 tw-py-1.5 tw-rounded-fluent tw-text-body',
                        'tw-transition-colors tw-duration-200',
                        statusFilter === status
                          ? 'tw-bg-obsidian-700 tw-text-obsidian-100'
                          : 'tw-text-obsidian-400 hover:tw-text-obsidian-200 hover:tw-bg-obsidian-700/50'
                      )}
                    >
                      {status === 'all' ? 'All Statuses' : STATUS_LABELS[status as AgentStatus]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h4 className="tw-text-caption tw-font-semibold tw-text-obsidian-300 tw-mb-2">
                  Agent Type
                </h4>
                <div className="tw-space-y-1">
                  {typeFilters.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        'tw-w-full tw-text-left tw-px-2 tw-py-1.5 tw-rounded-fluent tw-text-body',
                        'tw-transition-colors tw-duration-200',
                        typeFilter === type
                          ? 'tw-bg-obsidian-700 tw-text-obsidian-100'
                          : 'tw-text-obsidian-400 hover:tw-text-obsidian-200 hover:tw-bg-obsidian-700/50'
                      )}
                    >
                      {type === 'all' ? 'All Types' : AGENT_TYPE_LABELS[type as AgentType]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <div className="tw-flex-1">
        <Card>
          <CardHeader
            title={`Agents (${agents.length})`}
            subtitle="All registered agents in the system"
            action={
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search agents..."
                className="tw-w-64"
              />
            }
          />
          <CardContent>
            {/* Error State */}
            {error ? (
              <div className="tw-p-8 tw-text-center">
                <AlertCircle className="tw-w-8 tw-h-8 tw-text-status-critical tw-mx-auto tw-mb-2" />
                <p className="tw-text-obsidian-300">Failed to load agents</p>
                <p className="tw-text-caption tw-text-obsidian-500 tw-mt-1">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            ) : isLoading ? (
              /* Loading State */
              <div className="tw-p-8 tw-text-center tw-text-obsidian-400">Loading agents...</div>
            ) : agents.length === 0 ? (
              /* Empty State */
              <div className="tw-p-8 tw-text-center">
                <Bot className="tw-w-8 tw-h-8 tw-text-obsidian-500 tw-mx-auto tw-mb-2" />
                <p className="tw-text-obsidian-300">No agents found</p>
                <p className="tw-text-caption tw-text-obsidian-500 tw-mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              /* Data Table */
              <div className="tw-overflow-x-auto">
                <table className="tw-w-full tw-text-body">
                  <thead>
                    <tr className="tw-border-b tw-border-obsidian-700">
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Agent
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Type
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Publisher
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Distribution
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Status
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Category
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent: Agent) => (
                      <tr
                        key={agent.id}
                        className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-transition-colors"
                      >
                        <td className="tw-px-4 tw-py-3">
                          <div className="tw-flex tw-items-center tw-gap-3">
                            <div className="tw-w-8 tw-h-8 tw-rounded-fluent tw-bg-obsidian-700 tw-flex tw-items-center tw-justify-center">
                              <Bot className="tw-w-4 tw-h-4 tw-text-aurora-cyan" />
                            </div>
                            <div>
                              <span className="tw-text-obsidian-100 tw-font-medium">
                                {agent.name}
                              </span>
                              <div className="tw-text-caption tw-text-obsidian-500">{agent.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="tw-px-4 tw-py-3">
                          <Badge variant="outline" size="sm">
                            {AGENT_TYPE_LABELS[agent.type]}
                          </Badge>
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">
                          {publisherMap.get(agent.ownerId) ?? agent.ownerId}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">
                          {DISTRIBUTION_LABELS[agent.distributionMethod]}
                        </td>
                        <td className="tw-px-4 tw-py-3">
                          <Badge
                            variant={
                              agent.currentStatus === 'active'
                                ? 'success'
                                : agent.currentStatus === 'suspended'
                                  ? 'error'
                                  : agent.currentStatus === 'action_required'
                                    ? 'warning'
                                    : 'blue'
                            }
                            dot
                          >
                            {STATUS_LABELS[agent.currentStatus]}
                          </Badge>
                        </td>
                        <td className="tw-px-4 tw-py-3">
                          <span className="tw-text-caption tw-text-obsidian-400">
                            {agent.category}
                          </span>
                        </td>
                        <td className="tw-px-4 tw-py-3">
                          <Link href={`/agents/${agent.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              rightIcon={<ExternalLink className="tw-w-3 tw-h-3" />}
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
