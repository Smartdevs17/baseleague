import { Router } from 'express'
import { BettingController } from '../controllers/bettingController.js'
import { AuthMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * GET /api/betting/fixtures
 * Get all available fixtures for betting
 */
router.get('/fixtures', BettingController.getFixtures)

/**
 * GET /api/betting/fixtures/:id
 * Get specific fixture with betting pools
 */
router.get('/fixtures/:id', BettingController.getFixture)

/**
 * POST /api/betting/bet
 * Place a new bet (requires authentication)
 */
router.post('/bet', AuthMiddleware.verifyWalletAuth, BettingController.createBet)

/**
 * GET /api/betting/my-bets
 * Get all bets for authenticated user
 */
router.get('/my-bets', AuthMiddleware.verifyWalletAuth, BettingController.getUserBets)

/**
 * GET /api/betting/user/:walletAddress/bets
 * Get all bets for a specific user by wallet address (public)
 */
router.get('/user/:walletAddress/bets', BettingController.getUserBetsByWallet)

/**
 * POST /api/betting/sync-fixtures
 * Sync fixtures from Premier League API
 */
router.post('/sync-fixtures', BettingController.syncFixtures)

/**
 * POST /api/betting/fixtures/:id/result
 * Update fixture result and process payouts
 */
router.post('/fixtures/:id/result', BettingController.updateFixtureResult)

/**
 * GET /api/betting/stats
 * Get betting statistics
 */
router.get('/stats', BettingController.getBettingStats)

export default router
