/**
 * Synthetic incident data
 */

import { Incident } from '@/types/entities';
import { createIncidentId } from '@/types/branded';
import { IncidentSeverity } from '@/lib/constants';
import { random, toDateString, subtractDays, addDays } from './generator';
import { agents } from './agents';

// Incident titles by cause
const INCIDENT_TITLES: Record<string, string[]> = {
  latency: [
    'High latency detected in response times',
    'P99 response time threshold exceeded',
    'Degraded performance during peak hours',
  ],
  availability: [
    'Service availability dropped below threshold',
    'Intermittent failures reported',
    'API endpoint unreachable',
  ],
  error_rate: [
    'Elevated error rate detected',
    'Spike in 5xx errors',
    'Increased failure rate in core functionality',
  ],
  security: [
    'Security vulnerability identified',
    'Unauthorized access attempt detected',
    'Data exposure risk identified',
  ],
  rai: [
    'RAI violation in production',
    'Harmful content generation detected',
    'Bias in agent responses reported',
  ],
};

const CAUSE_CATEGORIES = ['latency', 'availability', 'error_rate', 'security', 'rai'];

// Generate incidents
function generateIncidents(): Incident[] {
  const incidents: Incident[] = [];
  const today = new Date();

  // Generate 25 incidents over 60 days
  for (let i = 0; i < 25; i++) {
    const agent = random.pick(agents.filter((a) => a.currentStatus === 'active' || a.currentStatus === 'suspended'));
    const cause = random.pick(CAUSE_CATEGORIES);
    const titles = INCIDENT_TITLES[cause];
    const title = titles ? random.pick(titles) : 'Unknown incident';
    const severity = random.weighted(
      ['sev3', 'sev2', 'sev1', 'sev0'] as const,
      [40, 35, 20, 5]
    );

    const openedAt = random.date(subtractDays(today, 60), subtractDays(today, 1));
    const isResolved = random.boolean(0.75);
    const resolvedAt = isResolved
      ? addDays(openedAt, random.int(1, 7))
      : undefined;

    incidents.push({
      id: createIncidentId(`INC${String(i + 1).padStart(4, '0')}`),
      agentId: agent.id,
      severity,
      title,
      description: `${title}. Affecting agent ${agent.name}.`,
      causeCategory: cause,
      openedAt: toDateString(openedAt),
      resolvedAt: resolvedAt ? toDateString(resolvedAt) : undefined,
      status: isResolved ? 'closed' : random.pick(['open', 'investigating'] as const),
    });
  }

  return incidents;
}

export const incidents = generateIncidents();

// Helper to get incidents by agent
export function getIncidentsByAgent(agentId: string): Incident[] {
  return incidents.filter((i) => i.agentId === agentId);
}

// Helper to get open incidents
export function getOpenIncidents(): Incident[] {
  return incidents.filter((i) => i.status === 'open' || i.status === 'investigating');
}

// Helper to get incidents by severity
export function getIncidentsBySeverity(severity: IncidentSeverity): Incident[] {
  return incidents.filter((i) => i.severity === severity);
}
