import apiClient from '@/lib/api';
import { ApiFixture, FixturesResponse } from '@/store/fixtures';

export interface SyncFixturesResponse {
  success: boolean;
  message: string;
  fixtures: ApiFixture[];
}

export interface UpdateFixtureResultRequest {
  homeScore: number;
  awayScore: number;
}

export interface UpdateFixtureResultResponse {
  success: boolean;
  message: string;
  payoutInfo?: {
    winningOutcome: string;
    totalPool: number;
    winningPool: number;
    payoutRate: number;
    totalPayout: number;
  };
}

export interface FixtureStatsResponse {
  totalBets: number;
  totalPool: number;
  winBets: number;
  drawBets: number;
  loseBets: number;
}

class FixturesService {
  /**
   * Get all fixtures
   */
  async getFixtures(): Promise<ApiFixture[]> {
    const response = await apiClient.get<FixturesResponse>('/api/betting/fixtures');
    return response.data.fixtures;
  }

  /**
   * Get fixtures by status
   */
  async getFixturesByStatus(status: 'pending' | 'live' | 'finished' | 'cancelled'): Promise<ApiFixture[]> {
    const response = await apiClient.get<FixturesResponse>(`/api/betting/fixtures?status=${status}`);
    return response.data.fixtures;
  }

  /**
   * Get fixtures by gameweek
   */
  async getFixturesByGameweek(gameweek: number): Promise<ApiFixture[]> {
    const response = await apiClient.get<FixturesResponse>(`/api/betting/fixtures?gameweek=${gameweek}`);
    return response.data.fixtures;
  }

  /**
   * Get a specific fixture by ID
   */
  async getFixtureById(id: string): Promise<ApiFixture> {
    const response = await apiClient.get<{ success: boolean; fixture: ApiFixture }>(`/api/betting/fixtures/${id}`);
    return response.data.fixture;
  }

  /**
   * Sync fixtures from Premier League API
   */
  async syncFixtures(): Promise<SyncFixturesResponse> {
    const response = await apiClient.post<SyncFixturesResponse>('/api/betting/fixtures/sync');
    return response.data;
  }

  /**
   * Update fixture result and process payouts
   */
  async updateFixtureResult(
    fixtureId: string, 
    data: UpdateFixtureResultRequest
  ): Promise<UpdateFixtureResultResponse> {
    const response = await apiClient.put<UpdateFixtureResultResponse>(`/api/betting/fixtures/${fixtureId}/result`, data);
    return response.data;
  }

  /**
   * Get fixture statistics
   */
  async getFixtureStats(fixtureId: string): Promise<FixtureStatsResponse> {
    const response = await apiClient.get<FixtureStatsResponse>(`/api/betting/fixtures/${fixtureId}/stats`);
    return response.data;
  }

  /**
   * Get upcoming fixtures (pending status and future kickoff time)
   */
  async getUpcomingFixtures(): Promise<ApiFixture[]> {
    const fixtures = await this.getFixtures();
    const now = new Date();
    
    return fixtures.filter(fixture => 
      fixture.status === 'pending' && 
      new Date(fixture.kickoffTime) > now
    );
  }

  /**
   * Get live fixtures
   */
  async getLiveFixtures(): Promise<ApiFixture[]> {
    return this.getFixturesByStatus('live');
  }

  /**
   * Get finished fixtures
   */
  async getFinishedFixtures(): Promise<ApiFixture[]> {
    return this.getFixturesByStatus('finished');
  }

  /**
   * Search fixtures by team names
   */
  async searchFixtures(query: string): Promise<ApiFixture[]> {
    const fixtures = await this.getFixtures();
    const lowercaseQuery = query.toLowerCase();
    
    return fixtures.filter(fixture =>
      fixture.homeTeam.toLowerCase().includes(lowercaseQuery) ||
      fixture.awayTeam.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const fixturesService = new FixturesService();
