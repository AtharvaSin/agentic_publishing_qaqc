/**
 * MSW handlers for publishers API
 */

import { http, HttpResponse, delay } from 'msw';
import { publishers, getPublisherById } from '@/data/publishers';
import { API_ENDPOINTS, PublisherTier, Region } from '@/lib/constants';

export const publisherHandlers = [
  // Get all publishers with optional filters
  http.get(API_ENDPOINTS.publishers, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const tier = url.searchParams.get('tier');
    const region = url.searchParams.get('region');
    const search = url.searchParams.get('search')?.toLowerCase();

    let filteredPublishers = [...publishers];

    if (tier && tier !== 'all') {
      filteredPublishers = filteredPublishers.filter((p) => p.tier === (tier as PublisherTier));
    }

    if (region && region !== 'all') {
      filteredPublishers = filteredPublishers.filter((p) => p.region === (region as Region));
    }

    if (search) {
      filteredPublishers = filteredPublishers.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
      );
    }

    return HttpResponse.json({
      data: filteredPublishers,
      total: filteredPublishers.length,
    });
  }),

  // Get single publisher by ID
  http.get(`${API_ENDPOINTS.publishers}/:publisherId`, async ({ params }) => {
    await delay(200);

    const { publisherId } = params;
    const publisher = getPublisherById(publisherId as string);

    if (!publisher) {
      return HttpResponse.json(
        { error: 'Publisher not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: publisher });
  }),
];
