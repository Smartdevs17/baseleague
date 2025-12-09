import express from 'express'
import { processActiveMatches } from '../services/matchSettlementService.js'

const router = express.Router()

/**
 * POST /api/cron/process-matches - Manually trigger match settlement process
 * Useful for testing or manual execution
 */
router.post('/process-matches', async (req, res) => {
	try {
		console.log('🔧 Manual trigger: Processing active matches...')
		const results = await processActiveMatches()
		
		res.json({
			success: true,
			message: 'Match processing completed',
			...results,
		})
	} catch (error) {
		console.error('❌ Error in manual match processing:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to process matches',
		})
	}
})

/**
 * GET /api/cron/status - Get cron job status and configuration
 */
router.get('/status', (req, res) => {
	res.json({
		success: true,
		cron: {
			enabled: !!process.env.PRIVATE_KEY,
			schedule: process.env.CRON_SCHEDULE || '*/5 * * * *',
			description: 'Runs every 5 minutes by default',
			runOnStartup: process.env.CRON_RUN_ON_STARTUP === 'true',
		},
		blockchain: {
			connected: !!process.env.PRIVATE_KEY,
			resultsConsumer: process.env.RESULTS_CONSUMER_ADDRESS || '0x5D8F251D046819757054673CA6bB143f36B389FF',
			predictionContract: process.env.PREDICTION_CONTRACT_ADDRESS || '0x3bf17469296eE3dADE758cD2F82F76f76EF14d40',
		},
	})
})

export default router

