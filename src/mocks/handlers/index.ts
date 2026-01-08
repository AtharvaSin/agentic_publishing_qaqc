/**
 * MSW handlers aggregation
 */

import { agentHandlers } from './agents';
import { publisherHandlers } from './publishers';
import { submissionHandlers } from './submissions';
import { metricsHandlers } from './metrics';
import { copilotHandlers } from './copilot';

export const handlers = [
  ...agentHandlers,
  ...publisherHandlers,
  ...submissionHandlers,
  ...metricsHandlers,
  ...copilotHandlers,
];
