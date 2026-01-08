'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import {
  Inbox,
  Search,
  FileQuestion,
  AlertCircle,
  Filter,
  Users,
  Package,
  FileText,
} from 'lucide-react';

export interface EmptyStateProps {
  /** Type of empty state to display */
  type?: 'no-data' | 'no-results' | 'error' | 'filtered' | 'coming-soon' | undefined;
  /** Icon to display (overrides default based on type) */
  icon?: ReactNode | undefined;
  /** Main title */
  title?: string | undefined;
  /** Description text */
  description?: string | undefined;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  } | undefined;
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  } | undefined;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}

/**
 * Empty state component for showing when there's no data/results
 */
export const EmptyState: FC<EmptyStateProps> = ({
  type = 'no-data',
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const defaults = getDefaults(type);
  const displayIcon = icon ?? defaults.icon;
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;

  const sizeClasses = {
    sm: {
      container: 'tw-py-8',
      icon: 'tw-w-10 tw-h-10 tw-mb-3',
      title: 'tw-text-body tw-mb-1',
      description: 'tw-text-caption',
    },
    md: {
      container: 'tw-py-12',
      icon: 'tw-w-14 tw-h-14 tw-mb-4',
      title: 'tw-text-subtitle tw-mb-2',
      description: 'tw-text-body',
    },
    lg: {
      container: 'tw-py-16',
      icon: 'tw-w-20 tw-h-20 tw-mb-6',
      title: 'tw-text-title tw-mb-3',
      description: 'tw-text-body',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-px-4',
        classes.container,
        className
      )}
      role="status"
      aria-label={displayTitle}
    >
      <div
        className={cn(
          'tw-text-obsidian-500',
          classes.icon,
          '[&>svg]:tw-w-full [&>svg]:tw-h-full'
        )}
        aria-hidden="true"
      >
        {displayIcon}
      </div>

      <h3 className={cn('tw-font-semibold tw-text-obsidian-200', classes.title)}>
        {displayTitle}
      </h3>

      <p
        className={cn(
          'tw-text-obsidian-400 tw-max-w-md',
          classes.description,
          (action || secondaryAction) && 'tw-mb-6'
        )}
      >
        {displayDescription}
      </p>

      {(action || secondaryAction) && (
        <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-3">
          {action && (
            <Button variant="primary" size={size === 'lg' ? 'md' : 'sm'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Get default content based on empty state type
 */
function getDefaults(type: EmptyStateProps['type']): {
  icon: ReactNode;
  title: string;
  description: string;
} {
  switch (type) {
    case 'no-results':
      return {
        icon: <Search />,
        title: 'No results found',
        description:
          'Try adjusting your search or filter criteria to find what you\'re looking for.',
      };

    case 'error':
      return {
        icon: <AlertCircle />,
        title: 'Unable to load data',
        description:
          'We encountered an error loading this data. Please try again or contact support if the issue persists.',
      };

    case 'filtered':
      return {
        icon: <Filter />,
        title: 'No matching items',
        description:
          'No items match your current filter selection. Try clearing some filters to see more results.',
      };

    case 'coming-soon':
      return {
        icon: <FileQuestion />,
        title: 'Coming soon',
        description:
          'This feature is currently in development. Check back later for updates.',
      };

    case 'no-data':
    default:
      return {
        icon: <Inbox />,
        title: 'No data available',
        description:
          'There\'s no data to display at the moment. Data will appear here once it\'s available.',
      };
  }
}

/**
 * Pre-configured empty states for common scenarios
 */
export const EmptyStates = {
  /**
   * No agents found
   */
  NoAgents: ({ onReset }: { onReset?: () => void }) => (
    <EmptyState
      icon={<Package />}
      title="No agents found"
      description="No agents match your current filters. Try adjusting your criteria or clear filters to see all agents."
      action={onReset ? { label: 'Clear filters', onClick: onReset } : undefined}
    />
  ),

  /**
   * No publishers found
   */
  NoPublishers: ({ onReset }: { onReset?: () => void }) => (
    <EmptyState
      icon={<Users />}
      title="No publishers found"
      description="No publishers match your current filters. Try adjusting your criteria to see more results."
      action={onReset ? { label: 'Clear filters', onClick: onReset } : undefined}
    />
  ),

  /**
   * No submissions found
   */
  NoSubmissions: () => (
    <EmptyState
      icon={<FileText />}
      title="No submissions"
      description="There are no submissions for the selected period. Submissions will appear here once publishers start submitting agents."
    />
  ),

  /**
   * No search results
   */
  NoSearchResults: ({ query, onClear }: { query: string; onClear: () => void }) => (
    <EmptyState
      type="no-results"
      description={`No results found for "${query}". Try a different search term or check your spelling.`}
      action={{ label: 'Clear search', onClick: onClear }}
    />
  ),

  /**
   * Filtered empty state
   */
  FilteredEmpty: ({ onReset }: { onReset: () => void }) => (
    <EmptyState
      type="filtered"
      action={{ label: 'Reset filters', onClick: onReset }}
    />
  ),

  /**
   * Data loading error
   */
  LoadError: ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
      type="error"
      action={{ label: 'Try again', onClick: onRetry }}
    />
  ),
};

export default EmptyState;
