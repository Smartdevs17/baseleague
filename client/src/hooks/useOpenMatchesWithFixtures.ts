import { useMemo } from 'react';
import { useContractRead } from 'wagmi';
import { contractHelpers } from '@/lib/wagmi';
import { Match as ContractMatch } from '@/lib/contracts';
import { useUpcomingFixturesQuery } from './useFixtures';
import { useTeamLogos } from './useTeamLogos';
import { Match, Fixture } from '@/types/match';

// Custom hook to fetch all open matches and map them to API fixtures
export const useOpenMatchesWithFixtures = () => {
  // Get open matches from blockchain
  const { data: openMatches } = useContractRead({
    ...contractHelpers.getOpenMatches(),
  });

  // Get upcoming fixtures from API
  const { fixtures: apiFixtures, loading: fixturesLoading, error: fixturesError } = useUpcomingFixturesQuery();
  const { getTeamLogo } = useTeamLogos();

  // For now, let's limit to first 5 matches to avoid hook rule violations
  // We'll need to implement a different approach for dynamic match fetching
  const maxMatches = 5;
  const limitedOpenMatches = useMemo(() => {
    if (!openMatches || openMatches.length === 0) return [];
    return openMatches.slice(0, maxMatches);
  }, [openMatches]);

  // Individual contract reads for each match (limited to avoid hook rule violations)
  const match1Data = useContractRead({
    ...contractHelpers.getMatch(limitedOpenMatches[0] || 0),
    enabled: limitedOpenMatches.length > 0,
  });

  const match2Data = useContractRead({
    ...contractHelpers.getMatch(limitedOpenMatches[1] || 0),
    enabled: limitedOpenMatches.length > 1,
  });

  const match3Data = useContractRead({
    ...contractHelpers.getMatch(limitedOpenMatches[2] || 0),
    enabled: limitedOpenMatches.length > 2,
  });

  const match4Data = useContractRead({
    ...contractHelpers.getMatch(limitedOpenMatches[3] || 0),
    enabled: limitedOpenMatches.length > 3,
  });

  const match5Data = useContractRead({
    ...contractHelpers.getMatch(limitedOpenMatches[4] || 0),
    enabled: limitedOpenMatches.length > 4,
  });

  // Process matches and map to API fixtures
  const processedMatches = useMemo(() => {
    if (!limitedOpenMatches || limitedOpenMatches.length === 0 || !apiFixtures || apiFixtures.length === 0) {
      return [];
    }

    const matches: Match[] = [];
    const matchDataResults = [match1Data, match2Data, match3Data, match4Data, match5Data];

    limitedOpenMatches.forEach((matchId: number, index: number) => {
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
  }, [limitedOpenMatches, apiFixtures, match1Data.data, match2Data.data, match3Data.data, match4Data.data, match5Data.data, getTeamLogo]);

  const isLoading = [match1Data.isLoading, match2Data.isLoading, match3Data.isLoading, match4Data.isLoading, match5Data.isLoading].some(loading => loading) || fixturesLoading;
  const hasError = [match1Data.error, match2Data.error, match3Data.error, match4Data.error, match5Data.error].some(error => error) || fixturesError;

  return {
    matches: processedMatches,
    isLoading,
    error: hasError,
    openMatchesCount: openMatches?.length || 0,
  };
};
