import Bet from '../models/Bet.js'
import Fixture from '../models/Fixture.js'

/**
 * Betting Service
 * Handles all betting operations with hedging prevention using MongoDB
 */
export class BettingService {
  /**
   * Create a new bet
   * @param {Object} betData - Bet information
   * @returns {Object} Created bet or error
   */
  static async createBet(betData) {
    const { userId, fixtureId, teamId, teamName, outcome, amount } = betData

    try {
      // Validate required fields
      if (!userId || !fixtureId || !teamId || !outcome || !amount) {
        return { error: 'Missing required fields' }
      }

      // Validate outcome
      if (!['win', 'draw', 'lose'].includes(outcome)) {
        return { error: 'Invalid outcome. Must be win, draw, or lose' }
      }

      // Validate amount
      if (amount <= 0) {
        return { error: 'Bet amount must be greater than 0' }
      }

      // Check if fixture exists and is open for betting
      const fixture = await Fixture.findOne({ externalId: fixtureId })
      if (!fixture) {
        return { error: 'Fixture not found' }
      }

      if (fixture.status === 'finished') {
        return { error: 'Cannot bet on finished matches' }
      }

      // Check if user already has a bet on this fixture (hedging prevention)
      const existingBet = await Bet.findOne({ userId, fixtureId })
      if (existingBet) {
        return { error: 'You can only place one bet per fixture to prevent hedging' }
      }

      // Create bet
      const bet = new Bet({
        userId,
        fixtureId,
        teamId,
        teamName,
        outcome,
        amount
      })

      await bet.save()

      // Update fixture pool
      fixture.updatePool(outcome, amount)
      await fixture.save()

      return { success: true, bet: bet.toJSON() }
    } catch (error) {
      console.error('Error creating bet:', error)
      return { error: 'Failed to create bet' }
    }
  }

  /**
   * Get all bets for a user
   * @param {string} userId - User ID
   * @returns {Array} User's bets
   */
  static async getUserBets(userId) {
    try {
      const bets = await Bet.find({ userId }).sort({ createdAt: -1 })
      return bets.map(bet => bet.toJSON())
    } catch (error) {
      console.error('Error fetching user bets:', error)
      return []
    }
  }

  /**
   * Get fixture with betting pools
   * @param {string} fixtureId - Fixture ID
   * @returns {Object} Fixture data
   */
  static async getFixture(fixtureId) {
    try {
      const fixture = await Fixture.findOne({ externalId: fixtureId })
      return fixture ? fixture.toJSON() : null
    } catch (error) {
      console.error('Error fetching fixture:', error)
      return null
    }
  }

  /**
   * Get all fixtures
   * @returns {Array} All fixtures
   */
  static async getAllFixtures() {
    try {
      const fixtures = await Fixture.find().sort({ kickoffTime: 1 })
      return fixtures.map(fixture => fixture.toJSON())
    } catch (error) {
      console.error('Error fetching fixtures:', error)
      return []
    }
  }

  /**
   * Add or update a fixture
   * @param {Object} fixtureData - Fixture data
   */
  static async addFixture(fixtureData) {
    try {
      const existingFixture = await Fixture.findOne({ externalId: fixtureData.externalId })
      
      if (existingFixture) {
        // Update existing fixture
        Object.assign(existingFixture, fixtureData)
        return await existingFixture.save()
      } else {
        // Create new fixture
        const fixture = new Fixture(fixtureData)
        return await fixture.save()
      }
    } catch (error) {
      console.error('Error adding fixture:', error)
      throw error
    }
  }

  /**
   * Update fixture result and process payouts
   * @param {string} fixtureId - Fixture ID
   * @param {number} homeScore - Home team score
   * @param {number} awayScore - Away team score
   * @returns {Object} Payout information
   */
  static async updateFixtureResult(fixtureId, homeScore, awayScore) {
    try {
      const fixture = await Fixture.findOne({ externalId: fixtureId })
      if (!fixture) {
        return { error: 'Fixture not found' }
      }

      // Update fixture
      fixture.homeScore = homeScore
      fixture.awayScore = awayScore
      fixture.status = 'finished'
      fixture.winningOutcome = fixture.getWinningOutcome()
      
      await fixture.save()

      // Calculate payouts
      const payoutInfo = fixture.calculatePayout()
      if (!payoutInfo) {
        return { error: 'Cannot calculate payout' }
      }

      // Update bet statuses
      const winningBets = await Bet.find({ 
        fixtureId, 
        outcome: payoutInfo.winningOutcome,
        status: 'pending'
      })
      
      const losingBets = await Bet.find({ 
        fixtureId, 
        outcome: { $ne: payoutInfo.winningOutcome },
        status: 'pending'
      })

      // Calculate individual payouts for winning bets
      const totalWinningAmount = winningBets.reduce((sum, bet) => sum + bet.amount, 0)
      const payoutMultiplier = totalWinningAmount > 0 ? (payoutInfo.totalPayout / totalWinningAmount) : 0

      // Update winning bets
      for (const bet of winningBets) {
        bet.status = 'won'
        bet.payout = bet.amount * payoutMultiplier
        await bet.save()
      }

      // Update losing bets
      for (const bet of losingBets) {
        bet.status = 'lost'
        bet.payout = 0
        await bet.save()
      }

      // Mark payout as processed
      fixture.isPayoutProcessed = true
      await fixture.save()

      return {
        success: true,
        fixture: fixture.toJSON(),
        payoutInfo: {
          ...payoutInfo,
          winningBetsCount: winningBets.length,
          losingBetsCount: losingBets.length,
          payoutMultiplier
        }
      }
    } catch (error) {
      console.error('Error updating fixture result:', error)
      return { error: 'Failed to update fixture result' }
    }
  }

  /**
   * Get betting statistics
   * @returns {Object} Betting statistics
   */
  static async getBettingStats() {
    try {
      const totalBets = await Bet.countDocuments()
      const totalFixtures = await Fixture.countDocuments()
      const totalPoolValue = await Fixture.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: ['$pools.win.total', '$pools.draw.total', '$pools.lose.total']
              }
            }
          }
        }
      ])

      const averageBetAmount = totalBets > 0 ? totalPoolValue[0]?.total / totalBets : 0

      return {
        totalBets,
        totalFixtures,
        totalPoolValue: totalPoolValue[0]?.total || 0,
        averageBetAmount
      }
    } catch (error) {
      console.error('Error fetching betting stats:', error)
      return {
        totalBets: 0,
        totalFixtures: 0,
        totalPoolValue: 0,
        averageBetAmount: 0
      }
    }
  }
}
