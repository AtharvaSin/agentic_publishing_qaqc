'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import {
  LayoutDashboard,
  Filter,
  ShieldCheck,
  Bot,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Filter,
  ShieldCheck,
  Bot,
  Building2,
} as const;

export interface LeftNavProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export const LeftNav: FC<LeftNavProps> = ({ isCollapsed, onToggle, className }) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'tw-flex tw-flex-col tw-h-full',
        'tw-bg-obsidian-800 tw-border-r tw-border-obsidian-700',
        'tw-transition-all tw-duration-300 tw-ease-in-out',
        isCollapsed ? 'tw-w-16' : 'tw-w-56',
        className
      )}
    >
      {/* Logo / App Title */}
      <div
        className={cn(
          'tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-5',
          'tw-border-b tw-border-obsidian-700'
        )}
      >
        <div className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-fluent tw-bg-gradient-to-br tw-from-aurora-cyan tw-to-aurora-purple tw-flex-shrink-0">
          <Sparkles className="tw-w-4 tw-h-4 tw-text-white" />
        </div>
        {!isCollapsed && (
          <div className="tw-flex tw-flex-col tw-min-w-0">
            <span className="tw-text-body tw-font-semibold tw-text-obsidian-100 tw-truncate">
              Agent Ops Hub
            </span>
            <span className="tw-text-caption tw-text-obsidian-400 tw-truncate">
              Publishing Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="tw-flex-1 tw-py-4 tw-px-2 tw-space-y-1 tw-overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          const navLink = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2.5 tw-rounded-fluent',
                'tw-text-body tw-font-medium tw-transition-all tw-duration-200',
                'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan',
                isActive
                  ? 'tw-bg-obsidian-700 tw-text-aurora-cyan'
                  : 'tw-text-obsidian-300 hover:tw-bg-obsidian-700/50 hover:tw-text-obsidian-100',
                isCollapsed && 'tw-justify-center tw-px-2'
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'tw-w-5 tw-h-5 tw-flex-shrink-0',
                    isActive ? 'tw-text-aurora-cyan' : 'tw-text-obsidian-400'
                  )}
                />
              )}
              {!isCollapsed && <span className="tw-truncate">{item.label}</span>}
            </Link>
          );

          // Wrap in tooltip when collapsed
          if (isCollapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {navLink}
              </Tooltip>
            );
          }

          return navLink;
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="tw-p-2 tw-border-t tw-border-obsidian-700">
        <button
          onClick={onToggle}
          className={cn(
            'tw-flex tw-items-center tw-justify-center tw-w-full tw-py-2 tw-rounded-fluent',
            'tw-text-obsidian-400 hover:tw-text-obsidian-200 hover:tw-bg-obsidian-700',
            'tw-transition-colors tw-duration-200',
            'focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-aurora-cyan'
          )}
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? (
            <ChevronRight className="tw-w-5 tw-h-5" />
          ) : (
            <>
              <ChevronLeft className="tw-w-5 tw-h-5" />
              <span className="tw-ml-2 tw-text-caption">Collapse</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
