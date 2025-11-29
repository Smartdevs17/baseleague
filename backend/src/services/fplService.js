import axios from 'axios'
import { logger } from '../utils/logger.js'

const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api'

export async function fetchGameweekFixtures(gameweek) {
	try {
		const url = `${FPL_API_BASE_URL}/fixtures/?event=${gameweek}`
		logger.info(`Fetching fixtures for gameweek ${gameweek}...`)

		const response = await axios.get(url, {
			timeout: 10000,
			headers: { 'User-Agent': 'SoccerLeague-Oracle/1.0' },
		})

		if (!response.data || !Array.isArray(response.data)) {
			throw new Error('Invalid response from FPL API')
		}

		logger.info(`Fetched ${response.data.length} fixtures for gameweek ${gameweek}`)
		return response.data
	} catch (error) {
		logger.error(`Error fetching gameweek ${gameweek} fixtures:`, error.message)
		throw error
	}
}

export async function fetchAllFixtures() {
	try {
		const url = `${FPL_API_BASE_URL}/fixtures/`
		logger.info('Fetching all fixtures...')

		const response = await axios.get(url, {
			timeout: 10000,
			headers: { 'User-Agent': 'SoccerLeague-Oracle/1.0' },
		})

		if (!response.data || !Array.isArray(response.data)) {
			throw new Error('Invalid response from FPL API')
		}

		logger.info(`Fetched ${response.data.length} total fixtures`)
		return response.data
	} catch (error) {
		logger.error('Error fetching all fixtures:', error.message)
		throw error
	}
}

export async function getCurrentGameweek() {
	try {
		const url = `${FPL_API_BASE_URL}/bootstrap-static/`
		logger.info('Fetching current gameweek...')

		const response = await axios.get(url, {
			timeout: 10000,
			headers: { 'User-Agent': 'SoccerLeague-Oracle/1.0' },
		})

		if (!response.data || !response.data.events) {
			throw new Error('Invalid response from FPL API')
		}

		const currentEvent = response.data.events.find((event) => event.is_current)

		if (!currentEvent) {
			const finishedEvents = response.data.events.filter((event) => event.finished)
			if (finishedEvents.length > 0) {
				const latestFinished = finishedEvents.sort((a, b) => b.id - a.id)[0]
				logger.info(`No current gameweek, using latest finished: ${latestFinished.id}`)
				return latestFinished.id
			}
			throw new Error('No current or finished gameweek found')
		}

		logger.info(`Current gameweek: ${currentEvent.id}`)
		return currentEvent.id
	} catch (error) {
		logger.error('Error fetching current gameweek:', error.message)
		throw error
	}
}

export function parseFixture(fixture) {
	return {
		gameweek: fixture.event,
		matchId: fixture.id,
		homeTeam: fixture.team_h_name || `Team ${fixture.team_h}`,
		awayTeam: fixture.team_a_name || `Team ${fixture.team_a}`,
		homeScore: fixture.team_h_score,
		awayScore: fixture.team_a_score,
		status: fixture.finished ? 'FT' : fixture.started ? 'LIVE' : 'NS',
		finished: fixture.finished || false,
		kickoffTime: fixture.kickoff_time,
	}
}
