/**
 * MSW browser setup for client-side mocking
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Initialize MSW in development
export async function initMocks(): Promise<void> {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }
}
