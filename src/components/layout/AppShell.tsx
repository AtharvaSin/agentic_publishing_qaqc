'use client';

import { FC, ReactNode, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LeftNav } from './LeftNav';
import { CommandBar, FilterState } from './CommandBar';
import { InsightsPane } from './InsightsPane';

export interface AppShellProps {
  children: ReactNode;
  className?: string;
}

const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/overview': 'Overview',
    '/funnel': 'Publishing Funnel',
    '/quality': 'Quality & Readiness',
    '/agents': 'Agents',
    '/publishers': 'Publishers',
  };

  // Check for exact match first
  if (titles[pathname]) {
    return titles[pathname] ?? 'Dashboard';
  }

  // Check for detail pages
  if (pathname.startsWith('/agents/')) return 'Agent Detail';
  if (pathname.startsWith('/publishers/')) return 'Publisher Detail';

  return 'Dashboard';
};

export const AppShell: FC<AppShellProps> = ({ children, className }) => {
  const pathname = usePathname();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    datePreset: '30d',
    publisher: 'all',
    agentType: 'all',
    status: 'all',
  });

  const handleNavToggle = useCallback((): void => {
    setIsNavCollapsed((prev) => !prev);
  }, []);

  const handleInsightsToggle = useCallback((): void => {
    setIsInsightsOpen((prev) => !prev);
  }, []);

  const handleRefresh = useCallback((): void => {
    // TODO: Implement refresh logic
  }, []);

  const handleExport = useCallback((): void => {
    // TODO: Implement export logic
  }, []);

  const pageTitle = getPageTitle(pathname);

  // Extract agentId and publisherId from pathname for detail pages
  const agentId = pathname.startsWith('/agents/') ? pathname.split('/')[2] : undefined;
  const publisherId = pathname.startsWith('/publishers/') ? pathname.split('/')[2] : undefined;

  return (
    <div className={cn('tw-flex tw-h-screen tw-bg-obsidian-900', className)}>
      {/* Left Navigation */}
      <nav id="main-nav" aria-label="Main navigation">
        <LeftNav isCollapsed={isNavCollapsed} onToggle={handleNavToggle} />
      </nav>

      {/* Main Content Area */}
      <div className="tw-flex tw-flex-col tw-flex-1 tw-min-w-0">
        {/* Command Bar */}
        <CommandBar
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onOpenInsights={handleInsightsToggle}
          isInsightsOpen={isInsightsOpen}
        />

        {/* Page Content */}
        <div className="tw-flex tw-flex-1 tw-overflow-hidden">
          {/* Main Canvas */}
          <main
            id="main-content"
            className="tw-flex-1 tw-overflow-y-auto tw-p-6"
            role="main"
            aria-label={`${pageTitle} content`}
          >
            {/* Page Header */}
            <header className="tw-mb-6">
              <h1 className="tw-text-subtitle tw-font-semibold tw-text-obsidian-100">{pageTitle}</h1>
              <p className="tw-text-caption tw-text-obsidian-400 tw-mt-1">
                {filters.datePreset === '7d' && 'Last 7 days'}
                {filters.datePreset === '30d' && 'Last 30 days'}
                {filters.datePreset === '60d' && 'Last 60 days'}
                {filters.datePreset === '90d' && 'Last 90 days'}
                {filters.publisher !== 'all' && ` • ${filters.publisher} publishers`}
                {filters.agentType !== 'all' && ` • ${filters.agentType.replace('_', ' ')}`}
              </p>
            </header>

            {/* Page Content */}
            {children}
          </main>

          {/* Insights Pane */}
          <InsightsPane
            isOpen={isInsightsOpen}
            onClose={() => setIsInsightsOpen(false)}
            currentPage={pageTitle}
            agentId={agentId}
            publisherId={publisherId}
          />
        </div>
      </div>
    </div>
  );
};
