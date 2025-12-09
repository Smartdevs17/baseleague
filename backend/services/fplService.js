import { config } from '../config/index.js'

// Cache for teams and gameweek data
let teamsCache = null
let gameweekCache = null

/**
 * Get teams mapping from FPL API
 * @returns {Promise<Record<number, {name: string, shortName: string}>>}
 */
export async function getTeams() {
	if (teamsCache) {
		console.log(`📋 Using cached teams (${Object.keys(teamsCache).length} teams)`)
		return teamsCache
	}

	try {
		console.log('📡 Fetching teams from FPL API...')
		const response = await fetch(`${config.fpl.baseUrl}/bootstrap-static/`)
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

/**
 * Get current gameweek from FPL API
 * @returns {Promise<number>}
 */
export async function getCurrentGameweek() {
	if (gameweekCache) return gameweekCache

	try {
		const response = await fetch(`${config.fpl.baseUrl}/bootstrap-static/`)
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

/**
 * Fetch all fixtures from FPL API
 * @returns {Promise<Array>}
 */
export async function fetchAllFixtures() {
	const response = await fetch(`${config.fpl.baseUrl}/fixtures/`, {
		headers: {
			'User-Agent': 'BaseLeague/1.0',
			'Accept': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Error(`FPL API error: ${response.status}`)
	}

	const fixtures = await response.json()

	if (!Array.isArray(fixtures)) {
		throw new Error('Invalid response format from FPL API')
	}

	return fixtures
}

/**
 * Clear cache (useful for testing or forced refresh)
 */
export function clearCache() {
	teamsCache = null
	gameweekCache = null
}

