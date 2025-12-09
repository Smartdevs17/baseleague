import express from 'express'
import { fetchAllFixtures, getTeams, getCurrentGameweek } from '../services/fplService.js'
import { transformFixture, filterByLeague, filterBySearch, filterUpcomingFixtures } from '../utils/fixtureTransformer.js'

const router = express.Router()

/**
 * GET /api/fixtures - Get all fixtures
 */
router.get('/', async (req, res) => {
	try {
		console.log('📡 Fetching all fixtures from FPL API (Premier League only)...')

		// Fetch fixtures and teams in parallel
		const [fplFixtures, teams] = await Promise.all([
			fetchAllFixtures(),
			getTeams(),
		])

		const currentGameweek = await getCurrentGameweek()

		// Transform fixtures with team names
		let fixtures = fplFixtures.map((fplFixture) =>
			transformFixture(fplFixture, currentGameweek, teams)
		)

		// Apply filters if provided
		const { league, search } = req.query
		fixtures = filterByLeague(fixtures, league)
		fixtures = filterBySearch(fixtures, search)

		console.log(`✅ Returning ${fixtures.length} fixtures (filtered from ${fplFixtures.length})`)

		res.json({
			success: true,
			fixtures,
		})
	} catch (error) {
		console.error('❌ Error fetching fixtures:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch fixtures',
		})
	}
})

/**
 * GET /api/fixtures/upcoming - Get only upcoming fixtures (alternative route)
 */
router.get('/upcoming', async (req, res) => {
	try {
		console.log('📡 Fetching upcoming fixtures from FPL API (Premier League only)...')

		// Fetch fixtures and teams in parallel
		const [fplFixtures, teams] = await Promise.all([
			fetchAllFixtures(),
			getTeams(),
		])

		const currentGameweek = await getCurrentGameweek()

		// Filter and transform upcoming fixtures
		let fixtures = filterUpcomingFixtures(fplFixtures)
			.map((fplFixture) => transformFixture(fplFixture, currentGameweek, teams))

		// Apply filters if provided
		const { league, search } = req.query
		fixtures = filterByLeague(fixtures, league)
		fixtures = filterBySearch(fixtures, search)

		console.log(`✅ Returning ${fixtures.length} upcoming fixtures`)

		res.json({
			success: true,
			fixtures,
		})
	} catch (error) {
		console.error('❌ Error fetching upcoming fixtures:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch upcoming fixtures',
		})
	}
})

export default router

