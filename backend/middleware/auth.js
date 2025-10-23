import { ethers } from 'ethers'
import User from '../models/User.js'

/**
 * Authentication middleware for wallet-based authentication
 * Verifies wallet signatures to authenticate users
 */
export class AuthMiddleware {
  /**
   * Verify wallet signature and authenticate user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async verifyWalletAuth(req, res, next) {
    try {
      console.log('🔍 All headers received:', req.headers)
      console.log('🔍 Header keys:', Object.keys(req.headers))
      
      // Handle both camelCase and lowercase header names
      let walletAddress = req.headers.walletAddress || req.headers.walletaddress
      const signature = req.headers.signature
      let message = req.headers.message
      
      // Clean up walletAddress if it has duplicates or commas
      if (walletAddress && walletAddress.includes(',')) {
        walletAddress = walletAddress.split(',')[0].trim()
      }
      
      // Handle message format - convert literal \n to actual newlines
      if (message && message.includes('\\n')) {
        message = message.replace(/\\n/g, '\n')
      }
      
      console.log('🔍 Processed values:')
      console.log('walletAddress:', walletAddress)
      console.log('signature:', signature)
      console.log('message (raw):', JSON.stringify(message))
      console.log('message (displayed):', message) 

      if (!walletAddress || !signature || !message) {
        return res.status(401).json({ 
          error: 'Missing authentication headers',
          required: ['walletAddress', 'signature', 'message']
        })
      }

      // Verify signature
      console.log('🔐 Verifying signature with:')
      console.log('  walletAddress:', walletAddress)
      console.log('  signature:', signature)
      console.log('  message:', message)
      
      const isValidSignature = await AuthMiddleware.verifySignature(
        walletAddress,
        signature,
        message
      )
      
      console.log('🔐 Signature verification result:', isValidSignature)

      if (!isValidSignature) {
        return res.status(401).json({ error: 'Invalid signature' })
      }

      // Find or create user
      const user = await User.findOrCreateByWallet(walletAddress)
      
      // Update last active
      user.lastActive = new Date()
      await user.save()

      // Attach user to request
      req.user = user
      req.walletAddress = walletAddress.toLowerCase()

      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(500).json({ error: 'Authentication failed' })
    }
  }

  /**
   * Verify Ethereum signature
   * @param {string} walletAddress - Wallet address
   * @param {string} signature - Signature hex string
   * @param {string} message - Original message
   * @returns {boolean} - Whether signature is valid
   */
  static async verifySignature(walletAddress, signature, message) {
    try {
      console.log('🔍 Inside verifySignature:')
      console.log('  walletAddress:', walletAddress)
      console.log('  signature:', signature)
      console.log('  message:', message)
      
      // Recover address from signature
      const recoveredAddress = ethers.verifyMessage(message, signature)
      console.log('  recoveredAddress:', recoveredAddress)
      
      // Compare addresses (case insensitive)
      const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase()
      console.log('  addresses match:', isValid)
      console.log('  original:', walletAddress.toLowerCase())
      console.log('  recovered:', recoveredAddress.toLowerCase())
      
      return isValid
    } catch (error) {
      console.error('Signature verification error:', error)
      return false
    }
  }

  /**
   * Generate authentication message for user to sign
   * @param {string} walletAddress - Wallet address
   * @param {string} nonce - Nonce for uniqueness
   * @returns {string} - Message to be signed
   */
  static generateAuthMessage(walletAddress, nonce) {
    return `BaseLeague Authentication\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`
  }

  /**
   * Optional authentication - doesn't fail if no auth provided
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async optionalAuth(req, res, next) {
    try {
      const { walletAddress, signature, message } = req.headers

      if (walletAddress && signature && message) {
        const isValidSignature = await AuthMiddleware.verifySignature(
          walletAddress,
          signature,
          message
        )

        if (isValidSignature) {
          const user = await User.findOrCreateByWallet(walletAddress)
          req.user = user
          req.walletAddress = walletAddress.toLowerCase()
        }
      }

      next()
    } catch (error) {
      console.error('Optional auth error:', error)
      next() // Continue even if auth fails
    }
  }

  /**
   * Get user from wallet address without signature verification
   * Used for public endpoints that need user info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async getUserByWallet(req, res, next) {
    try {
      const { walletAddress } = req.params

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' })
      }

      const user = await User.findOne({ 
        walletAddress: walletAddress.toLowerCase() 
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('Get user by wallet error:', error)
      res.status(500).json({ error: 'Failed to get user' })
    }
  }
}

export default AuthMiddleware
