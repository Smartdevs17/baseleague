import { BettingService } from '../services/bettingService.js'
import { fetchFixtures, fetchPlayers, getTeamsFromPlayers, processFixtures } from '../services/api/premierLeague.js'

/**
 * Betting Controller
 * Handles HTTP requests for betting operations
 */
export class BettingController {
  /**
   * Get all available fixtures for betting
   */
  static async getFixtures(req, res) {
    try {
      const fixtures = await BettingService.getAllFixtures()
      res.json({ success: true, fixtures })
    } catch (error) {
      console.error('Error fetching fixtures:', error.message)
      res.status(500).json({ error: 'Failed to fetch fixtures' })
    }
  }

  /**
   * Get specific fixture with betting pools
   */
  static async getFixture(req, res) {
    try {
      const { id } = req.params
      const fixture = await BettingService.getFixture(id)
      
      if (!fixture) {
        return res.status(404).json({ error: 'Fixture not found' })
      }
      
      res.json({ success: true, fixture })
    } catch (error) {
      console.error('Error fetching fixture:', error.message)
      res.status(500).json({ error: 'Failed to fetch fixture' })
    }
  }

  /**
   * Place a new bet
   */
  static async createBet(req, res) {
    try {
      const { userId, fixtureId, teamId, teamName, outcome, amount } = req.body
      
      const result = await BettingService.createBet({
        userId,
        fixtureId,
        teamId,
        teamName,
        outcome,
        amount
      })
      
      if (result.error) {
        return res.status(400).json({ error: result.error })
      }
      
      res.status(201).json({ success: true, bet: result.bet })
    } catch (error) {
      console.error('Error creating bet:', error.message)
      res.status(500).json({ error: 'Failed to create bet' })
    }
  }

  /**
   * Get all bets for a specific user
   */
  static async getUserBets(req, res) {
    try {
      const { userId } = req.params
      const userBets = await BettingService.getUserBets(userId)
      
      res.json({ success: true, bets: userBets })
    } catch (error) {
      console.error('Error fetching user bets:', error.message)
      res.status(500).json({ error: 'Failed to fetch user bets' })
    }
  }

  /**
   * Sync fixtures from Premier League API
   */
  static async syncFixtures(req, res) {
    try {
      // Fetch data from Premier League API
      const [fixturesData, playersData] = await Promise.all([
        fetchFixtures(),
        fetchPlayers()
      ])
      
      // Process the data
      const teams = getTeamsFromPlayers(playersData)
      const processedFixtures = processFixtures(fixturesData, teams)
      
      // Add fixtures to betting service
      const syncedFixtures = []
      for (const fixtureData of processedFixtures) {
        const fixture = await BettingService.addFixture({
          externalId: fixtureData.id.toString(),
          homeTeam: fixtureData.homeTeam,
          awayTeam: fixtureData.awayTeam,
          homeTeamId: fixtureData.homeTeamId.toString(),
          awayTeamId: fixtureData.awayTeamId.toString(),
          kickoffTime: new Date(fixtureData.kickoffTime),
          status: fixtureData.status,
          homeScore: fixtureData.homeScore,
          awayScore: fixtureData.awayScore,
          gameweek: fixtureData.gameweek
        })
        syncedFixtures.push(fixture.toJSON())
      }
      
      res.json({ 
        success: true, 
        message: `Synced ${syncedFixtures.length} fixtures`,
        fixtures: syncedFixtures
      })
    } catch (error) {
      console.error('Error syncing fixtures:', error.message)
      res.status(500).json({ error: 'Failed to sync fixtures' })
    }
  }

  /**
   * Update fixture result and process payouts
   */
  static async updateFixtureResult(req, res) {
    try {
      const { id } = req.params
      const { homeScore, awayScore } = req.body
      
      if (homeScore === undefined || awayScore === undefined) {
        return res.status(400).json({ error: 'homeScore and awayScore are required' })
      }
      
      const result = await BettingService.updateFixtureResult(id, homeScore, awayScore)
      
      if (result.error) {
        return res.status(400).json({ error: result.error })
      }
      
      res.json({ success: true, ...result })
    } catch (error) {
      console.error('Error updating fixture result:', error.message)
      res.status(500).json({ error: 'Failed to update fixture result' })
    }
  }

  /**
   * Get betting statistics
   */
  static async getBettingStats(req, res) {
    try {
      const stats = await BettingService.getBettingStats()
      res.json({ success: true, stats })
    } catch (error) {
      console.error('Error fetching betting stats:', error.message)
      res.status(500).json({ error: 'Failed to fetch betting stats' })
    }
  }
}
