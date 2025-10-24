import { atom, selector } from 'recoil';

// Fixture types based on your API response
export interface ApiFixture {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffTime: string;
  status: 'pending' | 'live' | 'finished' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  gameweek: number;
  pools: {
    win: { total: number; betCount: number };
    draw: { total: number; betCount: number };
    lose: { total: number; betCount: number };
  };
  winningOutcome?: 'win' | 'draw' | 'lose' | null;
  isPayoutProcessed: boolean;
  totalPoolSize: number;
  createdAt: string;
  updatedAt: string;
}

// API Response type
export interface FixturesResponse {
  success: boolean;
  fixtures: ApiFixture[];
}

// Fixtures state
export const fixturesState = atom<ApiFixture[]>({
  key: 'fixturesState',
  default: [],
});

// Loading state
export const fixturesLoadingState = atom<boolean>({
  key: 'fixturesLoadingState',
  default: false,
});

// Error state
export const fixturesErrorState = atom<string | null>({
  key: 'fixturesErrorState',
  default: null,
});

// Filter states
export const fixturesFilterState = atom<{
  status?: 'pending' | 'live' | 'finished' | 'cancelled';
  gameweek?: number;
  searchQuery?: string;
}>({
  key: 'fixturesFilterState',
  default: {},
});

// Selectors
export const filteredFixturesSelector = selector({
  key: 'filteredFixturesSelector',
  get: ({ get }) => {
    const fixtures = get(fixturesState);
    const filters = get(fixturesFilterState);
    
    return fixtures.filter(fixture => {
      // Status filter
      if (filters.status && fixture.status !== filters.status) {
        return false;
      }
      
      // Gameweek filter
      if (filters.gameweek && fixture.gameweek !== filters.gameweek) {
        return false;
      }
      
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          fixture.homeTeam.toLowerCase().includes(query) ||
          fixture.awayTeam.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  },
});

export const upcomingFixturesSelector = selector({
  key: 'upcomingFixturesSelector',
  get: ({ get }) => {
    const fixtures = get(fixturesState);
    return fixtures.filter(fixture => 
      fixture.status === 'pending' && 
      new Date(fixture.kickoffTime) > new Date()
    );
  },
});

export const liveFixturesSelector = selector({
  key: 'liveFixturesSelector',
  get: ({ get }) => {
    const fixtures = get(fixturesState);
    return fixtures.filter(fixture => fixture.status === 'live');
  },
});

export const finishedFixturesSelector = selector({
  key: 'finishedFixturesSelector',
  get: ({ get }) => {
    const fixtures = get(fixturesState);
    return fixtures.filter(fixture => fixture.status === 'finished');
  },
});

export const fixturesByGameweekSelector = selector({
  key: 'fixturesByGameweekSelector',
  get: ({ get }) => {
    const fixtures = get(fixturesState);
    const gameweeks = [...new Set(fixtures.map(f => f.gameweek))].sort((a, b) => a - b);
    
    return gameweeks.map(gameweek => ({
      gameweek,
      fixtures: fixtures.filter(f => f.gameweek === gameweek)
    }));
  },
});

export const fixturesStatsSelector = selector({
  key: 'fixturesStatsSelector',
  get: ({ get }) => {
    const fixtures = get(fixturesState);
    
    return {
      total: fixtures.length,
      pending: fixtures.filter(f => f.status === 'pending').length,
      live: fixtures.filter(f => f.status === 'live').length,
      finished: fixtures.filter(f => f.status === 'finished').length,
      cancelled: fixtures.filter(f => f.status === 'cancelled').length,
      totalPoolSize: fixtures.reduce((sum, f) => sum + f.totalPoolSize, 0),
    };
  },
});
