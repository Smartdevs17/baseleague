import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fixturesState, 
  fixturesLoadingState, 
  fixturesErrorState,
  fixturesFilterState,
  filteredFixturesSelector,
  upcomingFixturesSelector,
  liveFixturesSelector,
  finishedFixturesSelector,
  fixturesByGameweekSelector,
  fixturesStatsSelector,
  ApiFixture 
} from '@/store/fixtures';
import { fixturesService, SyncFixturesResponse, UpdateFixtureResultRequest } from '@/services/fixtures';
import { toast } from '@/hooks/use-toast';

// Query keys
export const FIXTURES_QUERY_KEYS = {
  all: ['fixtures'] as const,
  lists: () => [...FIXTURES_QUERY_KEYS.all, 'list'] as const,
  list: (filters: any) => [...FIXTURES_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...FIXTURES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FIXTURES_QUERY_KEYS.details(), id] as const,
  stats: (id: string) => [...FIXTURES_QUERY_KEYS.detail(id), 'stats'] as const,
  upcoming: () => [...FIXTURES_QUERY_KEYS.all, 'upcoming'] as const,
  live: () => [...FIXTURES_QUERY_KEYS.all, 'live'] as const,
  finished: () => [...FIXTURES_QUERY_KEYS.all, 'finished'] as const,
  byGameweek: (gameweek: number) => [...FIXTURES_QUERY_KEYS.all, 'gameweek', gameweek] as const,
  search: (query: string) => [...FIXTURES_QUERY_KEYS.all, 'search', query] as const,
};

// Main fixtures hook
export const useFixtures = () => {
  const [fixtures, setFixtures] = useRecoilState(fixturesState);
  const [loading, setLoading] = useRecoilState(fixturesLoadingState);
  const [error, setError] = useRecoilState(fixturesErrorState);
  const queryClient = useQueryClient();

  const {
    data: fixturesData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.lists(),
    queryFn: () => fixturesService.getFixtures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Update Recoil state when query data changes
  React.useEffect(() => {
    if (fixturesData) {
      setFixtures(fixturesData);
      setLoading(false);
      setError(null);
    }
  }, [fixturesData, setFixtures, setLoading, setError]);

  React.useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  React.useEffect(() => {
    if (queryError) {
      setError((queryError as Error).message);
      setLoading(false);
    }
  }, [queryError, setError, setLoading]);

  return {
    fixtures,
    loading,
    error,
    refetch,
  };
};

// Filtered fixtures hook
export const useFilteredFixtures = () => {
  const filteredFixtures = useRecoilValue(filteredFixturesSelector);
  const [filters, setFilters] = useRecoilState(fixturesFilterState);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  return {
    fixtures: filteredFixtures,
    filters,
    updateFilters,
    clearFilters,
  };
};

// Specific fixture selectors
export const useUpcomingFixtures = () => {
  return useRecoilValue(upcomingFixturesSelector);
};

export const useLiveFixtures = () => {
  return useRecoilValue(liveFixturesSelector);
};

export const useFinishedFixtures = () => {
  return useRecoilValue(finishedFixturesSelector);
};

export const useFixturesByGameweek = () => {
  return useRecoilValue(fixturesByGameweekSelector);
};

export const useFixturesStats = () => {
  return useRecoilValue(fixturesStatsSelector);
};

// Individual fixture hook
export const useFixture = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: fixture,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.detail(id),
    queryFn: () => fixturesService.getFixtureById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    fixture,
    loading: isLoading,
    error,
    refetch,
  };
};

// Fixture stats hook
export const useFixtureStats = (fixtureId: string) => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.stats(fixtureId),
    queryFn: () => fixturesService.getFixtureStats(fixtureId),
    enabled: !!fixtureId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    stats,
    loading: isLoading,
    error,
    refetch,
  };
};

// Upcoming fixtures hook with query
export const useUpcomingFixturesQuery = () => {
  const {
    data: fixtures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.upcoming(),
    queryFn: () => fixturesService.getUpcomingFixtures(),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    fixtures: (fixtures || []) as ApiFixture[],
    loading: isLoading,
    error,
    refetch,
  };
};

// Live fixtures hook with query
export const useLiveFixturesQuery = () => {
  const {
    data: fixtures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.live(),
    queryFn: () => fixturesService.getLiveFixtures(),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  return {
    fixtures: fixtures || [],
    loading: isLoading,
    error,
    refetch,
  };
};

// Finished fixtures hook with query
export const useFinishedFixturesQuery = () => {
  const {
    data: fixtures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.finished(),
    queryFn: () => fixturesService.getFinishedFixtures(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    fixtures: fixtures || [],
    loading: isLoading,
    error,
    refetch,
  };
};

// Fixtures by gameweek hook
export const useFixturesByGameweekQuery = (gameweek: number) => {
  const {
    data: fixtures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.byGameweek(gameweek),
    queryFn: () => fixturesService.getFixturesByGameweek(gameweek),
    enabled: !!gameweek,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    fixtures: fixtures || [],
    loading: isLoading,
    error,
    refetch,
  };
};

// Search fixtures hook
export const useSearchFixtures = (query: string) => {
  const {
    data: fixtures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FIXTURES_QUERY_KEYS.search(query),
    queryFn: () => fixturesService.searchFixtures(query),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    fixtures: fixtures || [],
    loading: isLoading,
    error,
    refetch,
  };
};

// Sync fixtures mutation
export const useSyncFixtures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fixturesService.syncFixtures(),
    onSuccess: (data: SyncFixturesResponse) => {
      toast.success('Fixtures Synced', {
        description: data.message,
      });
      
      // Invalidate and refetch fixtures
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.upcoming() });
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.live() });
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.finished() });
    },
    onError: (error: any) => {
      toast.error('Sync Failed', {
        description: error.message || 'Failed to sync fixtures',
      });
    },
  });
};

// Update fixture result mutation
export const useUpdateFixtureResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fixtureId, data }: { fixtureId: string; data: UpdateFixtureResultRequest }) =>
      fixturesService.updateFixtureResult(fixtureId, data),
    onSuccess: (data, variables) => {
      toast.success('Fixture Updated', {
        description: data.message,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.detail(variables.fixtureId) });
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.live() });
      queryClient.invalidateQueries({ queryKey: FIXTURES_QUERY_KEYS.finished() });
    },
    onError: (error: any) => {
      toast.error('Update Failed', {
        description: error.message || 'Failed to update fixture result',
      });
    },
  });
};
