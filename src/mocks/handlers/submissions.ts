/**
 * MSW handlers for submissions API
 */

import { http, HttpResponse, delay } from 'msw';
import { submissions } from '@/data/submissions';
import { API_ENDPOINTS, SubmissionStage } from '@/lib/constants';

export const submissionHandlers = [
  // Get all submissions with filters
  http.get(API_ENDPOINTS.submissions, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const publisherId = url.searchParams.get('publisherId');
    const stage = url.searchParams.get('stage');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let filteredSubmissions = [...submissions];

    if (agentId) {
      filteredSubmissions = filteredSubmissions.filter((s) => s.agentId === agentId);
    }

    if (publisherId && publisherId !== 'all') {
      filteredSubmissions = filteredSubmissions.filter((s) => s.publisherId === publisherId);
    }

    if (stage && stage !== 'all') {
      filteredSubmissions = filteredSubmissions.filter((s) => s.stage === (stage as SubmissionStage));
    }

    if (startDate && endDate) {
      filteredSubmissions = filteredSubmissions.filter(
        (s) => s.createdAt >= startDate && s.createdAt <= endDate
      );
    }

    // Sort by date descending
    filteredSubmissions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return HttpResponse.json({
      data: filteredSubmissions,
      total: filteredSubmissions.length,
    });
  }),

  // Get single submission by ID
  http.get(`${API_ENDPOINTS.submissions}/:submissionId`, async ({ params }) => {
    await delay(200);

    const { submissionId } = params;
    const submission = submissions.find((s) => s.id === submissionId);

    if (!submission) {
      return HttpResponse.json(
        { error: 'Submission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: submission });
  }),
];
