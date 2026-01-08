/**
 * Synthetic publisher data
 */

import { Publisher } from '@/types/entities';
import { createPublisherId } from '@/types/branded';
import { PublisherTier, Region } from '@/lib/constants';

export const publishers: Publisher[] = [
  {
    id: createPublisherId('PUB001'),
    name: 'Contoso Ltd',
    tier: 'strategic',
    region: 'NOAM',
    supportPlan: 'premium',
    createdAt: '2024-01-15',
    contactEmail: 'partner@contoso.com',
  },
  {
    id: createPublisherId('PUB002'),
    name: 'Fabrikam Inc',
    tier: 'standard',
    region: 'EMEA',
    supportPlan: 'standard',
    createdAt: '2024-03-20',
    contactEmail: 'dev@fabrikam.com',
  },
  {
    id: createPublisherId('PUB003'),
    name: 'Northwind Traders',
    tier: 'standard',
    region: 'NOAM',
    supportPlan: 'standard',
    createdAt: '2024-02-10',
    contactEmail: 'apps@northwind.com',
  },
  {
    id: createPublisherId('PUB004'),
    name: 'Adventure Works',
    tier: 'standard',
    region: 'APAC',
    supportPlan: 'standard',
    createdAt: '2024-05-05',
    contactEmail: 'tech@adventureworks.com',
  },
  {
    id: createPublisherId('PUB005'),
    name: 'Tailspin Toys',
    tier: 'emerging',
    region: 'NOAM',
    supportPlan: 'community',
    createdAt: '2024-07-12',
    contactEmail: 'support@tailspintoys.com',
  },
  {
    id: createPublisherId('PUB006'),
    name: 'Woodgrove Bank',
    tier: 'standard',
    region: 'EMEA',
    supportPlan: 'premium',
    createdAt: '2024-04-18',
    contactEmail: 'fintech@woodgrove.com',
  },
  {
    id: createPublisherId('PUB007'),
    name: 'Proseware Inc',
    tier: 'emerging',
    region: 'LATAM',
    supportPlan: 'community',
    createdAt: '2024-08-22',
    contactEmail: 'hello@proseware.com',
  },
  {
    id: createPublisherId('PUB008'),
    name: 'Litware Inc',
    tier: 'emerging',
    region: 'APAC',
    supportPlan: 'community',
    createdAt: '2024-09-30',
    contactEmail: 'contact@litware.com',
  },
];

// Helper to get publisher by ID
export function getPublisherById(id: string): Publisher | undefined {
  return publishers.find((p) => p.id === id);
}

// Helper to get publishers by tier
export function getPublishersByTier(tier: PublisherTier): Publisher[] {
  return publishers.filter((p) => p.tier === tier);
}

// Helper to get publishers by region
export function getPublishersByRegion(region: Region): Publisher[] {
  return publishers.filter((p) => p.region === region);
}
