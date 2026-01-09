'use client';

import { FC, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/Button';
import { X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useCopilot } from '@/hooks/useCopilot';
import { useMetrics, useSnapshots } from '@/hooks/useMetrics';
import { useAgent } from '@/hooks/useAgents';
import { usePublisher } from '@/hooks/usePublishers';
import { PromptChip } from '@/types/copilot';
import { Agent, Publisher } from '@/types/entities';
import {
  PromptChips,
  FollowUpPrompts,
  StructuredResponse,
  StreamingIndicator,
  ExportActions,
  QueryInput,
} from '@/components/features/copilot';

export interface InsightsPaneProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string | undefined;
  /** For agent detail pages */
  agentId?: string | undefined;
  /** For publisher detail pages */
  publisherId?: string | undefined;
  className?: string | undefined;
}

/**
 * AI Insights Pane - Copilot-style sidebar for AI-powered insights
 */
export const InsightsPane: FC<InsightsPaneProps> = ({
  isOpen,
  onClose,
  currentPage: currentPageProp,
  agentId,
  publisherId,
  className,
}) => {
  const pathname = usePathname();
  const currentPath = currentPageProp || pathname || '/overview';

  // Fetch data for AI context
  const { data: metricsResponse } = useMetrics({});
  const { data: snapshotsResponse } = useSnapshots({});
  const { data: agentResponse } = useAgent(agentId || '');
  const { data: publisherResponse } = usePublisher(publisherId || '');

  // Extract nested data from responses
  const metricsData = metricsResponse?.data;
  const snapshotsData = snapshotsResponse?.data;
  const agentData = agentResponse?.data;
  const publisherData = publisherResponse?.data;

  // Initialize copilot hook with context
  const {
    response,
    isLoading,
    error,
    currentPrompt,
    pageDisplayName,
    relevantPrompts,
    processPrompt,
    reset,
    isStreaming,
    streamedContent,
  } = useCopilot({
    currentPath,
    metrics: metricsData,
    trends: snapshotsData,
    selectedAgent: agentData as Agent | undefined,
    selectedPublisher: publisherData as Publisher | undefined,
    filters: { datePreset: '30d' },
    enableStreaming: true,
  });

  // Handle prompt chip click
  const handlePromptClick = useCallback(
    (prompt: PromptChip) => {
      processPrompt(prompt.label);
    },
    [processPrompt]
  );

  // Handle follow-up prompt click
  const handleFollowUpClick = useCallback(
    (prompt: string) => {
      processPrompt(prompt);
    },
    [processPrompt]
  );

  // Handle custom query submission
  const handleCustomQuery = useCallback(
    (query: string) => {
      processPrompt(query);
    },
    [processPrompt]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Reset when page changes
  useEffect(() => {
    reset();
  }, [currentPath, reset]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        'tw-w-[400px] tw-h-full tw-flex tw-flex-col',
        'tw-bg-obsidian-800 tw-border-l tw-border-obsidian-700',
        'tw-animate-slide-in-right',
        className
      )}
      role="complementary"
      aria-label="AI Insights Panel"
    >
      {/* Header */}
      <header className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-border-b tw-border-obsidian-700">
        <div className="tw-flex tw-items-center tw-gap-2">
          <Sparkles className="tw-w-5 tw-h-5 tw-text-aurora-cyan" aria-hidden="true" />
          <h2 className="tw-text-body tw-font-semibold tw-text-obsidian-100">
            AI Insights
          </h2>
        </div>
        <div className="tw-flex tw-items-center tw-gap-1">
          {response && (
            <IconButton
              variant="ghost"
              size="icon-sm"
              icon={<RefreshCw className="tw-w-4 tw-h-4" />}
              aria-label="Reset conversation"
              onClick={handleReset}
            />
          )}
          <IconButton
            variant="ghost"
            size="icon-sm"
            icon={<X className="tw-w-4 tw-h-4" />}
            aria-label="Close insights pane"
            onClick={onClose}
          />
        </div>
      </header>

      {/* Context indicator */}
      <div className="tw-px-4 tw-py-2 tw-bg-obsidian-900/50 tw-border-b tw-border-obsidian-700/50">
        <span className="tw-text-caption tw-text-obsidian-400">
          Context:{' '}
          <span className="tw-text-obsidian-300">{pageDisplayName}</span>
          {agentData && (
            <span className="tw-text-aurora-cyan"> - {agentData.name}</span>
          )}
          {publisherData && (
            <span className="tw-text-aurora-cyan"> - {publisherData.name}</span>
          )}
        </span>
      </div>

      {/* Prompt Chips */}
      <div className="tw-px-4 tw-py-3 tw-border-b tw-border-obsidian-700/50">
        <p className="tw-text-caption tw-text-obsidian-400 tw-mb-2">
          Ask about your data:
        </p>
        <PromptChips
          prompts={relevantPrompts}
          selectedId={currentPrompt}
          onSelect={handlePromptClick}
          isLoading={isLoading}
        />
      </div>

      {/* Custom Query Input */}
      <div className="tw-px-4 tw-py-3 tw-border-b tw-border-obsidian-700/50">
        <p className="tw-text-caption tw-text-obsidian-400 tw-mb-2">
          Or type your question:
        </p>
        <QueryInput
          onSubmit={handleCustomQuery}
          isLoading={isLoading}
          placeholder="Ask about your data..."
        />
      </div>

      {/* Response Area */}
      <div className="tw-flex-1 tw-overflow-y-auto tw-p-4">
        {error ? (
          <ErrorState message={error} onRetry={handleReset} />
        ) : isLoading && !isStreaming ? (
          <StreamingIndicator message="Analyzing data..." />
        ) : response ? (
          <div className="tw-space-y-4">
            <StructuredResponse
              response={response}
              isStreaming={isStreaming}
              streamedContent={streamedContent}
            />

            {/* Follow-up prompts */}
            {!isStreaming && response.suggestedPrompts.length > 0 && (
              <FollowUpPrompts
                prompts={response.suggestedPrompts}
                onSelect={handleFollowUpClick}
              />
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Footer Actions */}
      {response && !isStreaming && (
        <footer className="tw-px-4 tw-py-3 tw-border-t tw-border-obsidian-700">
          <ExportActions response={response} />
        </footer>
      )}
    </aside>
  );
};

/**
 * Empty state when no prompt has been selected
 */
const EmptyState: FC = () => (
  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-center tw-px-4">
    <Sparkles
      className="tw-w-12 tw-h-12 tw-text-obsidian-600 tw-mb-4"
      aria-hidden="true"
    />
    <p className="tw-text-body tw-text-obsidian-400 tw-mb-2">
      Select a prompt above to get AI-powered insights about your data
    </p>
    <p className="tw-text-caption tw-text-obsidian-500">
      Insights will be tailored to the current page and filters
    </p>
  </div>
);

/**
 * Error state component
 */
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-center tw-px-4">
    <AlertCircle
      className="tw-w-12 tw-h-12 tw-text-status-critical tw-mb-4"
      aria-hidden="true"
    />
    <p className="tw-text-body tw-text-obsidian-300 tw-mb-2">
      Something went wrong
    </p>
    <p className="tw-text-caption tw-text-obsidian-500 tw-mb-4">{message}</p>
    <Button variant="secondary" size="sm" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

export default InsightsPane;
