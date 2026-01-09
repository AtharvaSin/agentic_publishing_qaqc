'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

// Date range preset types
export type DateRangePreset = '7d' | '30d' | '60d' | 'custom';

// Filter state interface
export interface FilterState {
  // Date filtering
  dateRangePreset: DateRangePreset;
  startDate: Date;
  endDate: Date;

  // Entity filtering (all optional in state)
  publisherId: string | undefined;
  agentType: string | undefined;
  channel: string | undefined;

  // Status filtering
  status: string | undefined;
  riskType: string | undefined;

  // Search
  searchQuery: string | undefined;
}

// Filter context value interface
export interface FilterContextValue {
  filters: FilterState;

  // Date range helpers
  setDateRange: (preset: DateRangePreset, customStart?: Date, customEnd?: Date) => void;
  getDateRangeParams: () => { startDate: string; endDate: string };

  // Entity filter setters
  setPublisher: (publisherId: string | undefined) => void;
  setAgentType: (agentType: string | undefined) => void;
  setChannel: (channel: string | undefined) => void;

  // Status filter setters
  setStatus: (status: string | undefined) => void;
  setRiskType: (riskType: string | undefined) => void;

  // Search
  setSearchQuery: (query: string | undefined) => void;

  // Bulk operations
  clearFilters: () => void;
  applyFilters: (newFilters: Partial<FilterState>) => void;
}

// Default filter state
const getDefaultFilters = (): FilterState => {
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, 30));

  return {
    dateRangePreset: '30d',
    startDate,
    endDate,
    publisherId: undefined,
    agentType: undefined,
    channel: undefined,
    status: undefined,
    riskType: undefined,
    searchQuery: undefined,
  };
};

// Create context with undefined default
const FilterContext = createContext<FilterContextValue | undefined>(undefined);

// Filter provider props
interface FilterProviderProps {
  children: ReactNode;
  initialFilters?: Partial<FilterState>;
}

// Filter provider component
export const FilterProvider: FC<FilterProviderProps> = ({ children, initialFilters }) => {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...getDefaultFilters(),
    ...initialFilters,
  }));

  // Set date range with preset or custom dates
  const setDateRange = useCallback(
    (preset: DateRangePreset, customStart?: Date, customEnd?: Date) => {
      setFilters((prev) => {
        const endDate = endOfDay(new Date());
        let startDate: Date;

        switch (preset) {
          case '7d':
            startDate = startOfDay(subDays(endDate, 7));
            break;
          case '30d':
            startDate = startOfDay(subDays(endDate, 30));
            break;
          case '60d':
            startDate = startOfDay(subDays(endDate, 60));
            break;
          case 'custom':
            if (customStart && customEnd) {
              return {
                ...prev,
                dateRangePreset: preset,
                startDate: startOfDay(customStart),
                endDate: endOfDay(customEnd),
              };
            }
            return prev;
          default:
            startDate = startOfDay(subDays(endDate, 30));
        }

        return {
          ...prev,
          dateRangePreset: preset,
          startDate,
          endDate,
        };
      });
    },
    []
  );

  // Get date range as API-friendly params
  const getDateRangeParams = useCallback((): { startDate: string; endDate: string } => {
    return {
      startDate: format(filters.startDate, 'yyyy-MM-dd'),
      endDate: format(filters.endDate, 'yyyy-MM-dd'),
    };
  }, [filters.startDate, filters.endDate]);

  // Individual filter setters
  const setPublisher = useCallback((publisherId: string | undefined) => {
    setFilters((prev) => ({ ...prev, publisherId }));
  }, []);

  const setAgentType = useCallback((agentType: string | undefined) => {
    setFilters((prev) => ({ ...prev, agentType }));
  }, []);

  const setChannel = useCallback((channel: string | undefined) => {
    setFilters((prev) => ({ ...prev, channel }));
  }, []);

  const setStatus = useCallback((status: string | undefined) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setRiskType = useCallback((riskType: string | undefined) => {
    setFilters((prev) => ({ ...prev, riskType }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string | undefined) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  // Clear all filters to defaults
  const clearFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  // Apply multiple filters at once
  const applyFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Memoized context value
  const contextValue = useMemo<FilterContextValue>(
    () => ({
      filters,
      setDateRange,
      getDateRangeParams,
      setPublisher,
      setAgentType,
      setChannel,
      setStatus,
      setRiskType,
      setSearchQuery,
      clearFilters,
      applyFilters,
    }),
    [
      filters,
      setDateRange,
      getDateRangeParams,
      setPublisher,
      setAgentType,
      setChannel,
      setStatus,
      setRiskType,
      setSearchQuery,
      clearFilters,
      applyFilters,
    ]
  );

  return <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>;
};

// Hook to use filter context
export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

// Hook for date range only (useful for chart components)
export function useDateRange(): {
  startDate: string;
  endDate: string;
  preset: DateRangePreset;
  setPreset: (preset: DateRangePreset) => void;
} {
  const { filters, setDateRange, getDateRangeParams } = useFilters();
  const params = getDateRangeParams();

  return {
    startDate: params.startDate,
    endDate: params.endDate,
    preset: filters.dateRangePreset,
    setPreset: (preset: DateRangePreset) => setDateRange(preset),
  };
}

// Export context for testing
export { FilterContext };
