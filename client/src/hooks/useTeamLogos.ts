import { useState, useEffect } from 'react';
import { teamLogoService } from '@/services/teamLogos';

interface TeamLogoHook {
  getTeamLogo: (teamId: string, teamName: string) => string;
  preloadLogos: (teamIds: string[]) => Promise<void>;
  isLoading: boolean;
}

export const useTeamLogos = (): TeamLogoHook => {
  const [isLoading, setIsLoading] = useState(false);

  const getTeamLogo = (teamId: string, teamName: string): string => {
    return teamLogoService.getTeamLogo(teamId, teamName);
  };

  const preloadLogos = async (teamIds: string[]): Promise<void> => {
    setIsLoading(true);
    try {
      await teamLogoService.preloadLogos(teamIds);
    } catch (error) {
      console.warn('Failed to preload team logos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getTeamLogo,
    preloadLogos,
    isLoading,
  };
};
