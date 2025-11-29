import cron from 'node-cron'
import { runOracleJob } from './oracleService.js'
import { logger } from '../utils/logger.js'

/**
 * Start the cron job to run oracle service periodically
 */
export function startCronJob() {
	// Run every 5 minutes
	// Format: minute hour day month day-of-week
	const cronExpression = process.env.CRON_SCHEDULE || '*/5 * * * *'

	logger.info(`⏰ Cron job scheduled: ${cronExpression}`)

	cron.schedule(cronExpression, async () => {
		logger.info('⏰ Cron job triggered')
		try {
			await runOracleJob()
		} catch (error) {
			logger.error('❌ Cron job error:', error.message)
		}
	})

	// Run immediately on startup (optional)
	if (process.env.RUN_ON_STARTUP === 'true') {
		logger.info('🚀 Running oracle job on startup...')
		setTimeout(async () => {
			try {
				await runOracleJob()
			} catch (error) {
				logger.error('❌ Startup job error:', error.message)
			}
		}, 5000) // Wait 5 seconds for everything to initialize
	}
}

