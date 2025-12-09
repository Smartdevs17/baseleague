export interface Fixture {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  status: 'upcoming' | 'live' | 'finished';
  score?: {
    home: number;
    away: number;
  };
  league: string;
}

export interface Match {
  id: string;
  creator: string;
  joiner?: string;
  stake: string;
  fixtureId: number;
  fixture: Fixture;
  creatorPrediction: 'home' | 'draw' | 'away';
  joinerPrediction?: 'home' | 'draw' | 'away';
  settled: boolean;
  awaitingSettlement?: boolean;
  winner?: string;
  status: 'open' | 'active' | 'completed';
  createdAt: number;
}

export type PredictionType = 'home' | 'draw' | 'away';
