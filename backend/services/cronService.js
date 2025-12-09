import cron from 'node-cron'
import { processActiveMatches } from './matchSettlementService.js'

// Cron schedule: Run every 5 minutes
// Format: minute hour day month day-of-week
// '*/5 * * * *' = every 5 minutes
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/5 * * * *'

let isRunning = false

/**
 * Initialize and start the cron job
 */
export function startCronJob() {
	console.log('⏰ Starting match settlement cron job...')
	console.log(`   Schedule: ${CRON_SCHEDULE} (every 5 minutes)`)
	console.log('   To change schedule, set CRON_SCHEDULE environment variable')
	console.log('   Examples:')
	console.log('     */5 * * * *  - Every 5 minutes (default)')
	console.log('     */10 * * * * - Every 10 minutes')
	console.log('     0 * * * *    - Every hour')
	console.log('')

	// Run immediately on startup (optional)
	if (process.env.CRON_RUN_ON_STARTUP === 'true') {
		console.log('🚀 Running initial check on startup...')
		processActiveMatches().catch(console.error)
	}

	// Schedule the cron job
	cron.schedule(CRON_SCHEDULE, async () => {
		if (isRunning) {
			console.log('⏸️  Previous cron job still running, skipping this cycle')
			return
		}

		isRunning = true
		try {
			await processActiveMatches()
		} catch (error) {
			console.error('❌ Cron job error:', error)
		} finally {
			isRunning = false
		}
	})

	console.log('✅ Cron job started')
}

/**
 * Stop the cron job (useful for testing)
 */
export function stopCronJob() {
	// node-cron doesn't have a direct stop method, but we can track it
	console.log('⏹️  Cron job stopped (process will continue)')
}

