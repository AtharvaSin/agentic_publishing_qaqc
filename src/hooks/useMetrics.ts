/**
 * TanStack Query hook for metrics data
 */

import { useQuery } from '@tanstack/react-query';
import { ComputedMetrics, DailySnapshot, Incident } from '@/types/entities';
import { API_ENDPOINTS } from '@/lib/constants';

interface MetricsResponse {
  data: ComputedMetrics;
}

interface SnapshotsResponse {
  data: DailySnapshot[];
  total: number;
}

interface IncidentsResponse {
  data: Incident[];
  total: number;
}

interface UseMetricsOptions {
  days?: number;
}

interface UseSnapshotsOptions {
  startDate?: string;
  endDate?: string;
}

interface UseIncidentsOptions {
  agentId?: string;
  status?: 'open' | 'investigating' | 'resolved' | 'closed' | 'all';
}

async function fetchMetrics(options: UseMetricsOptions = {}): Promise<MetricsResponse> {
  const params = new URLSearchParams();

  if (options.days) {
    params.set('days', options.days.toString());
  }

  const url = `${API_ENDPOINTS.metrics}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }

  return response.json() as Promise<MetricsResponse>;
}

async function fetchSnapshots(options: UseSnapshotsOptions = {}): Promise<SnapshotsResponse> {
  const params = new URLSearchParams();

  if (options.startDate) {
    params.set('startDate', options.startDate);
  }
  if (options.endDate) {
    params.set('endDate', options.endDate);
  }

  const url = `${API_ENDPOINTS.snapshots}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch snapshots');
  }

  return response.json() as Promise<SnapshotsResponse>;
}

async function fetchIncidents(options: UseIncidentsOptions = {}): Promise<IncidentsResponse> {
  const params = new URLSearchParams();

  if (options.agentId) {
    params.set('agentId', options.agentId);
  }
  if (options.status && options.status !== 'all') {
    params.set('status', options.status);
  }

  const url = `${API_ENDPOINTS.incidents}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }

  return response.json() as Promise<IncidentsResponse>;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  return useQuery({
    queryKey: ['metrics', options],
    queryFn: () => fetchMetrics(options),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSnapshots(options: UseSnapshotsOptions = {}) {
  return useQuery({
    queryKey: ['snapshots', options],
    queryFn: () => fetchSnapshots(options),
  });
}

export function useIncidents(options: UseIncidentsOptions = {}) {
  return useQuery({
    queryKey: ['incidents', options],
    queryFn: () => fetchIncidents(options),
  });
}
