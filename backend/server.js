import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3002
const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api'

// Football Data API (for multiple leagues - requires free API key)
const FOOTBALL_DATA_API_BASE_URL = 'https://api.football-data.org/v4'
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY || ''

// API Sports (alternative - requires API key)
const API_SPORTS_BASE_URL = 'https://v3.football.api-sports.io'
const API_SPORTS_KEY = process.env.API_SPORTS_KEY || ''

// Export for Vercel serverless
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

// Transform Football Data API fixture to our format
function transformFootballDataFixture(fdFixture) {
	let status = 'pending'
	if (fdFixture.status === 'FINISHED') {
		status = 'finished'
	} else if (fdFixture.status === 'IN_PLAY' || fdFixture.status === 'PAUSED') {
		status = 'live'
	} else {
		status = 'pending'
	}

	const homeTeam = fdFixture.homeTeam?.name || 'Unknown'
	const awayTeam = fdFixture.awayTeam?.name || 'Unknown'
	const homeTeamId = fdFixture.homeTeam?.id?.toString() || ''
	const awayTeamId = fdFixture.awayTeam?.id?.toString() || ''

	// Extract league and country from competition
	const competition = fdFixture.competition || {}
	const league = competition.name || 'Unknown League'
	const country = competition.area?.name || 'Unknown Country'

	return {
		id: fdFixture.id.toString(),
		externalId: fdFixture.id.toString(),
		homeTeam,
		awayTeam,
		homeTeamId,
		awayTeamId,
		kickoffTime: fdFixture.utcDate || new Date().toISOString(),
		status,
		homeScore: fdFixture.score?.fullTime?.home ?? fdFixture.score?.halfTime?.home,
		awayScore: fdFixture.score?.fullTime?.away ?? fdFixture.score?.halfTime?.away,
		gameweek: 1, // Football Data API doesn't have gameweeks
		league,
		country,
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
		country: 'England',
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
		// Try Football Data API first if key is available (supports multiple leagues)
		if (FOOTBALL_DATA_API_KEY) {
			console.log('📡 Fetching fixtures from Football Data API (multiple leagues)...')
			
			try {
				// Get fixtures from multiple competitions
				const competitions = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'DED'] // Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie
				const allFixtures = []
				
				for (const comp of competitions) {
					try {
						const response = await fetch(`${FOOTBALL_DATA_API_BASE_URL}/competitions/${comp}/matches`, {
							headers: {
								'X-Auth-Token': FOOTBALL_DATA_API_KEY,
								'Accept': 'application/json',
							},
						})
						
						if (response.ok) {
							const data = await response.json()
							if (data.matches && Array.isArray(data.matches)) {
								const transformed = data.matches.map(transformFootballDataFixture)
								allFixtures.push(...transformed)
							}
						}
					} catch (err) {
						console.warn(`Could not fetch ${comp}:`, err.message)
					}
				}
				
				if (allFixtures.length > 0) {
					console.log(`✅ Fetched ${allFixtures.length} fixtures from Football Data API`)
					
					// Apply filters
					let filteredFixtures = allFixtures
					const { league, country, search } = req.query
					
					if (league && league !== 'all') {
						filteredFixtures = filteredFixtures.filter((f) =>
							f.league?.toLowerCase().includes(league.toLowerCase())
						)
					}
					
					if (country && country !== 'all') {
						filteredFixtures = filteredFixtures.filter((f) =>
							f.country?.toLowerCase().includes(country.toLowerCase())
						)
					}
					
					if (search) {
						const searchLower = search.toLowerCase()
						filteredFixtures = filteredFixtures.filter(
							(f) =>
								f.homeTeam?.toLowerCase().includes(searchLower) ||
								f.awayTeam?.toLowerCase().includes(searchLower) ||
								f.league?.toLowerCase().includes(searchLower) ||
								f.country?.toLowerCase().includes(searchLower)
						)
					}
					
					return res.json({
						success: true,
						fixtures: filteredFixtures,
					})
				}
			} catch (err) {
				console.warn('Football Data API failed, falling back to FPL API:', err.message)
			}
		}
		
		// Fallback to FPL API (Premier League only)
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
		const { league, country, search } = req.query

		if (league) {
			filteredFixtures = filteredFixtures.filter((f) =>
				f.league?.toLowerCase().includes(league.toLowerCase())
			)
		}

		if (country) {
			filteredFixtures = filteredFixtures.filter((f) =>
				f.country?.toLowerCase().includes(country.toLowerCase())
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
		// Try Football Data API first if key is available
		if (FOOTBALL_DATA_API_KEY) {
			console.log('📡 Fetching upcoming fixtures from Football Data API...')
			
			try {
				const competitions = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'DED']
				const allFixtures = []
				const now = new Date()
				
				for (const comp of competitions) {
					try {
						const response = await fetch(`${FOOTBALL_DATA_API_BASE_URL}/competitions/${comp}/matches?status=SCHEDULED`, {
							headers: {
								'X-Auth-Token': FOOTBALL_DATA_API_KEY,
								'Accept': 'application/json',
							},
						})
						
						if (response.ok) {
							const data = await response.json()
							if (data.matches && Array.isArray(data.matches)) {
								// Filter upcoming matches
								const upcoming = data.matches
									.filter((match) => {
										if (!match.utcDate) return false
										const kickoff = new Date(match.utcDate)
										return kickoff > now
									})
									.map(transformFootballDataFixture)
								allFixtures.push(...upcoming)
							}
						}
					} catch (err) {
						console.warn(`Could not fetch ${comp}:`, err.message)
					}
				}
				
				if (allFixtures.length > 0) {
					console.log(`✅ Fetched ${allFixtures.length} upcoming fixtures from Football Data API`)
					
					// Apply filters
					let filteredFixtures = allFixtures
					const { league, country, search } = req.query
					
					if (league && league !== 'all') {
						filteredFixtures = filteredFixtures.filter((f) =>
							f.league?.toLowerCase().includes(league.toLowerCase())
						)
					}
					
					if (country && country !== 'all') {
						filteredFixtures = filteredFixtures.filter((f) =>
							f.country?.toLowerCase().includes(country.toLowerCase())
						)
					}
					
					if (search) {
						const searchLower = search.toLowerCase()
						filteredFixtures = filteredFixtures.filter(
							(f) =>
								f.homeTeam?.toLowerCase().includes(searchLower) ||
								f.awayTeam?.toLowerCase().includes(searchLower) ||
								f.league?.toLowerCase().includes(searchLower) ||
								f.country?.toLowerCase().includes(searchLower)
						)
					}
					
					return res.json({
						success: true,
						fixtures: filteredFixtures,
					})
				}
			} catch (err) {
				console.warn('Football Data API failed, falling back to FPL API:', err.message)
			}
		}
		
		// Fallback to FPL API
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
		const { league, country, search } = req.query

		if (league) {
			fixtures = fixtures.filter((f) =>
				f.league?.toLowerCase().includes(league.toLowerCase())
			)
		}

		if (country) {
			fixtures = fixtures.filter((f) =>
				f.country?.toLowerCase().includes(country.toLowerCase())
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

