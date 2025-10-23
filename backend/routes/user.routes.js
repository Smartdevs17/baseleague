import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import { AuthMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * POST /api/users/auth-challenge
 * Get authentication challenge for wallet connection
 */
router.post('/auth-challenge', UserController.getAuthChallenge)

/**
 * POST /api/users/verify-signature
 * Verify wallet signature and authenticate user
 */
router.post('/verify-signature', UserController.verifySignature)

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
router.get('/profile', AuthMiddleware.verifyWalletAuth, UserController.getProfile)

/**
 * PUT /api/users/profile
 * Update authenticated user's profile
 */
router.put('/profile', AuthMiddleware.verifyWalletAuth, UserController.updateProfile)

/**
 * GET /api/users/wallet/:walletAddress
 * Get user profile by wallet address (public)
 */
router.get('/wallet/:walletAddress', AuthMiddleware.getUserByWallet, UserController.getUserByWallet)

/**
 * GET /api/users/betting-stats
 * Get authenticated user's betting statistics
 */
router.get('/betting-stats', AuthMiddleware.verifyWalletAuth, UserController.getBettingStats)

/**
 * GET /api/users/leaderboard
 * Get leaderboard of top users
 */
router.get('/leaderboard', UserController.getLeaderboard)

/**
 * GET /api/users/search
 * Search users by username or display name
 */
router.get('/search', UserController.searchUsers)

/**
 * DELETE /api/users/account
 * Deactivate user account
 */
router.delete('/account', AuthMiddleware.verifyWalletAuth, UserController.deactivateAccount)

export default router
