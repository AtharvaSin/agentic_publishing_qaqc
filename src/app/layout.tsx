import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { SkipLinks } from '@/components/ui/SkipLinks';
import { PageErrorBoundary } from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Agent Publishing Ops Intelligence Hub',
  description:
    'Power BI-style operational dashboard for agent publishing health, quality gates, and AI-powered insights',
  keywords: ['agent publishing', 'ops dashboard', 'quality gates', 'Microsoft', 'Copilot'],
  authors: [{ name: 'Store Ops Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className="tw-h-full">
      <body className="tw-h-full tw-bg-obsidian-900 tw-text-obsidian-100 tw-font-fluent tw-antialiased">
        <SkipLinks />
        <Providers>
          <PageErrorBoundary>{children}</PageErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
