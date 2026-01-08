/**
 * MSW browser setup for client-side mocking
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Initialize MSW for demo app (works in all environments)
export async function initMocks(): Promise<void> {
  if (typeof window !== 'undefined') {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }
}
