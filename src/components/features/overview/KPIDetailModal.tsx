'use client';

import { FC, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Activity,
} from 'lucide-react';
import { Dialog, DialogSection, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { cn, formatPercent } from '@/lib/utils';
import {
  generateInsight,
  determineTrend,
  calculateTrendPercent,
  type KPIType,
  type InsightContext,
} from '@/lib/insights';
import { SparklineChart, type SparklineDataPoint } from './SparklineChart';
import { KPIInsightCard } from './KPIInsightCard';
import { chartColors } from '@/lib/chartTheme';

// KPI configuration for each type
export interface KPIConfig {
  id: string;
  type: KPIType;
  title: string;
  icon: typeof Clock;
  unit: string;
  target?: number;
  actionLink: {
    label: string;
    href: string;
  };
}

export const kpiConfigs: Record<string, KPIConfig> = {
  'time-to-publish': {
    id: 'time-to-publish',
    type: 'time_to_publish',
    title: 'Time to Publish',
    icon: Clock,
    unit: 'days',
    target: 5,
    actionLink: { label: 'View Publishing Funnel', href: '/funnel' },
  },
  'approval-rate': {
    id: 'approval-rate',
    type: 'approval_rate',
    title: 'First-Pass Approval',
    icon: CheckCircle,
    unit: '%',
    target: 80,
    actionLink: { label: 'View Quality Metrics', href: '/quality' },
  },
  'sla-compliance': {
    id: 'sla-compliance',
    type: 'sla_compliance',
    title: 'SLA Compliance',
    icon: AlertTriangle,
    unit: '%',
    target: 95,
    actionLink: { label: 'View SLA Breaches', href: '/agents?filter=sla-breach' },
  },
  'rai-pass': {
    id: 'rai-pass',
    type: 'rai_pass_rate',
    title: 'RAI Pass Rate',
    icon: Shield,
    unit: '%',
    target: 95,
    actionLink: { label: 'View RAI Failures', href: '/quality?category=rai_violation' },
  },
  incidents: {
    id: 'incidents',
    type: 'active_incidents',
    title: 'Active Incidents',
    icon: Activity,
    unit: '',
    target: 0,
    actionLink: { label: 'View All Incidents', href: '/agents?filter=incident' },
  },
};

// Extended KPI data with drilldown details
export interface KPIDetailData {
  id: string;
  value: number;
  previousValue: number;
  sparklineData: SparklineDataPoint[];
  breakdown?: BreakdownItem[];
  additionalMetrics?: AdditionalMetric[];
  contextData?: Record<string, unknown>;
}

interface BreakdownItem {
  label: string;
  value: number | string;
  subLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  highlight?: boolean;
}

interface AdditionalMetric {
  label: string;
  value: string | number;
  subValue?: string;
}

export interface KPIDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiId: string;
  data: KPIDetailData;
}

