import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3002
const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api'

// Note: FPL API only supports Premier League fixtures
// For multiple leagues, you would need Football Data API or similar

// Export for Vercel serverless
// For Vercel, we need to export the app directly
// The vercel.json routes will handle routing to this file
export default app

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Cache for teams and gameweek data
let teamsCache = null
let gameweekCache = null

// Helper function to get teams mapping
async function getTeams() {
	if (teamsCache) {
		console.log(`📋 Using cached teams (${Object.keys(teamsCache).length} teams)`)
		return teamsCache
	}

	try {
		console.log('📡 Fetching teams from FPL API...')
		const response = await fetch(`${FPL_API_BASE_URL}/bootstrap-static/`)
		if (response.ok) {
			const data = await response.json()
			// Map team ID to team name
			const teams = {}
			if (data.teams && Array.isArray(data.teams)) {
				data.teams.forEach((team) => {
					teams[team.id] = {
						name: team.name,
						shortName: team.short_name,
					}
				})
				console.log(`✅ Loaded ${data.teams.length} teams: ${data.teams.slice(0, 3).map(t => t.name).join(', ')}...`)
			}
			teamsCache = teams
			return teams
		}
	} catch (error) {
		console.error('❌ Could not fetch teams:', error.message)
	}
	return {}
}

// Helper function to get current gameweek
async function getCurrentGameweek() {
	if (gameweekCache) return gameweekCache

	try {
		const response = await fetch(`${FPL_API_BASE_URL}/bootstrap-static/`)
		if (response.ok) {
			const data = await response.json()
			const currentEvent = data.events?.find((e) => e.is_current)
			if (currentEvent) {
				gameweekCache = currentEvent.id
				return currentEvent.id
			}
		}
	} catch (error) {
		console.warn('Could not fetch current gameweek:', error.message)
	}
	return 1
}

// Transform FPL fixture to our format
function transformFixture(fplFixture, currentGameweek, teams) {
	let status = 'pending'
	if (fplFixture.finished) {
		status = 'finished'
	} else if (fplFixture.started) {
		status = 'live'
	} else {
		status = 'pending'
	}

	// Get team names from teams mapping
	// team_h and team_a are numbers in FPL API
	const homeTeamIdNum = fplFixture.team_h
	const awayTeamIdNum = fplFixture.team_a
	const homeTeamId = homeTeamIdNum?.toString() || ''
	const awayTeamId = awayTeamIdNum?.toString() || ''
	
	// Look up team names - teams object uses numeric keys
	const homeTeamData = teams[homeTeamIdNum]
	const awayTeamData = teams[awayTeamIdNum]
	
	const homeTeam = homeTeamData?.name || fplFixture.team_h_name || `Team ${homeTeamId}`
	const awayTeam = awayTeamData?.name || fplFixture.team_a_name || `Team ${awayTeamId}`
	
	// Debug log if team name not found (only log first few to avoid spam)
	if (!homeTeamData?.name && homeTeamIdNum && Object.keys(teams).length > 0) {
		console.warn(`⚠️ Team name not found for home team ID: ${homeTeamIdNum}, available teams: ${Object.keys(teams).slice(0, 5).join(', ')}`)
	}
	if (!awayTeamData?.name && awayTeamIdNum && Object.keys(teams).length > 0) {
		console.warn(`⚠️ Team name not found for away team ID: ${awayTeamIdNum}, available teams: ${Object.keys(teams).slice(0, 5).join(', ')}`)
	}

	return {
		id: fplFixture.id.toString(),
		externalId: fplFixture.id.toString(),
		homeTeam,
		awayTeam,
		homeTeamId,
		awayTeamId,
		kickoffTime: fplFixture.kickoff_time || new Date().toISOString(),
		status,
		homeScore: fplFixture.team_h_score,
		awayScore: fplFixture.team_a_score,
		gameweek: fplFixture.event || currentGameweek,
		league: 'Premier League', // FPL API is only for Premier League
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
}

// GET /api/fixtures - Get all fixtures
app.get('/api/fixtures', async (req, res) => {
	try {
		console.log('📡 Fetching all fixtures from FPL API (Premier League only)...')

		// Fetch fixtures and teams in parallel
		const [fixturesResponse, teams] = await Promise.all([
			fetch(`${FPL_API_BASE_URL}/fixtures/`, {
				headers: {
					'User-Agent': 'BaseLeague/1.0',
					'Accept': 'application/json',
				},
			}),
			getTeams(),
		])

		if (!fixturesResponse.ok) {
			throw new Error(`FPL API error: ${fixturesResponse.status}`)
		}

		const fplFixtures = await fixturesResponse.json()

		if (!Array.isArray(fplFixtures)) {
			throw new Error('Invalid response format from FPL API')
		}

		const currentGameweek = await getCurrentGameweek()

		// Transform fixtures with team names
		const fixtures = fplFixtures.map((fplFixture) =>
			transformFixture(fplFixture, currentGameweek, teams)
		)

		// Apply filters if provided
		let filteredFixtures = fixtures
		const { league, search } = req.query

		if (league) {
			filteredFixtures = filteredFixtures.filter((f) =>
				f.league?.toLowerCase().includes(league.toLowerCase())
			)
		}

		if (search) {
			const searchLower = search.toLowerCase()
			filteredFixtures = filteredFixtures.filter(
				(f) =>
					f.homeTeam?.toLowerCase().includes(searchLower) ||
					f.awayTeam?.toLowerCase().includes(searchLower) ||
					f.league?.toLowerCase().includes(searchLower)
			)
		}

		console.log(`✅ Returning ${filteredFixtures.length} fixtures (filtered from ${fixtures.length})`)

		res.json({
			success: true,
			fixtures: filteredFixtures,
		})
	} catch (error) {
		console.error('❌ Error fetching fixtures:', error)
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch fixtures',
		})
	}
})

