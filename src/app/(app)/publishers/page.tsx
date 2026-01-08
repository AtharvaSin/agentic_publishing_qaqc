'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Building2, ExternalLink, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { PUBLISHER_TIERS, TIER_LABELS, PublisherTier, REGIONS, Region } from '@/lib/constants';
import { usePublishers, useAgents } from '@/hooks';
import { Publisher } from '@/types/entities';

// Tier filters
const tierFilters = ['all', ...PUBLISHER_TIERS] as const;
const regionFilters = ['all', ...REGIONS] as const;

// Top failure categories for demo
const TOP_FAILURES = [
  'Manifest Issues',
  'RAI Validation',
  'Metadata',
  'Functional Tests',
  'Policy Violations',
  'Security Concerns',
  'Test Instructions',
  'Multiple Issues',
];

/**
 * Get a deterministic top failure based on publisher ID
 */
function getTopFailure(publisherId: string): string {
  // Use the last character of the ID to pick a failure category
  if (publisherId.length === 0) return TOP_FAILURES[0] ?? 'Unknown';
  const lastChar = publisherId.charAt(publisherId.length - 1);
  const index = lastChar.charCodeAt(0) % TOP_FAILURES.length;
  return TOP_FAILURES[index] ?? 'Unknown';
}

/**
 * Get a deterministic pass rate trend based on publisher ID
 */
function getPassRateTrend(passRate: number, publisherId: string): 'up' | 'down' | 'neutral' {
  const charCode = publisherId.charCodeAt(0);
  if (passRate >= 80) return charCode % 2 === 0 ? 'up' : 'neutral';
  if (passRate >= 70) return charCode % 3 === 0 ? 'up' : charCode % 3 === 1 ? 'neutral' : 'down';
  return 'down';
}

