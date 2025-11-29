import express from 'express'
import { fetchAllFixtures, getCurrentGameweek, parseFixture } from '../services/fplService.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * GET /api/fixtures
 * Fetch all fixtures from FPL API with actual kickoff times
 */
router.get('/', async (req, res) => {
	try {
		logger.info('📡 API: Fetching fixtures...')
		
		// Fetch all fixtures from FPL API
		const fplFixtures = await fetchAllFixtures()
		
		// Get current gameweek
		const currentGameweek = await getCurrentGameweek()
		
		// Transform FPL fixtures to our API format
		const fixtures = fplFixtures.map((fplFixture) => {
			const parsed = parseFixture(fplFixture)
			
			// Determine status
			let status = 'pending'
			if (fplFixture.finished) {
				status = 'finished'
			} else if (fplFixture.started) {
				status = 'live'
			} else {
				status = 'pending'
			}
			
			return {
				id: fplFixture.id.toString(),
				externalId: fplFixture.id.toString(),
				homeTeam: parsed.homeTeam,
				awayTeam: parsed.awayTeam,
				homeTeamId: fplFixture.team_h?.toString() || '',
				awayTeamId: fplFixture.team_a?.toString() || '',
				kickoffTime: fplFixture.kickoff_time || new Date().toISOString(), // Actual match time from FPL API
				status,
				homeScore: parsed.homeScore,
				awayScore: parsed.awayScore,
				gameweek: parsed.gameweek || currentGameweek,
				pools: {
					win: { total: 0, betCount: 0 },
					draw: { total: 0, betCount: 0 },
					lose: { total: 0, betCount: 0 },
				},
				winningOutcome: null,
				isPayoutProcessed: false,
				totalPoolSize: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
		})
		
		logger.info(`✅ API: Returning ${fixtures.length} fixtures`)
		
		res.json({
			success: true,
			fixtures,
		})
	} catch (error) {
		logger.error('❌ API: Error fetching fixtures:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch fixtures',
		})
	}
})

/**
 * GET /api/fixtures/upcoming
 * Fetch only upcoming fixtures
 */
router.get('/upcoming', async (req, res) => {
	try {
		logger.info('📡 API: Fetching upcoming fixtures...')
		
		const fplFixtures = await fetchAllFixtures()
		const currentGameweek = await getCurrentGameweek()
		const now = new Date()
		
		// Filter and transform upcoming fixtures
		const fixtures = fplFixtures
			.filter((fplFixture) => {
				// Only include fixtures that haven't finished
				if (fplFixture.finished) return false
				
				// Check if kickoff time is in the future
				if (fplFixture.kickoff_time) {
					const kickoff = new Date(fplFixture.kickoff_time)
					return kickoff > now
				}
				
				return false
			})
			.map((fplFixture) => {
				const parsed = parseFixture(fplFixture)
				
				return {
					id: fplFixture.id.toString(),
					externalId: fplFixture.id.toString(),
					homeTeam: parsed.homeTeam,
					awayTeam: parsed.awayTeam,
					homeTeamId: fplFixture.team_h?.toString() || '',
					awayTeamId: fplFixture.team_a?.toString() || '',
					kickoffTime: fplFixture.kickoff_time, // Actual match time from FPL API
					status: 'pending',
					gameweek: parsed.gameweek || currentGameweek,
					pools: {
						win: { total: 0, betCount: 0 },
						draw: { total: 0, betCount: 0 },
						lose: { total: 0, betCount: 0 },
					},
					winningOutcome: null,
					isPayoutProcessed: false,
					totalPoolSize: 0,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}
			})
		
		logger.info(`✅ API: Returning ${fixtures.length} upcoming fixtures`)
		
		res.json({
			success: true,
			fixtures,
		})
	} catch (error) {
		logger.error('❌ API: Error fetching upcoming fixtures:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch upcoming fixtures',
		})
	}
})

export default router

