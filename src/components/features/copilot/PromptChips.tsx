'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils';
import { PromptChip } from '@/types/copilot';

export interface PromptChipsProps {
  prompts: PromptChip[];
  selectedId?: string | null;
  onSelect: (prompt: PromptChip) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Context-aware prompt chip suggestions
 */
export const PromptChips: FC<PromptChipsProps> = ({
  prompts,
  selectedId,
  onSelect,
  isLoading = false,
  className,
}) => {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className={cn('tw-flex tw-flex-wrap tw-gap-2', className)}>
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onSelect(prompt)}
          disabled={isLoading}
          aria-pressed={selectedId === prompt.id}
          className={cn(
            'tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5',
            'tw-rounded-full tw-text-caption tw-font-medium',
            'tw-transition-all tw-duration-200',
            'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-obsidian-800',
            selectedId === prompt.id
              ? 'tw-bg-aurora-cyan/20 tw-text-aurora-cyan tw-border tw-border-aurora-cyan/50'
              : 'tw-bg-obsidian-700 tw-text-obsidian-300 hover:tw-bg-obsidian-600 tw-border tw-border-transparent hover:tw-border-obsidian-500',
            isLoading && 'tw-opacity-50 tw-cursor-not-allowed'
          )}
        >
          <span aria-hidden="true">{prompt.icon}</span>
          <span>{prompt.label}</span>
        </button>
      ))}
    </div>
  );
};

export interface FollowUpPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string;
}

/**
 * Follow-up prompt suggestions after a response
 */
export const FollowUpPrompts: FC<FollowUpPromptsProps> = ({
  prompts,
  onSelect,
  className,
}) => {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className={cn('tw-space-y-2', className)}>
      <p className="tw-text-caption tw-text-obsidian-400">Follow-up questions:</p>
      <div className="tw-flex tw-flex-wrap tw-gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelect(prompt)}
            className={cn(
              'tw-text-caption tw-text-aurora-cyan',
              'hover:tw-underline hover:tw-text-aurora-cyan/80',
              'focus:tw-outline-none focus-visible:tw-underline',
              'tw-transition-colors tw-duration-200'
            )}
          >
            {prompt} →
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptChips;
