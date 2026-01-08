'use client';

import { FC, ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import { MSWProvider } from './MSWProvider';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <MSWProvider>
      <QueryClientProvider client={queryClient}>
        <FluentProvider theme={webDarkTheme} className="tw-h-full">
          {children}
        </FluentProvider>
      </QueryClientProvider>
    </MSWProvider>
  );
};
