import express from 'express'
import { signer, provider, setResultManually, checkResult } from '../services/blockchainService.js'

const router = express.Router()

/**
 * POST /api/set-result-manually - Manually set match result (fallback when Chainlink fails)
 * Requires: PRIVATE_KEY environment variable
 */
router.post('/set-result-manually', async (req, res) => {
	if (!signer) {
		return res.status(503).json({
			success: false,
			error: 'Blockchain connection not available. Set PRIVATE_KEY environment variable.',
		})
	}

	try {
		const { gameweek, matchId, homeScore, awayScore, status } = req.body

		// Validate inputs
		if (!gameweek || !matchId || homeScore === undefined || awayScore === undefined || !status) {
			return res.status(400).json({
				success: false,
				error: 'Missing required fields: gameweek, matchId, homeScore, awayScore, status',
			})
		}

		// Validate status length
		if (status.length === 0 || status.length > 10) {
			return res.status(400).json({
				success: false,
				error: 'Status must be between 1 and 10 characters',
			})
		}

		console.log(`📝 [Manual Result] Setting result for Gameweek ${gameweek}, Match ${matchId}`)
		console.log(`   Score: ${homeScore} - ${awayScore}, Status: ${status}`)

		const result = await setResultManually(gameweek, matchId, homeScore, awayScore, status)

		res.json({
			success: true,
			message: 'Result set successfully',
			...result,
		})
	} catch (error) {
		console.error('❌ Error setting result manually:', error)
		
		// Handle existing result error
		if (error.cause?.existing) {
			return res.status(400).json({
				success: false,
				error: error.message,
				existing: error.cause.existing,
			})
		}

		res.status(500).json({
			success: false,
			error: error.message || 'Failed to set result manually',
			details: error.reason || error.code,
		})
	}
})

/**
 * GET /api/check-result - Check if a match result exists
 */
router.get('/check-result', async (req, res) => {
	if (!provider) {
		return res.status(503).json({
			success: false,
			error: 'Blockchain connection not available',
		})
	}

	try {
		const { gameweek, matchId } = req.query

		if (!gameweek || !matchId) {
			return res.status(400).json({
				success: false,
				error: 'Missing required query parameters: gameweek, matchId',
			})
		}

		const result = await checkResult(Number(gameweek), Number(matchId))

		res.json({
			success: true,
			...result,
		})
	} catch (error) {
		console.error('❌ Error checking result:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to check result',
		})
	}
})

export default router

