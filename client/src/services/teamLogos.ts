// Team logo service for fetching team logos
// Using Premier League official badge URLs with FPL team IDs (1-20)

interface TeamLogoData {
  id: string;
  name: string;
  logo: string;
  shortName?: string;
}

// Use FPL team codes for more reliable logo URLs
// FPL API provides team codes that work better with Premier League badge URLs
const getLogoUrlByCode = (teamId: string): string | null => {
	const teamCode = FPL_TEAM_CODES[teamId];
	if (!teamCode) return null;
	// Try with team code first (more reliable)
	return `https://resources.premierleague.com/premierleague/badges/50/t${teamCode}.png`;
};

// Multiple logo sources with fallback
// Try different CDN sources for Premier League team logos
const LOGO_SOURCES = [
	// Source 1: Using FPL team code (most reliable)
	getLogoUrlByCode,
	// Source 2: Premier League official with team ID
	(teamId: string) => `https://resources.premierleague.com/premierleague/badges/50/t${teamId}.png`,
	// Source 3: Alternative CDN format
	(teamId: string) => `https://resources.premierleague.com/premierleague/badges/t${teamId}.png`,
];

// Cache for loaded logos to avoid repeated requests
const logoCache = new Map<string, string>();

class TeamLogoService {
  /**
   * Get team logo URL by FPL team ID (1-20)
   * Uses multiple fallback sources for reliability
   */
  getLogoById(teamId: string): string {
    // Check cache first
    if (logoCache.has(teamId)) {
      return logoCache.get(teamId)!;
    }

    // Try first source (most reliable)
    const logoUrl = LOGO_SOURCES[0](teamId);
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
   * Tries multiple sources if first fails
   */
  async preloadLogos(teamIds: string[]): Promise<void> {
    const promises = teamIds.map(async (teamId) => {
      // Try each logo source until one works
      for (const getLogoUrl of LOGO_SOURCES) {
        const logoUrl = getLogoUrl(teamId);
        if (!logoUrl) continue;
        
        try {
          // Create image element to preload
          const img = new Image();
          img.src = logoUrl;
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Cache the working URL
              logoCache.set(teamId, logoUrl);
              resolve(logoUrl);
            };
            img.onerror = reject;
            // Timeout after 5 seconds
            setTimeout(() => reject(new Error('Timeout')), 5000);
          });
          // If successful, break and don't try other sources
          return;
        } catch (error) {
          // Try next source
          continue;
        }
      }
      // If all sources fail, log a warning but don't throw
      console.warn(`Failed to preload logo for team ${teamId} from all sources`);
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
      logo: LOGO_SOURCES[0](id.toString()),
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

// FPL team codes (from bootstrap-static API)
// Used as fallback for logo URLs
const FPL_TEAM_CODES: Record<string, number> = {
  '1': 3,   // Arsenal
  '2': 7,   // Aston Villa
  '3': 91,  // Burnley
  '4': 35,  // Bournemouth
  '5': 94,  // Brentford
  '6': 36,  // Brighton
  '7': 8,   // Chelsea
  '8': 31,  // Crystal Palace
  '9': 11,  // Everton
  '10': 54, // Fulham
  '11': 2,  // Leeds
  '12': 14, // Liverpool
  '13': 43, // Man City
  '14': 1,  // Man Utd
  '15': 4,  // Newcastle
  '16': 17, // Nott'm Forest
  '17': 20, // Sunderland
  '18': 6,  // Spurs
  '19': 21, // West Ham
  '20': 39, // Wolves
};

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
