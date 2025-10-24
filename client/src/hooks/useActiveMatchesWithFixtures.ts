import { useMemo } from 'react';
import { useContractRead } from 'wagmi';
import { contractHelpers } from '@/lib/wagmi';
import { Match as ContractMatch } from '@/lib/contracts';
import { useUpcomingFixturesQuery } from './useFixtures';
import { useTeamLogos } from './useTeamLogos';
import { Match, Fixture } from '@/types/match';

// Custom hook to fetch all active matches and map them to API fixtures
export const useActiveMatchesWithFixtures = () => {
  // Get active matches from blockchain
  const { data: activeMatches } = useContractRead({
    ...contractHelpers.getActiveMatches(),
  }) as { data?: number[] };

  // Get upcoming fixtures from API
  const { fixtures: apiFixtures, loading: fixturesLoading, error: fixturesError } = useUpcomingFixturesQuery();
  const { getTeamLogo } = useTeamLogos();

  // For now, let's limit to first 5 matches to avoid hook rule violations
  // We'll need to implement a different approach for dynamic match fetching
  const maxMatches = 5;
  const limitedActiveMatches = useMemo(() => {
    if (!activeMatches || !Array.isArray(activeMatches) || activeMatches.length === 0) return [];
    return activeMatches.slice(0, maxMatches);
  }, [activeMatches]);

  // Individual contract reads for each match (limited to avoid hook rule violations)
  const match1Data = useContractRead({
    ...contractHelpers.getMatch(limitedActiveMatches[0] || 0),
  });

  const match2Data = useContractRead({
    ...contractHelpers.getMatch(limitedActiveMatches[1] || 0),
  });

  const match3Data = useContractRead({
    ...contractHelpers.getMatch(limitedActiveMatches[2] || 0),
  });

  const match4Data = useContractRead({
    ...contractHelpers.getMatch(limitedActiveMatches[3] || 0),
  });

  const match5Data = useContractRead({
    ...contractHelpers.getMatch(limitedActiveMatches[4] || 0),
  });

  // Process matches and map to API fixtures
  const processedMatches = useMemo(() => {
    if (!limitedActiveMatches || limitedActiveMatches.length === 0 || !apiFixtures || apiFixtures.length === 0) {
      return [];
    }

    const matches: Match[] = [];
    const matchDataResults = [match1Data, match2Data, match3Data, match4Data, match5Data];

    limitedActiveMatches.forEach((matchId: number, index: number) => {
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
        joiner: matchData.joiner,
        stake: matchData.stakeAmount.toString(),
        fixtureId: Number(matchData.fixtureId),
        fixture,
        creatorPrediction: matchData.creatorPrediction === 0 ? 'home' : 
                          matchData.creatorPrediction === 1 ? 'draw' : 'away',
        joinerPrediction: matchData.joinerPrediction === 0 ? 'home' :
                          matchData.joinerPrediction === 1 ? 'draw' :
                          matchData.joinerPrediction === 2 ? 'away' : undefined,
        settled: matchData.isSettled,
        status: matchData.status === 0 ? 'open' : 
               matchData.status === 1 ? 'active' : 'completed',
        createdAt: Number(matchData.createdAt),
      };

      matches.push(match);
    });

    return matches;
  }, [limitedActiveMatches, apiFixtures, match1Data, match2Data, match3Data, match4Data, match5Data, getTeamLogo]);

  // Only consider loading/error states for matches that are actually being fetched
  const activeMatchData = [match1Data, match2Data, match3Data, match4Data, match5Data].filter((_, index) => 
    limitedActiveMatches.length > index && limitedActiveMatches[index] > 0
  );
  
  const isLoading = activeMatchData.some(match => match.isLoading) || fixturesLoading;
  const hasError = activeMatchData.some(match => match.error) || fixturesError;

  // Debug logging
  console.log('useActiveMatchesWithFixtures debug:', {
    activeMatches,
    limitedActiveMatches,
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
  activeMatchesCount: Array.isArray(activeMatches) ? activeMatches.length : 0,
  };
};
