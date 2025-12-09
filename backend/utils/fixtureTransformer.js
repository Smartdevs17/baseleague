/**
 * Transform FPL fixture to our API format
 * @param {Object} fplFixture - Raw fixture from FPL API
 * @param {number} currentGameweek - Current gameweek number
 * @param {Record<number, {name: string, shortName: string}>} teams - Teams mapping
 * @returns {Object} Transformed fixture
 */
export function transformFixture(fplFixture, currentGameweek, teams) {
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

/**
 * Filter fixtures by league
 * @param {Array} fixtures
 * @param {string} league
 * @returns {Array}
 */
export function filterByLeague(fixtures, league) {
	if (!league) return fixtures
	return fixtures.filter((f) => f.league?.toLowerCase().includes(league.toLowerCase()))
}

/**
 * Filter fixtures by search query
 * @param {Array} fixtures
 * @param {string} searchQuery
 * @returns {Array}
 */
export function filterBySearch(fixtures, searchQuery) {
	if (!searchQuery) return fixtures
	const searchLower = searchQuery.toLowerCase()
	return fixtures.filter(
		(f) =>
			f.homeTeam?.toLowerCase().includes(searchLower) ||
			f.awayTeam?.toLowerCase().includes(searchLower) ||
			f.league?.toLowerCase().includes(searchLower)
	)
}

/**
 * Filter upcoming fixtures
 * @param {Array} fplFixtures - Raw fixtures from FPL API
 * @returns {Array}
 */
export function filterUpcomingFixtures(fplFixtures) {
	const now = new Date()
	return fplFixtures.filter((fplFixture) => {
		// Only include fixtures that haven't finished
		if (fplFixture.finished) return false

		// Check if kickoff time is in the future
		if (fplFixture.kickoff_time) {
			const kickoff = new Date(fplFixture.kickoff_time)
			return kickoff > now
		}

		return false
	})
}

