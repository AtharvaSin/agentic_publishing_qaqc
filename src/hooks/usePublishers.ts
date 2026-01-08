/**
 * TanStack Query hook for publishers data
 */

import { useQuery } from '@tanstack/react-query';
import { Publisher } from '@/types/entities';
import { API_ENDPOINTS } from '@/lib/constants';
import { PublisherTier, Region } from '@/lib/constants';

interface PublishersResponse {
  data: Publisher[];
  total: number;
}

interface PublisherResponse {
  data: Publisher;
}

interface UsePublishersOptions {
  tier?: PublisherTier | 'all';
  region?: Region | 'all';
  search?: string;
}

async function fetchPublishers(options: UsePublishersOptions = {}): Promise<PublishersResponse> {
  const params = new URLSearchParams();

  if (options.tier && options.tier !== 'all') {
    params.set('tier', options.tier);
  }
  if (options.region && options.region !== 'all') {
    params.set('region', options.region);
  }
  if (options.search) {
    params.set('search', options.search);
  }

  const url = `${API_ENDPOINTS.publishers}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch publishers');
  }

  return response.json() as Promise<PublishersResponse>;
}

async function fetchPublisher(publisherId: string): Promise<PublisherResponse> {
  const response = await fetch(`${API_ENDPOINTS.publishers}/${publisherId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch publisher');
  }

  return response.json() as Promise<PublisherResponse>;
}

export function usePublishers(options: UsePublishersOptions = {}) {
  return useQuery({
    queryKey: ['publishers', options],
    queryFn: () => fetchPublishers(options),
  });
}

export function usePublisher(publisherId: string) {
  return useQuery({
    queryKey: ['publisher', publisherId],
    queryFn: () => fetchPublisher(publisherId),
    enabled: !!publisherId,
  });
}
