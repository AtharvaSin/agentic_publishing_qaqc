'use client';

import { FC } from 'react';
import { Lightbulb, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Insight } from '@/lib/insights';

export interface KPIInsightCardProps {
  insight: Insight;
  className?: string;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bgClass: 'tw-bg-status-critical/10',
    borderClass: 'tw-border-status-critical/30',
    textClass: 'tw-text-status-critical',
    iconClass: 'tw-text-status-critical',
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'tw-bg-status-medium/10',
    borderClass: 'tw-border-status-medium/30',
    textClass: 'tw-text-status-medium',
    iconClass: 'tw-text-status-medium',
  },
  success: {
    icon: CheckCircle,
    bgClass: 'tw-bg-status-success/10',
    borderClass: 'tw-border-status-success/30',
    textClass: 'tw-text-status-success',
    iconClass: 'tw-text-status-success',
  },
  info: {
    icon: Info,
    bgClass: 'tw-bg-aurora-cyan/10',
    borderClass: 'tw-border-aurora-cyan/30',
    textClass: 'tw-text-aurora-cyan',
    iconClass: 'tw-text-aurora-cyan',
  },
};

export const KPIInsightCard: FC<KPIInsightCardProps> = ({ insight, className }) => {
  const config = severityConfig[insight.severity];

  return (
    <div
      className={cn(
        'tw-rounded-fluent-lg tw-border tw-p-4',
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="tw-flex tw-gap-3">
        <div className={cn('tw-flex-shrink-0 tw-mt-0.5', config.iconClass)}>
          <Lightbulb className="tw-w-5 tw-h-5" />
        </div>
        <div className="tw-flex-1 tw-min-w-0">
          <p className="tw-text-body tw-text-obsidian-100">{insight.text}</p>
          {insight.actionItems && insight.actionItems.length > 0 && (
            <ul className="tw-mt-3 tw-space-y-1">
              {insight.actionItems.map((item, index) => (
                <li
                  key={index}
                  className="tw-flex tw-items-start tw-gap-2 tw-text-caption tw-text-obsidian-300"
                >
                  <span className="tw-text-obsidian-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Simpler inline insight display for compact views
export interface InlineInsightProps {
  text: string;
  severity: Insight['severity'];
  className?: string;
}

export const InlineInsight: FC<InlineInsightProps> = ({ text, severity, className }) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn('tw-flex tw-items-start tw-gap-2', className)}>
      <Icon className={cn('tw-w-4 tw-h-4 tw-flex-shrink-0 tw-mt-0.5', config.iconClass)} />
      <p className="tw-text-caption tw-text-obsidian-300">{text}</p>
    </div>
  );
};