// GET /api/fixtures-upcoming - Get only upcoming fixtures
app.get('/api/fixtures-upcoming', async (req, res) => {
	try {
		console.log('📡 Fetching upcoming fixtures from FPL API (Premier League only)...')

		// Fetch fixtures and teams in parallel
		const [fixturesResponse, teams] = await Promise.all([
			fetch(`${FPL_API_BASE_URL}/fixtures/`, {
				headers: {
					'User-Agent': 'BaseLeague/1.0',
					'Accept': 'application/json',
				},
			}),
			getTeams(),
		])

		if (!fixturesResponse.ok) {
			throw new Error(`FPL API error: ${fixturesResponse.status}`)
		}

		const fplFixtures = await fixturesResponse.json()

		if (!Array.isArray(fplFixtures)) {
			throw new Error('Invalid response format from FPL API')
		}

		const currentGameweek = await getCurrentGameweek()
		const now = new Date()

		// Filter and transform upcoming fixtures
		let fixtures = fplFixtures
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
			.map((fplFixture) => transformFixture(fplFixture, currentGameweek, teams))

		// Apply filters if provided
		const { league, search } = req.query

		if (league) {
			fixtures = fixtures.filter((f) =>
				f.league?.toLowerCase().includes(league.toLowerCase())
			)
		}

		if (search) {
			const searchLower = search.toLowerCase()
			fixtures = fixtures.filter(
				(f) =>
					f.homeTeam?.toLowerCase().includes(searchLower) ||
					f.awayTeam?.toLowerCase().includes(searchLower) ||
					f.league?.toLowerCase().includes(searchLower)
			)
		}

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

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', service: 'BaseLeague API Server' })
})

// Start server (only if not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
	app.listen(PORT, () => {
		console.log(`🚀 BaseLeague API Server running on http://localhost:${PORT}`)
		console.log(`📡 Fixtures API: http://localhost:${PORT}/api/fixtures`)
		console.log(`📡 Upcoming fixtures: http://localhost:${PORT}/api/fixtures-upcoming`)
	})
}

