import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { startCronJob } from './services/cronService.js'
import { connectDatabase } from './config/database.js'
import { logger } from './utils/logger.js'
import fixturesRouter from './routes/fixtures.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/fixtures', fixturesRouter)

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', service: 'BaseLeague Oracle Service' })
})

async function main() {
	try {
		logger.info('🚀 Starting BaseLeague Oracle Service...')

		// Connect to MongoDB
		await connectDatabase()
		logger.info('✅ Connected to MongoDB')

		// Start cron job
		startCronJob()
		logger.info('✅ Cron job started')

		// Start Express server
		app.listen(PORT, () => {
			logger.info(`🌐 API server running on port ${PORT}`)
			logger.info(`📡 Fixtures API: http://localhost:${PORT}/api/fixtures`)
			logger.info(`📡 Upcoming fixtures: http://localhost:${PORT}/api/fixtures/upcoming`)
		})

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

