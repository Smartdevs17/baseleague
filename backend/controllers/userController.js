import User from '../models/User.js'
import { AuthMiddleware } from '../middleware/auth.js'

/**
 * User Controller
 * Handles user registration, profile management, and wallet connection
 */
export class UserController {
  /**
   * Get authentication challenge for wallet connection
   */
  static async getAuthChallenge(req, res) {
    try {
      const { walletAddress } = req.body

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' })
      }

      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' })
      }

      // Find or create user
      const user = await User.findOrCreateByWallet(walletAddress)
      
      // Generate nonce for authentication
      const nonce = user.generateNonce()
      await user.save()

      // Generate message for user to sign
      const message = AuthMiddleware.generateAuthMessage(walletAddress, nonce)

      res.json({
        success: true,
        message,
        nonce,
        user: user.getPublicProfile()
      })
    } catch (error) {
      console.error('Error getting auth challenge:', error.message)
      res.status(500).json({ error: 'Failed to generate authentication challenge' })
    }
  }

  /**
   * Verify wallet signature and authenticate user
   */
  static async verifySignature(req, res) {
    try {
      const { walletAddress, signature, message } = req.body

      if (!walletAddress || !signature || !message) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['walletAddress', 'signature', 'message']
        })
      }

      // Verify signature
      const isValidSignature = await AuthMiddleware.verifySignature(
        walletAddress,
        signature,
        message
      )

      if (!isValidSignature) {
        return res.status(401).json({ error: 'Invalid signature' })
      }

      // Get user and update last active
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      user.lastActive = new Date()
      await user.save()

      res.json({
        success: true,
        user: user.getPublicProfile(),
        token: 'wallet_authenticated' // In a real app, you might generate a JWT here
      })
    } catch (error) {
      console.error('Error verifying signature:', error.message)
      res.status(500).json({ error: 'Failed to verify signature' })
    }
  }

  /**
   * Get user profile (requires authentication)
   */
  static async getProfile(req, res) {
    try {
      const user = req.user

      res.json({
        success: true,
        user: user.getPublicProfile()
      })
    } catch (error) {
      console.error('Error getting profile:', error.message)
      res.status(500).json({ error: 'Failed to get user profile' })
    }
  }

  /**
   * Update user profile (requires authentication)
   */
  static async updateProfile(req, res) {
    try {
      const user = req.user
      const { username, displayName, avatar, preferences } = req.body

      // Update fields if provided
      if (username !== undefined) {
        // Check if username is already taken by another user
        const existingUser = await User.findOne({ 
          username, 
          _id: { $ne: user._id } 
        })
        
        if (existingUser) {
          return res.status(400).json({ error: 'Username already taken' })
        }
        
        user.username = username
      }

      if (displayName !== undefined) {
        user.displayName = displayName
      }

      if (avatar !== undefined) {
        user.avatar = avatar
      }

      if (preferences !== undefined) {
        user.preferences = { ...user.preferences, ...preferences }
      }

      await user.save()

      res.json({
        success: true,
        user: user.getPublicProfile()
      })
    } catch (error) {
      console.error('Error updating profile:', error.message)
      res.status(500).json({ error: 'Failed to update profile' })
    }
  }

  /**
   * Get user by wallet address (public endpoint)
   */
  static async getUserByWallet(req, res) {
    try {
      const user = req.user

      res.json({
        success: true,
        user: user.getPublicProfile()
      })
    } catch (error) {
      console.error('Error getting user by wallet:', error.message)
      res.status(500).json({ error: 'Failed to get user' })
    }
  }

  /**
   * Get user betting stats
   */
  static async getBettingStats(req, res) {
    try {
      const user = req.user

      res.json({
        success: true,
        stats: user.bettingStats
      })
    } catch (error) {
      console.error('Error getting betting stats:', error.message)
      res.status(500).json({ error: 'Failed to get betting stats' })
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(req, res) {
    try {
      const { limit = 50, sortBy = 'totalWinnings' } = req.query

      const validSortFields = ['totalWinnings', 'winRate', 'totalBets', 'totalWon']
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'totalWinnings'

      const users = await User.find({ isActive: true })
        .sort({ [`bettingStats.${sortField}`]: -1 })
        .limit(parseInt(limit))
        .select('username displayName avatar bettingStats lastActive')

      const leaderboard = users.map(user => ({
        rank: users.indexOf(user) + 1,
        ...user.getPublicProfile()
      }))

      res.json({
        success: true,
        leaderboard,
        sortBy: sortField,
        total: leaderboard.length
      })
    } catch (error) {
      console.error('Error getting leaderboard:', error.message)
      res.status(500).json({ error: 'Failed to get leaderboard' })
    }
  }

  /**
   * Search users
   */
  static async searchUsers(req, res) {
    try {
      const { query, limit = 20 } = req.query

      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' })
      }

      const users = await User.find({
        isActive: true,
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { displayName: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(parseInt(limit))
      .select('username displayName avatar bettingStats')

      const results = users.map(user => user.getPublicProfile())

      res.json({
        success: true,
        users: results,
        total: results.length
      })
    } catch (error) {
      console.error('Error searching users:', error.message)
      res.status(500).json({ error: 'Failed to search users' })
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateAccount(req, res) {
    try {
      const user = req.user

      user.isActive = false
      await user.save()

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      })
    } catch (error) {
      console.error('Error deactivating account:', error.message)
      res.status(500).json({ error: 'Failed to deactivate account' })
    }
  }
}
