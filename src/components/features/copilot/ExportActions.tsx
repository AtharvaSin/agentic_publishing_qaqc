'use client';

import { FC, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { AIResponse } from '@/types/copilot';
import { Copy, Download, Check, Mail } from 'lucide-react';

export interface ExportActionsProps {
  response: AIResponse;
  className?: string;
}

/**
 * Export actions for AI response (copy, download, etc.)
 */
export const ExportActions: FC<ExportActionsProps> = ({
  response,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /**
   * Format response as plain text
   */
  const formatAsText = useCallback((): string => {
    const lines: string[] = [];

    // Summary
    lines.push('=== Summary ===');
    lines.push(response.summary);
    lines.push('');

    // Key Drivers
    if (response.keyDrivers.length > 0) {
      lines.push('=== Key Drivers ===');
      response.keyDrivers.forEach((driver, i) => {
        lines.push(`${i + 1}. [${driver.impact.toUpperCase()}] ${driver.driver}`);
      });
      lines.push('');
    }

    // Recommendations
    if (response.recommendations.length > 0) {
      lines.push('=== Recommendations ===');
      response.recommendations.forEach((rec, i) => {
        lines.push(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
        if (rec.timeEstimate) {
          lines.push(`   Estimated time: ${rec.timeEstimate}`);
        }
      });
      lines.push('');
    }

    // Metadata
    lines.push('---');
    lines.push(`Generated: ${new Date(response.metadata.generatedAt).toLocaleString()}`);
    lines.push(`Confidence: ${(response.metadata.confidence * 100).toFixed(0)}%`);

    return lines.join('\n');
  }, [response]);

  /**
   * Format response as markdown
   */
  const formatAsMarkdown = useCallback((): string => {
    const lines: string[] = [];

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(response.summary);
    lines.push('');

    // Key Drivers
    if (response.keyDrivers.length > 0) {
      lines.push('## Key Drivers');
      lines.push('');
      response.keyDrivers.forEach((driver) => {
        const badge = driver.impact === 'critical' ? '🔴' :
                     driver.impact === 'high' ? '🟠' :
                     driver.impact === 'medium' ? '🟡' : '🟢';
        lines.push(`- ${badge} **${driver.impact.toUpperCase()}**: ${driver.driver}`);
      });
      lines.push('');
    }

    // Recommendations
    if (response.recommendations.length > 0) {
      lines.push('## Recommendations');
      lines.push('');
      response.recommendations.forEach((rec, i) => {
        const priority = rec.priority === 'high' ? '🔴' :
                        rec.priority === 'medium' ? '🟡' : '🟢';
        lines.push(`${i + 1}. ${priority} **${rec.priority.toUpperCase()}**: ${rec.action}`);
        if (rec.timeEstimate) {
          lines.push(`   - *Estimated: ${rec.timeEstimate}*`);
        }
      });
      lines.push('');
    }

    // Metadata
    lines.push('---');
    lines.push(`*Generated: ${new Date(response.metadata.generatedAt).toLocaleString()}*`);

    return lines.join('\n');
  }, [response]);

  /**
   * Copy to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      const text = formatAsText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [formatAsText]);

  /**
   * Download as markdown file
   */
  const handleDownload = useCallback(() => {
    setDownloading(true);
    try {
      const markdown = formatAsMarkdown();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-insights-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [formatAsMarkdown]);

  /**
   * Format for email (opens mailto)
   */
  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent('AI Insights Report');
    const body = encodeURIComponent(formatAsText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [formatAsText]);

  return (
    <div
      className={cn(
        'tw-flex tw-items-center tw-justify-end tw-gap-2',
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon={copied ? <Check className="tw-w-4 tw-h-4" /> : <Copy className="tw-w-4 tw-h-4" />}
        onClick={handleCopy}
        className={cn(copied && 'tw-text-status-success')}
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Download className="tw-w-4 tw-h-4" />}
        onClick={handleDownload}
        disabled={downloading}
      >
        Export
      </Button>

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Mail className="tw-w-4 tw-h-4" />}
        onClick={handleEmail}
        className="tw-hidden sm:tw-inline-flex"
      >
        Email
      </Button>
    </div>
  );
};

export default ExportActions;
