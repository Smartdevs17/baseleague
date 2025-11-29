// Team logo service for fetching team logos
// Using API-Football (api-sports.io) team logo system

interface TeamLogoData {
  id: string;
  name: string;
  logo: string;
  shortName?: string;
}

// API-Football logo base URL
// Format: https://media.api-sports.io/football/teams/{teamId}.png
const API_FOOTBALL_LOGO_BASE = 'https://media.api-sports.io/football/teams';

// Cache for loaded logos to avoid repeated requests
const logoCache = new Map<string, string>();

class TeamLogoService {
  /**
   * Get team logo URL by team ID (API-Football team ID)
   * API-Football provides logos at: https://media.api-sports.io/football/teams/{teamId}.png
   */
  getLogoById(teamId: string): string {
    // Check cache first
    if (logoCache.has(teamId)) {
      return logoCache.get(teamId)!;
    }

    // Use API-Football logo URL directly
    // Team IDs from API-Football (e.g., 42 = Arsenal, 49 = Chelsea, etc.)
    const logoUrl = `${API_FOOTBALL_LOGO_BASE}/${teamId}.png`;
    logoCache.set(teamId, logoUrl);
    return logoUrl;
  }

  /**
   * Get team logo URL by team name
   * Maps common team names to API-Football team IDs
   */
  getLogoByName(teamName: string): string {
    // Check cache first
    if (logoCache.has(teamName)) {
      return logoCache.get(teamName)!;
    }

    // Try to find team ID by name (API-Football team IDs)
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
    return Object.entries(API_FOOTBALL_TEAM_IDS).map(([name, id]) => ({
      id: id.toString(),
      name,
      logo: `${API_FOOTBALL_LOGO_BASE}/${id}.png`,
    }));
  }

  /**
   * Get team name by ID (reverse lookup)
   */
  private getTeamNameById(teamId: string): string {
    for (const [name, id] of Object.entries(API_FOOTBALL_TEAM_IDS)) {
      if (id.toString() === teamId) {
        return name;
      }
    }
    return 'Unknown Team';
  }

  /**
   * Get team ID by name (reverse lookup)
   * Maps team names to API-Football team IDs
   */
  private getTeamIdByName(teamName: string): string | null {
    // Normalize team name for matching
    const normalizedName = teamName.toLowerCase().trim();
    
    // Direct match
    if (API_FOOTBALL_TEAM_IDS[teamName]) {
      return API_FOOTBALL_TEAM_IDS[teamName].toString();
    }
    
    // Try normalized match
    for (const [name, id] of Object.entries(API_FOOTBALL_TEAM_IDS)) {
      if (name.toLowerCase() === normalizedName) {
        return id.toString();
      }
    }
    
    // Try partial match for common variations
    for (const [name, id] of Object.entries(API_FOOTBALL_TEAM_IDS)) {
      if (normalizedName.includes(name.toLowerCase()) || name.toLowerCase().includes(normalizedName)) {
        return id.toString();
      }
    }

    return null;
  }
}

// API-Football team IDs for Premier League teams
// These are the actual team IDs from API-Football (api-sports.io)
const API_FOOTBALL_TEAM_IDS: Record<string, number> = {
  'Arsenal': 42,
  'Aston Villa': 66,
  'Bournemouth': 35,
  'Brentford': 55,
  'Brighton': 51,
  'Burnley': 44,
  'Chelsea': 49,
  'Crystal Palace': 52,
  'Everton': 45,
  'Fulham': 36,
  'Leeds': 63,
  'Leicester': 46,
  'Liverpool': 40,
  'Manchester City': 50,
  'Manchester United': 33,
  'Newcastle': 34,
  'Nottingham Forest': 65,
  'Southampton': 41,
  'Tottenham': 47,
  'West Ham': 48,
  'Wolves': 39,
  // Common name variations
  'Man City': 50,
  'Man Utd': 33,
  'Man United': 33,
  'Tottenham Hotspur': 47,
  'Spurs': 47,
  'Nott\'m Forest': 65,
  'Nottingham': 65,
};

export const teamLogoService = new TeamLogoService();
