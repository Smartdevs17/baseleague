// Team logo service for fetching team logos
// Using Premier League official badge URLs with FPL team IDs (1-20)

interface TeamLogoData {
  id: string;
  name: string;
  logo: string;
  shortName?: string;
}

// Premier League official badge base URL
// Format: https://resources.premierleague.com/premierleague/badges/50/t{teamId}.png
// Where teamId is the FPL team ID (1-20)
const PREMIER_LEAGUE_LOGO_BASE = 'https://resources.premierleague.com/premierleague/badges/50';

// Cache for loaded logos to avoid repeated requests
const logoCache = new Map<string, string>();

class TeamLogoService {
  /**
   * Get team logo URL by FPL team ID (1-20)
   * Premier League official badges: https://resources.premierleague.com/premierleague/badges/50/t{teamId}.png
   */
  getLogoById(teamId: string): string {
    // Check cache first
    if (logoCache.has(teamId)) {
      return logoCache.get(teamId)!;
    }

    // Use Premier League official badge URL
    // FPL team IDs are 1-20 (e.g., 1 = Arsenal, 12 = Liverpool, etc.)
    const logoUrl = `${PREMIER_LEAGUE_LOGO_BASE}/t${teamId}.png`;
    logoCache.set(teamId, logoUrl);
    return logoUrl;
  }

  /**
   * Get team logo URL by team name
   * Maps common team names to FPL team IDs (1-20)
   */
  getLogoByName(teamName: string): string {
    // Check cache first
    if (logoCache.has(teamName)) {
      return logoCache.get(teamName)!;
    }

    // Try to find FPL team ID by name
    const teamId = this.getTeamIdByName(teamName);
    if (teamId) {
      return this.getLogoById(teamId);
    }

    // Fallback to default logo
    const defaultLogo = `https://via.placeholder.com/70x70/1f2937/ffffff?text=${teamName.substring(0, 3).toUpperCase()}`;
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
    return Object.entries(FPL_TEAM_IDS).map(([name, id]) => ({
      id: id.toString(),
      name,
      logo: `${PREMIER_LEAGUE_LOGO_BASE}/t${id}.png`,
    }));
  }

  /**
   * Get team name by ID (reverse lookup)
   */
  private getTeamNameById(teamId: string): string {
    for (const [name, id] of Object.entries(FPL_TEAM_IDS)) {
      if (id.toString() === teamId) {
        return name;
      }
    }
    return 'Unknown Team';
  }

  /**
   * Get team ID by name (reverse lookup)
   * Maps team names to FPL team IDs (1-20)
   */
  private getTeamIdByName(teamName: string): string | null {
    // Normalize team name for matching
    const normalizedName = teamName.toLowerCase().trim();
    
    // Direct match
    if (FPL_TEAM_IDS[teamName]) {
      return FPL_TEAM_IDS[teamName].toString();
    }
    
    // Try normalized match
    for (const [name, id] of Object.entries(FPL_TEAM_IDS)) {
      if (name.toLowerCase() === normalizedName) {
        return id.toString();
      }
    }
    
    // Try partial match for common variations
    for (const [name, id] of Object.entries(FPL_TEAM_IDS)) {
      if (normalizedName.includes(name.toLowerCase()) || name.toLowerCase().includes(normalizedName)) {
        return id.toString();
      }
    }

    return null;
  }
}

// FPL team IDs for Premier League teams (1-20)
// These match the Fantasy Premier League API team IDs
const FPL_TEAM_IDS: Record<string, number> = {
  'Arsenal': 1,
  'Aston Villa': 2,
  'Burnley': 3,
  'Bournemouth': 4,
  'Brentford': 5,
  'Brighton': 6,
  'Chelsea': 7,
  'Crystal Palace': 8,
  'Everton': 9,
  'Fulham': 10,
  'Leeds': 11,
  'Liverpool': 12,
  'Man City': 13,
  'Manchester City': 13,
  'Man Utd': 14,
  'Man United': 14,
  'Manchester United': 14,
  'Newcastle': 15,
  'Nott\'m Forest': 16,
  'Nottingham Forest': 16,
  'Nottingham': 16,
  'Sunderland': 17,
  'Spurs': 18,
  'Tottenham': 18,
  'Tottenham Hotspur': 18,
  'West Ham': 19,
  'West Ham United': 19,
  'Wolves': 20,
  'Wolverhampton': 20,
  'Wolverhampton Wanderers': 20,
};

export const teamLogoService = new TeamLogoService();
