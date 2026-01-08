'use client';

import { FC, useState } from 'react';
import { cn } from '@/lib/utils';
import { DATE_PRESETS, DatePresetValue, PUBLISHER_TIERS, AGENT_TYPES } from '@/lib/constants';
import { Button, IconButton } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RefreshCw, Download, Sparkles, Filter, X } from 'lucide-react';

export interface FilterState {
  datePreset: DatePresetValue;
  publisher: string;
  agentType: string;
  status: string;
}

export interface CommandBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onOpenInsights?: () => void;
  isInsightsOpen?: boolean;
  className?: string;
}

export const CommandBar: FC<CommandBarProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  onOpenInsights,
  isInsightsOpen = false,
  className,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = (): void => {
    onFiltersChange({
      datePreset: '30d',
      publisher: 'all',
      agentType: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters =
    filters.publisher !== 'all' || filters.agentType !== 'all' || filters.status !== 'all';

  return (
    <div className={cn('tw-border-b tw-border-obsidian-700 tw-bg-obsidian-800', className)}>
      {/* Main Command Bar */}
      <div className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-gap-4">
        {/* Left Section - Date Presets */}
        <div className="tw-flex tw-items-center tw-gap-2">
          <div className="tw-flex tw-bg-obsidian-900 tw-rounded-fluent tw-p-0.5">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => updateFilter('datePreset', preset.value)}
                className={cn(
                  'tw-px-3 tw-py-1.5 tw-text-caption tw-font-medium tw-rounded-fluent',
                  'tw-transition-colors tw-duration-200',
                  'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan',
                  filters.datePreset === preset.value
                    ? 'tw-bg-obsidian-700 tw-text-obsidian-100'
                    : 'tw-text-obsidian-400 hover:tw-text-obsidian-200'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="tw-w-4 tw-h-4" />}
            className={cn(hasActiveFilters && 'tw-text-aurora-cyan')}
          >
            Filters
            {hasActiveFilters && (
              <span className="tw-ml-1 tw-px-1.5 tw-py-0.5 tw-bg-aurora-cyan/20 tw-rounded-full tw-text-[10px]">
                {[filters.publisher, filters.agentType, filters.status].filter((f) => f !== 'all').length}
              </span>
            )}
          </Button>
        </div>

        {/* Right Section - Actions */}
        <div className="tw-flex tw-items-center tw-gap-2">
          <IconButton
            variant="ghost"
            size="icon-sm"
            icon={<RefreshCw className="tw-w-4 tw-h-4" />}
            aria-label="Refresh data"
            onClick={onRefresh}
          />
          <IconButton
            variant="ghost"
            size="icon-sm"
            icon={<Download className="tw-w-4 tw-h-4" />}
            aria-label="Export data"
            onClick={onExport}
          />
          <Button
            variant={isInsightsOpen ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<Sparkles className="tw-w-4 tw-h-4" />}
            onClick={onOpenInsights}
          >
            AI Insights
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="tw-px-4 tw-pb-3 tw-pt-1 tw-border-t tw-border-obsidian-700/50">
          <div className="tw-flex tw-items-end tw-gap-4 tw-flex-wrap">
            <div className="tw-w-48">
              <Select
                label="Publisher"
                value={filters.publisher}
                onChange={(e) => updateFilter('publisher', e.target.value)}
                options={[
                  { label: 'All Publishers', value: 'all' },
                  ...PUBLISHER_TIERS.map((tier) => ({
                    label: tier.charAt(0).toUpperCase() + tier.slice(1),
                    value: tier,
                  })),
                ]}
              />
            </div>
            <div className="tw-w-48">
              <Select
                label="Agent Type"
                value={filters.agentType}
                onChange={(e) => updateFilter('agentType', e.target.value)}
                options={[
                  { label: 'All Types', value: 'all' },
                  ...AGENT_TYPES.map((type) => ({
                    label: type
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' '),
                    value: type,
                  })),
                ]}
              />
            </div>
            <div className="tw-w-48">
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Pending Review', value: 'pending_review' },
                  { label: 'Action Required', value: 'action_required' },
                  { label: 'Suspended', value: 'suspended' },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={<X className="tw-w-4 tw-h-4" />}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