export const KPIDetailModal: FC<KPIDetailModalProps> = ({
  open,
  onOpenChange,
  kpiId,
  data,
}) => {
  const router = useRouter();
  const config = kpiConfigs[kpiId];

  // Calculate trend and insight - all hooks must be called before any conditional returns
  const trend = useMemo(
    () => determineTrend(data.value, data.previousValue),
    [data.value, data.previousValue]
  );

  const trendPercent = useMemo(
    () => calculateTrendPercent(data.value, data.previousValue),
    [data.value, data.previousValue]
  );

  const insightContext: InsightContext = useMemo(
    () => ({
      metricType: config?.type ?? 'time_to_publish',
      currentValue: data.value,
      previousValue: data.previousValue,
      trend,
      trendPercent,
      ...(data.contextData ? { additionalData: data.contextData } : {}),
    }),
    [config?.type, data.value, data.previousValue, trend, trendPercent, data.contextData]
  );

  const insight = useMemo(() => generateInsight(insightContext), [insightContext]);

  // Determine if trend is good or bad based on KPI type - must be called before early return
  const isTrendPositive = useMemo((): boolean | null => {
    if (!config) return null;
    if (trend === 'stable') return null;
    // For incidents, down is good. For time-to-publish, down is good. For others, up is good.
    if (config.type === 'active_incidents' || config.type === 'time_to_publish') {
      return trend === 'down';
    }
    return trend === 'up';
  }, [trend, config]);

  const handleActionClick = useCallback((): void => {
    if (!config) return;
    onOpenChange(false);
    router.push(config.actionLink.href);
  }, [config, onOpenChange, router]);

  // Early return after all hooks
  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={config.title}
      size="lg"
    >
      {/* Primary Metric */}
      <DialogSection>
        <div className="tw-flex tw-items-start tw-justify-between tw-gap-6">
          <div className="tw-flex tw-items-center tw-gap-4">
            <div className="tw-p-3 tw-rounded-fluent-lg tw-bg-obsidian-700">
              <Icon className="tw-w-6 tw-h-6 tw-text-aurora-cyan" />
            </div>
            <div>
              <div className="tw-flex tw-items-baseline tw-gap-2">
                <span className="tw-text-display tw-font-bold tw-text-obsidian-100">
                  {typeof data.value === 'number' && config.unit === '%'
                    ? formatPercent(data.value, 0)
                    : data.value}
                </span>
                {config.unit && config.unit !== '%' && (
                  <span className="tw-text-subtitle tw-text-obsidian-400">{config.unit}</span>
                )}
              </div>
              {config.target !== undefined && (
                <div className="tw-text-caption tw-text-obsidian-400 tw-mt-1">
                  Target: {config.target}
                  {config.unit}
                </div>
              )}
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="tw-text-right">
            <div
              className={cn(
                'tw-flex tw-items-center tw-gap-1 tw-text-body tw-font-medium',
                isTrendPositive === true && 'tw-text-status-success',
                isTrendPositive === false && 'tw-text-status-critical',
                isTrendPositive === null && 'tw-text-obsidian-400'
              )}
            >
              <TrendIcon className="tw-w-4 tw-h-4" />
              <span>{formatPercent(trendPercent, 1)} vs last period</span>
            </div>
            <div className="tw-text-caption tw-text-obsidian-500 tw-mt-1">
              Previous: {data.previousValue}
              {config.unit}
            </div>
          </div>
        </div>
      </DialogSection>

      {/* 7-Day Trend Sparkline */}
      {data.sparklineData.length > 0 && (
        <DialogSection title="7-Day Trend">
          <div className="tw-bg-obsidian-700/50 tw-rounded-fluent-lg tw-p-4">
            <SparklineChart
              data={data.sparklineData}
              height={60}
              color={isTrendPositive === false ? chartColors.error : chartColors.series[0]}
            />
          </div>
        </DialogSection>
      )}

      {/* Breakdown */}
      {data.breakdown && data.breakdown.length > 0 && (
        <DialogSection title="Breakdown">
          <div className="tw-space-y-2">
            {data.breakdown.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'tw-flex tw-items-center tw-justify-between tw-py-2 tw-px-3',
                  'tw-rounded-fluent tw-transition-colors',
                  item.highlight && 'tw-bg-status-medium/10 tw-border tw-border-status-medium/30'
                )}
              >
                <div className="tw-flex-1">
                  <span className="tw-text-body tw-text-obsidian-200">{item.label}</span>
                  {item.subLabel && (
                    <span className="tw-text-caption tw-text-obsidian-500 tw-ml-2">
                      {item.subLabel}
                    </span>
                  )}
                </div>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <span className="tw-text-body tw-font-medium tw-text-obsidian-100">
                    {item.value}
                  </span>
                  {item.trend && (
                    <span
                      className={cn(
                        'tw-w-4 tw-h-4',
                        item.trend === 'up' && 'tw-text-status-success',
                        item.trend === 'down' && 'tw-text-status-critical',
                        item.trend === 'stable' && 'tw-text-obsidian-400'
                      )}
                    >
                      {item.trend === 'up' ? (
                        <TrendingUp className="tw-w-4 tw-h-4" />
                      ) : item.trend === 'down' ? (
                        <TrendingDown className="tw-w-4 tw-h-4" />
                      ) : (
                        <Minus className="tw-w-4 tw-h-4" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogSection>
      )}

      {/* Additional Metrics */}
      {data.additionalMetrics && data.additionalMetrics.length > 0 && (
        <DialogSection title="Key Metrics">
          <div className="tw-grid tw-grid-cols-3 tw-gap-4">
            {data.additionalMetrics.map((metric, index) => (
              <div
                key={index}
                className="tw-bg-obsidian-700/50 tw-rounded-fluent-lg tw-p-3 tw-text-center"
              >
                <div className="tw-text-subtitle tw-font-bold tw-text-obsidian-100">
                  {metric.value}
                </div>
                <div className="tw-text-caption tw-text-obsidian-400 tw-mt-1">{metric.label}</div>
                {metric.subValue && (
                  <div className="tw-text-caption tw-text-obsidian-500">{metric.subValue}</div>
                )}
              </div>
            ))}
          </div>
        </DialogSection>
      )}

      {/* AI Insight */}
      <DialogSection title="AI Insight">
        <KPIInsightCard insight={insight} />
      </DialogSection>

      {/* Action Footer */}
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button
          variant="primary"
          rightIcon={<ArrowRight className="tw-w-4 tw-h-4" />}
          onClick={handleActionClick}
        >
          {config.actionLink.label}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
