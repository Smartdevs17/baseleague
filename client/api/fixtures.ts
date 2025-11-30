import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
	request: VercelRequest,
	response: VercelResponse
) {
	// Enable CORS
	response.setHeader('Access-Control-Allow-Credentials', 'true')
	response.setHeader('Access-Control-Allow-Origin', '*')
	response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
	response.setHeader(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	)

	// Handle preflight requests
	if (request.method === 'OPTIONS') {
		response.status(200).end()
		return
	}

	try {
		const fplApiUrl = 'https://fantasy.premierleague.com/api/fixtures/'
		
		const fplResponse = await fetch(fplApiUrl, {
			method: 'GET',
			headers: {
				'User-Agent': 'BaseLeague/1.0',
				'Accept': 'application/json',
			},
		})

		if (!fplResponse.ok) {
			throw new Error(`FPL API error: ${fplResponse.status}`)
		}

		const fplData = await fplResponse.json()

		// Get current gameweek
		let currentGameweek = 1
		try {
			const bootstrapResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
			if (bootstrapResponse.ok) {
				const bootstrap = await bootstrapResponse.json()
				const currentEvent = bootstrap.events?.find((e: any) => e.is_current)
				if (currentEvent) {
					currentGameweek = currentEvent.id
				}
			}
		} catch (e) {
			console.warn('Could not fetch current gameweek:', e)
		}

		// Transform FPL fixtures to our API format
		const fixtures = Array.isArray(fplData) ? fplData.map((fplFixture: any) => {
			let status: 'pending' | 'live' | 'finished' | 'cancelled' = 'pending'
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
		}) : []

		response.status(200).json({
			success: true,
			fixtures,
		})
	} catch (error) {
		console.error('Error fetching fixtures:', error)
		response.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch fixtures',
		})
	}
}

