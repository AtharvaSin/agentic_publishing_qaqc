/**
 * TanStack Query hook for submissions data
 */

import { useQuery } from '@tanstack/react-query';
import { Submission } from '@/types/entities';
import { API_ENDPOINTS } from '@/lib/constants';
import { SubmissionStage } from '@/lib/constants';

interface SubmissionsResponse {
  data: Submission[];
  total: number;
}

interface SubmissionResponse {
  data: Submission;
}

interface UseSubmissionsOptions {
  agentId?: string;
  publisherId?: string;
  stage?: SubmissionStage | 'all';
  startDate?: string;
  endDate?: string;
}

async function fetchSubmissions(options: UseSubmissionsOptions = {}): Promise<SubmissionsResponse> {
  const params = new URLSearchParams();

  if (options.agentId) {
    params.set('agentId', options.agentId);
  }
  if (options.publisherId && options.publisherId !== 'all') {
    params.set('publisherId', options.publisherId);
  }
  if (options.stage && options.stage !== 'all') {
    params.set('stage', options.stage);
  }
  if (options.startDate) {
    params.set('startDate', options.startDate);
  }
  if (options.endDate) {
    params.set('endDate', options.endDate);
  }

  const url = `${API_ENDPOINTS.submissions}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }

  return response.json() as Promise<SubmissionsResponse>;
}

async function fetchSubmission(submissionId: string): Promise<SubmissionResponse> {
  const response = await fetch(`${API_ENDPOINTS.submissions}/${submissionId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }

  return response.json() as Promise<SubmissionResponse>;
}

export function useSubmissions(options: UseSubmissionsOptions = {}) {
  return useQuery({
    queryKey: ['submissions', options],
    queryFn: () => fetchSubmissions(options),
  });
}

export function useSubmission(submissionId: string) {
  return useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => fetchSubmission(submissionId),
    enabled: !!submissionId,
  });
}
