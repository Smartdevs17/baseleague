import { useMemo } from 'react';
import { useContractRead } from 'wagmi';
import { contractHelpers } from '@/lib/wagmi';
import { Match as ContractMatch } from '@/lib/contracts';
import { useUpcomingFixturesQuery } from './useFixtures';
import { useTeamLogos } from './useTeamLogos';
import { Match, Fixture } from '@/types/match';

// Custom hook to fetch all completed matches and map them to API fixtures
export const useCompletedMatchesWithFixtures = () => {
  // Get completed matches from blockchain
  const { data: completedMatches } = useContractRead({
    ...contractHelpers.getCompletedMatches(),
  });

  // Get upcoming fixtures from API
  const { fixtures: apiFixtures, loading: fixturesLoading, error: fixturesError } = useUpcomingFixturesQuery();
  const { getTeamLogo } = useTeamLogos();

  // For now, let's limit to first 5 matches to avoid hook rule violations
  // We'll need to implement a different approach for dynamic match fetching
  const maxMatches = 5;
  const limitedCompletedMatches = useMemo(() => {
    if (!completedMatches || completedMatches.length === 0) return [];
    return completedMatches.slice(0, maxMatches);
  }, [completedMatches]);

  // Individual contract reads for each match (limited to avoid hook rule violations)
  const match1Data = useContractRead({
    ...contractHelpers.getMatch(limitedCompletedMatches[0] || 0),
    enabled: limitedCompletedMatches.length > 0,
  });

  const match2Data = useContractRead({
    ...contractHelpers.getMatch(limitedCompletedMatches[1] || 0),
    enabled: limitedCompletedMatches.length > 1,
  });

  const match3Data = useContractRead({
    ...contractHelpers.getMatch(limitedCompletedMatches[2] || 0),
    enabled: limitedCompletedMatches.length > 2,
  });

  const match4Data = useContractRead({
    ...contractHelpers.getMatch(limitedCompletedMatches[3] || 0),
    enabled: limitedCompletedMatches.length > 3,
  });

  const match5Data = useContractRead({
    ...contractHelpers.getMatch(limitedCompletedMatches[4] || 0),
    enabled: limitedCompletedMatches.length > 4,
  });

  // Process matches and map to API fixtures
  const processedMatches = useMemo(() => {
    if (!limitedCompletedMatches || limitedCompletedMatches.length === 0 || !apiFixtures || apiFixtures.length === 0) {
      return [];
    }

    const matches: Match[] = [];
    const matchDataResults = [match1Data, match2Data, match3Data, match4Data, match5Data];

    limitedCompletedMatches.forEach((matchId: number, index: number) => {
      const matchResult = matchDataResults[index];
      
      if (!matchResult.data || matchResult.isLoading || matchResult.error) return;

      const matchData = matchResult.data as ContractMatch;
      
      // Find corresponding API fixture
      const apiFixture = apiFixtures.find(fixture => 
        fixture.externalId === matchData.fixtureId.toString()
      );

      if (!apiFixture) {
        console.warn(`No API fixture found for match ${matchId} with fixtureId ${matchData.fixtureId}`);
        return;
      }

      // Create fixture object
      const fixture: Fixture = {
        id: parseInt(matchData.fixtureId),
        date: apiFixture.kickoffTime,
        homeTeam: apiFixture.homeTeam,
        awayTeam: apiFixture.awayTeam,
        homeTeamLogo: getTeamLogo(apiFixture.homeTeamId, apiFixture.homeTeam),
        awayTeamLogo: getTeamLogo(apiFixture.awayTeamId, apiFixture.awayTeam),
        status: apiFixture.status === 'pending' ? 'upcoming' : 
                apiFixture.status === 'live' ? 'live' : 
                apiFixture.status === 'finished' ? 'finished' : 'upcoming',
        league: 'Premier League',
      };

      // Create match object
      const match: Match = {
        id: matchId.toString(),
        creator: matchData.creator,
        stake: matchData.stakeAmount.toString(),
        fixtureId: Number(matchData.fixtureId),
        fixture,
        creatorPrediction: matchData.creatorPrediction === 0 ? 'home' : 
                          matchData.creatorPrediction === 1 ? 'draw' : 'away',
        settled: matchData.isSettled,
        status: matchData.status === 0 ? 'open' : 
               matchData.status === 1 ? 'active' : 'completed',
        createdAt: Number(matchData.createdAt),
      };

      matches.push(match);
    });

    return matches;
  }, [limitedCompletedMatches, apiFixtures, match1Data.data, match2Data.data, match3Data.data, match4Data.data, match5Data.data, getTeamLogo]);

  // Only consider loading/error states for matches that are actually being fetched
  const activeMatchData = [match1Data, match2Data, match3Data, match4Data, match5Data].filter((_, index) => 
    limitedCompletedMatches.length > index && limitedCompletedMatches[index] > 0
  );
  
  const isLoading = activeMatchData.some(match => match.isLoading) || fixturesLoading;
  const hasError = activeMatchData.some(match => match.error) || fixturesError;

  // Debug logging
  console.log('useCompletedMatchesWithFixtures debug:', {
    completedMatches,
    limitedCompletedMatches,
    apiFixtures: apiFixtures?.length,
    fixturesLoading,
    fixturesError,
    match1Data: { data: match1Data.data, error: match1Data.error, isLoading: match1Data.isLoading },
    processedMatches: processedMatches.length,
    isLoading,
    hasError
  });

  return {
    matches: processedMatches,
    isLoading,
    error: hasError,
    completedMatchesCount: completedMatches?.length || 0,
  };
};
