import dotenv from 'dotenv'
import { startCronJob } from './services/cronService.js'
import { connectDatabase } from './config/database.js'
import { logger } from './utils/logger.js'

// Load environment variables
dotenv.config()

async function main() {
	try {
		logger.info('🚀 Starting SoccerLeague Oracle Service...')

		// Connect to MongoDB
		await connectDatabase()
		logger.info('✅ Connected to MongoDB')

		// Start cron job
		startCronJob()
		logger.info('✅ Cron job started')

		logger.info('🎯 Oracle service is running!')
		logger.info('📅 Checking for match results every 5 minutes...')

		// Keep the process alive
		process.on('SIGINT', () => {
			logger.info('👋 Shutting down gracefully...')
			process.exit(0)
		})

		process.on('SIGTERM', () => {
			logger.info('👋 Shutting down gracefully...')
			process.exit(0)
		})
	} catch (error) {
		logger.error('❌ Failed to start oracle service:', error)
		process.exit(1)
	}
}

main()

