// Utility to preload team logos for better performance
import { teamLogoService } from '@/services/teamLogos';

export const preloadTeamLogos = async (fixtures: any[]): Promise<void> => {
  // Extract unique team IDs from fixtures
  const teamIds = new Set<string>();
  
  fixtures.forEach(fixture => {
    if (fixture.homeTeamId) teamIds.add(fixture.homeTeamId);
    if (fixture.awayTeamId) teamIds.add(fixture.awayTeamId);
  });

  // Preload logos for all unique teams
  if (teamIds.size > 0) {
    try {
      await teamLogoService.preloadLogos(Array.from(teamIds));
      console.log(`✅ Preloaded logos for ${teamIds.size} teams`);
    } catch (error) {
      console.warn('Failed to preload team logos:', error);
    }
  }
};

// Preload common Premier League team logos on app startup
export const preloadCommonLogos = async (): Promise<void> => {
  const commonTeamIds = ['12', '14', '13', '6', '1', '18']; // Liverpool, Man Utd, Man City, Chelsea, Arsenal, Tottenham
  
  try {
    await teamLogoService.preloadLogos(commonTeamIds);
    console.log('✅ Preloaded common team logos');
  } catch (error) {
    console.warn('Failed to preload common team logos:', error);
  }
};
