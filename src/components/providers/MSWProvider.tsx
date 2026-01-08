'use client';

import { FC, ReactNode, useEffect, useState } from 'react';

interface MSWProviderProps {
  children: ReactNode;
}

/**
 * MSW Provider for initializing Mock Service Worker in development
 * Ensures MSW is started before rendering children that make API calls
 */
export const MSWProvider: FC<MSWProviderProps> = ({ children }) => {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW(): Promise<void> {
      // Enable MSW in all environments for demo app (no real backend)
      if (typeof window !== 'undefined') {
        const { initMocks } = await import('@/mocks/browser');
        await initMocks();
      }
      setMswReady(true);
    }

    initMSW();
  }, []);

  // Wait for MSW to be ready before rendering
  if (!mswReady) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-h-screen tw-bg-obsidian-900">
        <div className="tw-text-obsidian-300 tw-text-sm">Initializing mock services...</div>
      </div>
    );
  }

  return <>{children}</>;
};
