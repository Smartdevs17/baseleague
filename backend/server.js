import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import fixturesRouter from './routes/fixtures.js'
import { getUpcomingFixtures } from './routes/fixturesUpcoming.js'
import blockchainRouter from './routes/blockchain.js'
import cronRouter from './routes/cron.js'
import healthRouter from './routes/health.js'
import { startCronJob } from './services/cronService.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/fixtures', fixturesRouter)
app.get('/api/fixtures-upcoming', getUpcomingFixtures) // Backward compatibility route
app.use('/api', blockchainRouter)
app.use('/api/cron', cronRouter)
app.use('/health', healthRouter)

// Export for Vercel serverless
export default app

// Start server (only if not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
	const PORT = config.server.port
	app.listen(PORT, () => {
		console.log(`🚀 BaseLeague API Server running on http://localhost:${PORT}`)
		console.log(`📡 Fixtures API: http://localhost:${PORT}/api/fixtures`)
		console.log(`📡 Upcoming fixtures: http://localhost:${PORT}/api/fixtures-upcoming`)
		console.log(`📡 Manual result setting: http://localhost:${PORT}/api/set-result-manually`)
		console.log(`📡 Check result: http://localhost:${PORT}/api/check-result`)
		console.log(`⏰ Cron job status: http://localhost:${PORT}/api/cron/status`)
		console.log(`🔧 Manual trigger: POST http://localhost:${PORT}/api/cron/process-matches`)
		console.log(`💚 Health check: http://localhost:${PORT}/health`)
		console.log('')
		
		// Start cron job for automatic match settlement
		// Only start if PRIVATE_KEY is set (needed for transactions)
		if (config.blockchain.privateKey) {
			startCronJob()
		} else {
			console.log('⚠️  Cron job disabled: PRIVATE_KEY not set')
			console.log('   Set PRIVATE_KEY in .env to enable automatic match settlement')
		}
	})
}
