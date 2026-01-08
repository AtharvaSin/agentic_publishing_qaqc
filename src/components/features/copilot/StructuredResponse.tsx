'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils';
import { AIResponse, KeyDriver, Recommendation } from '@/types/copilot';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ChevronRight, ExternalLink } from 'lucide-react';

export interface StructuredResponseProps {
  response: AIResponse;
  isStreaming?: boolean;
  streamedContent?: string;
  className?: string;
}

/**
 * Renders a structured AI response with Summary, Key Drivers, and Recommendations
 */
export const StructuredResponse: FC<StructuredResponseProps> = ({
  response,
  isStreaming = false,
  streamedContent = '',
  className,
}) => {
  const displaySummary = isStreaming ? streamedContent : response.summary;

  return (
    <div className={cn('tw-space-y-4', className)}>
      {/* Summary */}
      <Card padding="sm">
        <CardHeader title="Summary" />
        <CardContent>
          <div className="tw-text-body tw-text-obsidian-200 tw-whitespace-pre-wrap">
            {displaySummary}
            {isStreaming && (
              <span className="tw-inline-block tw-w-2 tw-h-4 tw-ml-0.5 tw-bg-aurora-cyan tw-animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Drivers - only show when not streaming or streaming is complete */}
      {!isStreaming && response.keyDrivers.length > 0 && (
        <Card padding="sm">
          <CardHeader title="Key Drivers" />
          <CardContent>
            <ul className="tw-space-y-2">
              {response.keyDrivers.map((driver, index) => (
                <KeyDriverItem key={index} driver={driver} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations - only show when not streaming */}
      {!isStreaming && response.recommendations.length > 0 && (
        <Card padding="sm">
          <CardHeader title="Recommendations" />
          <CardContent>
            <ul className="tw-space-y-2">
              {response.recommendations.map((rec, index) => (
                <RecommendationItem key={index} recommendation={rec} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {!isStreaming && response.metadata && (
        <div className="tw-flex tw-items-center tw-gap-4 tw-text-caption tw-text-obsidian-500">
          <span>
            Confidence: {(response.metadata.confidence * 100).toFixed(0)}%
          </span>
          {response.metadata.processingTime && (
            <span>
              Generated in {response.metadata.processingTime}ms
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Key Driver item component
 */
interface KeyDriverItemProps {
  driver: KeyDriver;
}

const KeyDriverItem: FC<KeyDriverItemProps> = ({ driver }) => {
  const impactColors = {
    critical: 'tw-text-status-critical',
    high: 'tw-text-status-high',
    medium: 'tw-text-status-medium',
    low: 'tw-text-aurora-cyan',
  };

  const impactBgColors = {
    critical: 'tw-bg-status-critical/10',
    high: 'tw-bg-status-high/10',
    medium: 'tw-bg-status-medium/10',
    low: 'tw-bg-aurora-cyan/10',
  };

  return (
    <li className="tw-flex tw-items-start tw-gap-2">
      <ChevronRight
        className={cn(
          'tw-w-4 tw-h-4 tw-mt-0.5 tw-flex-shrink-0',
          impactColors[driver.impact]
        )}
      />
      <div className="tw-flex-1">
        <span className="tw-text-body tw-text-obsidian-200">{driver.driver}</span>
        <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
          <span
            className={cn(
              'tw-text-[10px] tw-font-bold tw-uppercase tw-px-1.5 tw-py-0.5 tw-rounded',
              impactBgColors[driver.impact],
              impactColors[driver.impact]
            )}
          >
            {driver.impact}
          </span>
          {driver.metric && (
            <span className="tw-text-caption tw-text-obsidian-400">
              {driver.metric}
            </span>
          )}
          {driver.delta !== undefined && (
            <span
              className={cn(
                'tw-text-caption',
                driver.delta > 0 ? 'tw-text-status-success' : 'tw-text-status-critical'
              )}
            >
              {driver.delta > 0 ? '+' : ''}{driver.delta.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

/**
 * Recommendation item component
 */
interface RecommendationItemProps {
  recommendation: Recommendation;
}

const RecommendationItem: FC<RecommendationItemProps> = ({ recommendation }) => {
  const priorityColors = {
    high: {
      bg: 'tw-bg-status-critical/10',
      text: 'tw-text-status-critical',
      badge: 'tw-bg-status-critical/20',
    },
    medium: {
      bg: 'tw-bg-status-medium/10',
      text: 'tw-text-status-medium',
      badge: 'tw-bg-status-medium/20',
    },
    low: {
      bg: 'tw-bg-aurora-cyan/10',
      text: 'tw-text-aurora-cyan',
      badge: 'tw-bg-aurora-cyan/20',
    },
  };

  const colors = priorityColors[recommendation.priority];

  return (
    <li
      className={cn(
        'tw-flex tw-items-start tw-gap-2 tw-p-2 tw-rounded-fluent',
        colors.bg
      )}
    >
      <span
        className={cn(
          'tw-text-[10px] tw-font-bold tw-uppercase tw-px-1.5 tw-py-0.5 tw-rounded tw-flex-shrink-0',
          colors.badge,
          colors.text
        )}
      >
        {recommendation.priority}
      </span>
      <div className="tw-flex-1">
        <span className="tw-text-body tw-text-obsidian-200">
          {recommendation.action}
        </span>
        {(recommendation.timeEstimate || recommendation.link) && (
          <div className="tw-flex tw-items-center tw-gap-3 tw-mt-1">
            {recommendation.timeEstimate && (
              <span className="tw-text-caption tw-text-obsidian-400">
                Est: {recommendation.timeEstimate}
              </span>
            )}
            {recommendation.link && (
              <a
                href={recommendation.link.href}
                className={cn(
                  'tw-inline-flex tw-items-center tw-gap-1',
                  'tw-text-caption tw-text-aurora-cyan hover:tw-underline'
                )}
              >
                {recommendation.link.label}
                <ExternalLink className="tw-w-3 tw-h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export default StructuredResponse;
