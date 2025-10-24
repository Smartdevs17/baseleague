// Team logo service for fetching team logos
// Using Fantasy Premier League API badge system

interface TeamLogoData {
  id: string;
  name: string;
  logo: string;
  shortName?: string;
}

// Premier League team logos using FPL badge codes
// These codes match the FPL API team codes
const FPL_BADGE_BASE = 'https://resources.premierleague.com/premierleague/badges/70';

const TEAM_BADGE_CODES: Record<string, number> = {
  '1': 3,    // Arsenal
  '2': 7,    // Aston Villa
  '3': 90,   // Burnley
  '4': 91,   // Bournemouth
  '5': 94,   // Brentford
  '6': 36,   // Brighton
  '7': 8,    // Chelsea
  '8': 31,   // Crystal Palace
  '9': 11,   // Everton
  '10': 54,  // Fulham
  '11': 2,   // Leeds
  '12': 14,  // Liverpool
  '13': 43,  // Man City
  '14': 1,   // Man Utd
  '15': 4,   // Newcastle
  '16': 17,  // Nott'm Forest
  '17': 56,  // Sunderland
  '18': 6,   // Spurs
  '19': 21,  // West Ham
  '20': 39,  // Wolves
};

// Cache for loaded logos to avoid repeated requests
const logoCache = new Map<string, string>();

class TeamLogoService {
  /**
   * Get team logo URL by team ID
   */
  getLogoById(teamId: string): string {
    // Check cache first
    if (logoCache.has(teamId)) {
      return logoCache.get(teamId)!;
    }

    // Get the badge code for this team
    const badgeCode = TEAM_BADGE_CODES[teamId];
    if (badgeCode) {
      const logoUrl = `${FPL_BADGE_BASE}/t${badgeCode}.png`;
      logoCache.set(teamId, logoUrl);
      return logoUrl;
    }

    // Fallback to default logo
    const defaultLogo = `https://via.placeholder.com/70x70/1f2937/ffffff?text=${this.getTeamNameById(teamId).substring(0, 3)}`;
    logoCache.set(teamId, defaultLogo);
    return defaultLogo;
  }

  /**
   * Get team logo URL by team name
   */
  getLogoByName(teamName: string): string {
    // Check cache first
    if (logoCache.has(teamName)) {
      return logoCache.get(teamName)!;
    }

    // Try to find team ID by name
    const teamId = this.getTeamIdByName(teamName);
    if (teamId) {
      return this.getLogoById(teamId);
    }

    // Fallback to default logo
    const defaultLogo = `https://via.placeholder.com/70x70/1f2937/ffffff?text=${teamName.substring(0, 3)}`;
    logoCache.set(teamName, defaultLogo);
    return defaultLogo;
  }

  /**
   * Get team logo with fallback strategy
   */
  getTeamLogo(teamId: string, teamName: string): string {
    return this.getLogoById(teamId);
  }

  /**
   * Preload logos for better performance
   */
  async preloadLogos(teamIds: string[]): Promise<void> {
    const promises = teamIds.map(async (teamId) => {
      const logoUrl = this.getLogoById(teamId);
      try {
        // Create image element to preload
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      } catch (error) {
        console.warn(`Failed to preload logo for team ${teamId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get all available team logos
   */
  getAllTeamLogos(): TeamLogoData[] {
    return Object.entries(TEAM_BADGE_CODES).map(([id, code]) => ({
      id,
      name: this.getTeamNameById(id),
      logo: `${FPL_BADGE_BASE}/t${code}.png`,
    }));
  }

  /**
   * Get team name by ID (reverse lookup)
   */
  private getTeamNameById(teamId: string): string {
    const teamNames: Record<string, string> = {
      '1': 'Arsenal',
      '2': 'Aston Villa',
      '3': 'Burnley',
      '4': 'Bournemouth',
      '5': 'Brentford',
      '6': 'Brighton',
      '7': 'Chelsea',
      '8': 'Crystal Palace',
      '9': 'Everton',
      '10': 'Fulham',
      '11': 'Leeds',
      '12': 'Liverpool',
      '13': 'Man City',
      '14': 'Man Utd',
      '15': 'Newcastle',
      '16': 'Nott\'m Forest',
      '17': 'Sunderland',
      '18': 'Spurs',
      '19': 'West Ham',
      '20': 'Wolves',
    };
    return teamNames[teamId] || 'Unknown Team';
  }

  /**
   * Get team ID by name (reverse lookup)
   */
  private getTeamIdByName(teamName: string): string | null {
    const teamNames: Record<string, string> = {
      '1': 'Arsenal',
      '2': 'Aston Villa',
      '3': 'Burnley',
      '4': 'Bournemouth',
      '5': 'Brentford',
      '6': 'Brighton',
      '7': 'Chelsea',
      '8': 'Crystal Palace',
      '9': 'Everton',
      '10': 'Fulham',
      '11': 'Leeds',
      '12': 'Liverpool',
      '13': 'Man City',
      '14': 'Man Utd',
      '15': 'Newcastle',
      '16': 'Nott\'m Forest',
      '17': 'Sunderland',
      '18': 'Spurs',
      '19': 'West Ham',
      '20': 'Wolves',
    };

    for (const [id, name] of Object.entries(teamNames)) {
      if (name === teamName) {
        return id;
      }
    }

    return null;
  }
}

export const teamLogoService = new TeamLogoService();
