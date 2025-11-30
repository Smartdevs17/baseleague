import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3002
const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api'

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Helper function to get current gameweek
async function getCurrentGameweek() {
	try {
		const response = await fetch(`${FPL_API_BASE_URL}/bootstrap-static/`)
		if (response.ok) {
			const data = await response.json()
			const currentEvent = data.events?.find((e) => e.is_current)
			if (currentEvent) {
				return currentEvent.id
			}
		}
	} catch (error) {
		console.warn('Could not fetch current gameweek:', error.message)
	}
	return 1
}

// Transform FPL fixture to our format
function transformFixture(fplFixture, currentGameweek) {
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
		homeTeam: fplFixture.team_h_name || `Team ${fplFixture.team_h}`,
		awayTeam: fplFixture.team_a_name || `Team ${fplFixture.team_a}`,
		homeTeamId: fplFixture.team_h?.toString() || '',
		awayTeamId: fplFixture.team_a?.toString() || '',
		kickoffTime: fplFixture.kickoff_time || new Date().toISOString(),
		status,
		homeScore: fplFixture.team_h_score,
		awayScore: fplFixture.team_a_score,
		gameweek: fplFixture.event || currentGameweek,
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
		console.log('📡 Fetching all fixtures from FPL API...')

		const response = await fetch(`${FPL_API_BASE_URL}/fixtures/`, {
			headers: {
				'User-Agent': 'BaseLeague/1.0',
				'Accept': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(`FPL API error: ${response.status}`)
		}

		const fplFixtures = await response.json()

		if (!Array.isArray(fplFixtures)) {
			throw new Error('Invalid response format from FPL API')
		}

		const currentGameweek = await getCurrentGameweek()

		// Transform fixtures
		const fixtures = fplFixtures.map((fplFixture) =>
			transformFixture(fplFixture, currentGameweek)
		)

		console.log(`✅ Returning ${fixtures.length} fixtures`)

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

// GET /api/fixtures-upcoming - Get only upcoming fixtures
app.get('/api/fixtures-upcoming', async (req, res) => {
	try {
		console.log('📡 Fetching upcoming fixtures from FPL API...')

		const response = await fetch(`${FPL_API_BASE_URL}/fixtures/`, {
			headers: {
				'User-Agent': 'BaseLeague/1.0',
				'Accept': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(`FPL API error: ${response.status}`)
		}

		const fplFixtures = await response.json()

		if (!Array.isArray(fplFixtures)) {
			throw new Error('Invalid response format from FPL API')
		}

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
			.map((fplFixture) => transformFixture(fplFixture, currentGameweek))

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

// Start server
app.listen(PORT, () => {
	console.log(`🚀 BaseLeague API Server running on http://localhost:${PORT}`)
	console.log(`📡 Fixtures API: http://localhost:${PORT}/api/fixtures`)
	console.log(`📡 Upcoming fixtures: http://localhost:${PORT}/api/fixtures-upcoming`)
})

