/**
 * Custom hook for AI Copilot interactions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AIResponse,
  DataContext,
  CopilotPage,
  PromptChip,
} from '@/types/copilot';
import { ComputedMetrics, DailySnapshot, Agent, Publisher, Submission } from '@/types/entities';
import { ruleEngine, getTopPrompts, pathToCopilotPage, getPageDisplayName } from '@/lib/copilot';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Props for useCopilot hook
 */
export interface UseCopilotOptions {
  /** Current page path (e.g., '/overview', '/agents/AGT-123') */
  currentPath: string;
  /** Computed metrics for the current view */
  metrics?: ComputedMetrics | undefined;
  /** Daily snapshot trends */
  trends?: DailySnapshot[] | undefined;
  /** Currently selected entity (for detail pages) */
  selectedAgent?: Agent | undefined;
  selectedPublisher?: Publisher | undefined;
  selectedSubmissions?: Submission[] | undefined;
  /** Filter parameters */
  filters?: DataContext['filters'] | undefined;
  /** Enable streaming effect */
  enableStreaming?: boolean | undefined;
}

/**
 * Return type for useCopilot hook
 */
export interface UseCopilotReturn {
  // State
  response: AIResponse | null;
  isLoading: boolean;
  error: string | null;
  currentPrompt: string | null;

  // Context
  currentPage: CopilotPage;
  pageDisplayName: string;
  relevantPrompts: PromptChip[];

  // Actions
  processPrompt: (prompt: string) => Promise<void>;
  reset: () => void;

  // Streaming
  isStreaming: boolean;
  streamedContent: string;
}

/**
 * Hook for managing AI Copilot interactions
 */
export function useCopilot(options: UseCopilotOptions): UseCopilotReturn {
  const {
    currentPath,
    metrics,
    trends,
    selectedAgent,
    selectedPublisher,
    selectedSubmissions,
    filters = { datePreset: '30d' },
    enableStreaming = true,
  } = options;

  // State
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');

  // Refs for streaming
  const streamingRef = useRef<NodeJS.Timeout | null>(null);

  // Derive page info
  const currentPage = pathToCopilotPage(currentPath);
  const pageDisplayName = getPageDisplayName(currentPage);

  // Build data context
  const buildContext = useCallback((): DataContext => {
    const context: DataContext = {
      currentPage,
      filters,
      computedMetrics: metrics,
      dailyTrends: trends,
    };

    // Add selected entity if available
    if (selectedAgent) {
      context.selectedEntity = {
        type: 'agent',
        data: selectedAgent,
        submissions: selectedSubmissions,
      };
    } else if (selectedPublisher) {
      context.selectedEntity = {
        type: 'publisher',
        data: selectedPublisher,
      };
    }

    return context;
  }, [currentPage, filters, metrics, trends, selectedAgent, selectedPublisher, selectedSubmissions]);

  // Get relevant prompts
  const relevantPrompts = getTopPrompts(buildContext(), 5);

  /**
   * Simulate streaming effect for the response
   */
  const simulateStreaming = useCallback((text: string, onComplete: () => void) => {
    if (!enableStreaming) {
      setStreamedContent(text);
      onComplete();
      return;
    }

    setIsStreaming(true);
    setStreamedContent('');

    let index = 0;
    const chunkSize = 3; // Characters per tick
    const interval = 20; // ms between ticks

    streamingRef.current = setInterval(() => {
      if (index < text.length) {
        const nextIndex = Math.min(index + chunkSize, text.length);
        setStreamedContent(text.slice(0, nextIndex));
        index = nextIndex;
      } else {
        if (streamingRef.current) {
          clearInterval(streamingRef.current);
          streamingRef.current = null;
        }
        setIsStreaming(false);
        onComplete();
      }
    }, interval);
  }, [enableStreaming]);

  /**
   * Process a prompt and generate response
   */
  const processPrompt = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentPrompt(prompt);
    setResponse(null);
    setStreamedContent('');

    try {
      // Build context
      const context = buildContext();

      // Simulate API delay for demo feel
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Process with rule engine
      const aiResponse = ruleEngine.process(prompt, context);

      // Simulate streaming for summary
      simulateStreaming(aiResponse.summary, () => {
        setResponse(aiResponse);
        setIsLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process prompt');
      setIsLoading(false);
    }
  }, [buildContext, simulateStreaming]);

  /**
   * Reset the copilot state
   */
  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setCurrentPrompt(null);
    setIsStreaming(false);
    setStreamedContent('');
    if (streamingRef.current) {
      clearInterval(streamingRef.current);
      streamingRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingRef.current) {
        clearInterval(streamingRef.current);
      }
    };
  }, []);

  return {
    response,
    isLoading,
    error,
    currentPrompt,
    currentPage,
    pageDisplayName,
    relevantPrompts,
    processPrompt,
    reset,
    isStreaming,
    streamedContent,
  };
}

/**
 * Hook for fetching copilot response via API (alternative to local processing)
 */
export function useCopilotQuery(prompt: string | null, context: DataContext) {
  return useQuery({
    queryKey: ['copilot', prompt, context.currentPage, context.filters],
    queryFn: async () => {
      if (!prompt) return null;

      const response = await fetch(API_ENDPOINTS.copilot, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch copilot response');
      }

      const data = await response.json();
      return data.data as AIResponse;
    },
    enabled: !!prompt,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook for copilot mutation (for real API calls)
 */
export function useCopilotMutation() {
  return useMutation({
    mutationFn: async ({
      prompt,
      context,
    }: {
      prompt: string;
      context: DataContext;
    }) => {
      const response = await fetch(API_ENDPOINTS.copilot, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch copilot response');
      }

      const data = await response.json();
      return data.data as AIResponse;
    },
  });
}

export default useCopilot;
