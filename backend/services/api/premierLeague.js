import axios from 'axios'

const PREMIER_LEAGUE_BASE_URL = 'https://fantasy.premierleague.com/api'

/**
 * Fetch all players from Premier League API
 */
export const fetchPlayers = async () => {
  try {
    const response = await axios.get(`${PREMIER_LEAGUE_BASE_URL}/bootstrap-static/`, {
      timeout: 10000
    })
    return response.data
  } catch (error) {
    console.error('Error fetching players:', error.message)
    throw new Error('Failed to fetch players')
  }
}

/**
 * Fetch all fixtures from Premier League API
 */
export const fetchFixtures = async () => {
  try {
    const response = await axios.get(`${PREMIER_LEAGUE_BASE_URL}/fixtures/`, {
      timeout: 10000
    })
    return response.data
  } catch (error) {
    console.error('Error fetching fixtures:', error.message)
    throw new Error('Failed to fetch fixtures')
  }
}

/**
 * Fetch fixtures for a specific gameweek
 */
export const fetchGameweekFixtures = async (gameweek) => {
  try {
    const response = await axios.get(`${PREMIER_LEAGUE_BASE_URL}/fixtures/?event=${gameweek}`, {
      timeout: 10000
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching gameweek ${gameweek} fixtures:`, error.message)
    throw new Error(`Failed to fetch gameweek ${gameweek} fixtures`)
  }
}

/**
 * Get team information from players data
 */
export const getTeamsFromPlayers = (playersData) => {
  if (!playersData || !playersData.teams) {
    return []
  }
  
  return playersData.teams.map(team => ({
    id: team.id,
    name: team.name,
    shortName: team.short_name,
    code: team.code
  }))
}

/**
 * Process fixtures data and add team information
 */
export const processFixtures = (fixturesData, teamsData) => {
  if (!fixturesData || !Array.isArray(fixturesData)) {
    return []
  }

  const teamsMap = new Map()
  teamsData.forEach(team => {
    teamsMap.set(team.id, team)
  })

  return fixturesData.map(fixture => ({
    id: fixture.id,
    homeTeam: teamsMap.get(fixture.team_h)?.name || 'Unknown',
    awayTeam: teamsMap.get(fixture.team_a)?.name || 'Unknown',
    homeTeamId: fixture.team_h,
    awayTeamId: fixture.team_a,
    kickoffTime: fixture.kickoff_time,
    status: fixture.finished ? 'finished' : 'pending',
    homeScore: fixture.team_h_score,
    awayScore: fixture.team_a_score,
    gameweek: fixture.event
  }))
}