export default function PublishersPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  // Build options for usePublishers hook
  const publisherOptions = {
    tier: tierFilter as PublisherTier | 'all',
    region: regionFilter as Region | 'all',
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  // Fetch publishers with server-side filtering
  const {
    data: publishersResponse,
    isLoading,
    error
  } = usePublishers(publisherOptions);

  // Fetch all agents to calculate publisher stats
  const { data: agentsResponse } = useAgents();

  // Memoize publishers list
  const publishers = useMemo(() => {
    return publishersResponse?.data ?? [];
  }, [publishersResponse?.data]);

  // Calculate publisher stats from agents data
  const publisherStats = useMemo(() => {
    const stats = new Map<string, {
      activeAgents: number;
      passRate: number;
      avgLeadTime: number;
      passRateTrend: 'up' | 'down' | 'neutral';
      topFailure: string;
    }>();
    const agents = agentsResponse?.data ?? [];

    // Group agents by publisher and calculate stats
    publishers.forEach((pub: Publisher) => {
      const pubAgents = agents.filter(a => a.ownerId === pub.id);
      const activeCount = pubAgents.filter(a => a.currentStatus === 'active').length;

      // Generate deterministic mock values based on publisher ID for demo
      // Using charCode sum for variety but consistency
      const idSum = pub.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const passRate = 55 + (idSum % 40); // Range: 55-94%
      const avgLeadTime = 2.5 + (idSum % 50) / 10; // Range: 2.5-7.4 days

      stats.set(pub.id, {
        activeAgents: pubAgents.length > 0 ? pubAgents.length : activeCount || Math.max(1, idSum % 10),
        passRate,
        avgLeadTime,
        passRateTrend: getPassRateTrend(passRate, pub.id),
        topFailure: getTopFailure(pub.id),
      });
    });
    return stats;
  }, [publishers, agentsResponse?.data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
          <Loader2 className="tw-w-8 tw-h-8 tw-text-aurora-purple tw-animate-spin" />
          <span className="tw-text-obsidian-400">Loading publishers...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
          <AlertCircle className="tw-w-8 tw-h-8 tw-text-status-critical" />
          <span className="tw-text-obsidian-300">Failed to load publishers</span>
          <span className="tw-text-caption tw-text-obsidian-500">
            {error instanceof Error ? error.message : 'Unknown error'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-flex tw-gap-6">
      {/* Sidebar Filters */}
      <aside className="tw-w-56 tw-flex-shrink-0">
        <Card padding="sm">
          <CardContent>
            <div className="tw-space-y-4">
              {/* Tier Filter */}
              <div>
                <h4 className="tw-text-caption tw-font-semibold tw-text-obsidian-300 tw-mb-2">
                  Publisher Tier
                </h4>
                <div className="tw-space-y-1">
                  {tierFilters.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTierFilter(tier)}
                      className={cn(
                        'tw-w-full tw-text-left tw-px-2 tw-py-1.5 tw-rounded-fluent tw-text-body',
                        'tw-transition-colors tw-duration-200',
                        tierFilter === tier
                          ? 'tw-bg-obsidian-700 tw-text-obsidian-100'
                          : 'tw-text-obsidian-400 hover:tw-text-obsidian-200 hover:tw-bg-obsidian-700/50'
                      )}
                    >
                      {tier === 'all' ? 'All Tiers' : TIER_LABELS[tier as PublisherTier]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Filter */}
              <div>
                <h4 className="tw-text-caption tw-font-semibold tw-text-obsidian-300 tw-mb-2">
                  Region
                </h4>
                <div className="tw-space-y-1">
                  {regionFilters.map((region) => (
                    <button
                      key={region}
                      onClick={() => setRegionFilter(region)}
                      className={cn(
                        'tw-w-full tw-text-left tw-px-2 tw-py-1.5 tw-rounded-fluent tw-text-body',
                        'tw-transition-colors tw-duration-200',
                        regionFilter === region
                          ? 'tw-bg-obsidian-700 tw-text-obsidian-100'
                          : 'tw-text-obsidian-400 hover:tw-text-obsidian-200 hover:tw-bg-obsidian-700/50'
                      )}
                    >
                      {region === 'all' ? 'All Regions' : region}
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
            title={`Publishers (${publishers.length})`}
            subtitle="Partner organizations publishing agents"
            action={
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search publishers..."
                className="tw-w-64"
              />
            }
          />
          <CardContent>
            {publishers.length === 0 ? (
              <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12">
                <Building2 className="tw-w-12 tw-h-12 tw-text-obsidian-600 tw-mb-3" />
                <span className="tw-text-obsidian-400">No publishers found</span>
                <span className="tw-text-caption tw-text-obsidian-500 tw-mt-1">
                  Try adjusting your filters or search query
                </span>
              </div>
            ) : (
              <div className="tw-overflow-x-auto">
                <table className="tw-w-full tw-text-body">
                  <thead>
                    <tr className="tw-border-b tw-border-obsidian-700">
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Publisher
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Tier
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Region
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Active Agents
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Pass Rate
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Avg Lead Time
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Top Failure
                      </th>
                      <th className="tw-text-left tw-px-4 tw-py-3 tw-text-caption tw-font-semibold tw-text-obsidian-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publishers.map((publisher: Publisher) => {
                      const stats = publisherStats.get(publisher.id);
                      const passRate = stats?.passRate ?? 75;
                      const avgLeadTime = stats?.avgLeadTime ?? 4.0;
                      const passRateTrend = stats?.passRateTrend ?? 'neutral';
                      const topFailure = stats?.topFailure ?? 'Unknown';
                      const activeAgents = stats?.activeAgents ?? 0;

                      return (
                        <tr
                          key={publisher.id}
                          className="tw-border-b tw-border-obsidian-700/50 hover:tw-bg-obsidian-700/30 tw-transition-colors"
                        >
                          <td className="tw-px-4 tw-py-3">
                            <div className="tw-flex tw-items-center tw-gap-3">
                              <div className="tw-w-8 tw-h-8 tw-rounded-fluent tw-bg-obsidian-700 tw-flex tw-items-center tw-justify-center">
                                <Building2 className="tw-w-4 tw-h-4 tw-text-aurora-purple" />
                              </div>
                              <div>
                                <span className="tw-text-obsidian-100 tw-font-medium">{publisher.name}</span>
                                <div className="tw-text-caption tw-text-obsidian-500">{publisher.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="tw-px-4 tw-py-3">
                            <Badge
                              variant={
                                publisher.tier === 'strategic'
                                  ? 'purple'
                                  : publisher.tier === 'standard'
                                    ? 'blue'
                                    : 'default'
                              }
                              size="sm"
                            >
                              {TIER_LABELS[publisher.tier]}
                            </Badge>
                          </td>
                          <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">{publisher.region}</td>
                          <td className="tw-px-4 tw-py-3 tw-text-obsidian-300">{activeAgents}</td>
                          <td className="tw-px-4 tw-py-3">
                            <div className="tw-flex tw-items-center tw-gap-1">
                              <span
                                className={cn(
                                  'tw-font-medium',
                                  passRate >= 80
                                    ? 'tw-text-status-success'
                                    : passRate >= 70
                                      ? 'tw-text-status-medium'
                                      : 'tw-text-status-critical'
                                )}
                              >
                                {passRate}%
                              </span>
                              {passRateTrend === 'up' && (
                                <TrendingUp className="tw-w-3 tw-h-3 tw-text-status-success" />
                              )}
                              {passRateTrend === 'down' && (
                                <TrendingDown className="tw-w-3 tw-h-3 tw-text-status-critical" />
                              )}
                            </div>
                          </td>
                          <td className="tw-px-4 tw-py-3">
                            <span
                              className={cn(
                                avgLeadTime > 5
                                  ? 'tw-text-status-medium'
                                  : 'tw-text-obsidian-300'
                              )}
                            >
                              {avgLeadTime.toFixed(1)} days
                            </span>
                          </td>
                          <td className="tw-px-4 tw-py-3">
                            <Badge variant="error" size="sm">
                              {topFailure}
                            </Badge>
                          </td>
                          <td className="tw-px-4 tw-py-3">
                            <Link href={`/publishers/${publisher.id}`}>
                              <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="tw-w-3 tw-h-3" />}>
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
