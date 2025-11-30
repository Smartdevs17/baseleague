import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { fixturesState, fixturesLoadingState, fixturesErrorState, ApiFixture } from '@/store/fixtures'

// FPL API base URL - try direct access first, fallback to backend proxy
const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api'

// Try direct FPL API access first (no CORS issues), fallback to backend proxy
const getApiBaseUrl = () => {
	// In development, use local backend proxy
	// In production, use deployed backend or try direct API
	if (import.meta.env.DEV) {
		return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
	}
	return import.meta.env.VITE_API_BASE_URL || window.location.origin
}

// Try fetching directly from FPL API (might work without CORS)
const tryDirectFPLFetch = async (endpoint: string) => {
	try {
		const response = await fetch(`${FPL_API_BASE_URL}${endpoint}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
		})
		if (response.ok) {
			return await response.json()
		}
	} catch (error) {
		// CORS error or other issue - will fallback to proxy
		console.warn('Direct FPL API access failed, using proxy:', error)
	}
	return null
}


/**
 * Hook to fetch fixtures via API server proxy
 * Returns fixtures with actual match times from FPL API
 * Uses simple backend server to handle CORS issues
 */
export const useFixtures = () => {
	const [fixtures, setFixtures] = useRecoilState(fixturesState)
	const [loading, setLoading] = useRecoilState(fixturesLoadingState)
	const [error, setError] = useRecoilState(fixturesErrorState)

	useEffect(() => {
		const fetchFixtures = async () => {
			setLoading(true)
			setError(null)

			try {
				// Try direct FPL API access first
				let fplData = await tryDirectFPLFetch('/fixtures/')
				
				if (fplData && Array.isArray(fplData)) {
					console.log('✅ Direct FPL API access successful!')
					
					// Fetch teams for name mapping
					const teamsData = await tryDirectFPLFetch('/bootstrap-static/')
					const teams: Record<number, { name: string; shortName: string }> = {}
					if (teamsData?.teams) {
						teamsData.teams.forEach((team: any) => {
							teams[team.id] = { name: team.name, shortName: team.short_name }
						})
					}
					
					// Get current gameweek
					let currentGameweek = 1
					if (teamsData?.events) {
						const currentEvent = teamsData.events.find((e: any) => e.is_current)
						if (currentEvent) currentGameweek = currentEvent.id
					}
					
					// Transform fixtures
					const fixtures = fplData.map((f: any) => {
						const homeTeam = teams[f.team_h]?.name || `Team ${f.team_h}`
						const awayTeam = teams[f.team_a]?.name || `Team ${f.team_a}`
						let status: 'pending' | 'live' | 'finished' = 'pending'
						if (f.finished) status = 'finished'
						else if (f.started) status = 'live'
						
						return {
							id: f.id.toString(),
							externalId: f.id.toString(),
							homeTeam,
							awayTeam,
							homeTeamId: f.team_h?.toString() || '',
							awayTeamId: f.team_a?.toString() || '',
							kickoffTime: f.kickoff_time || new Date().toISOString(),
							status,
							homeScore: f.team_h_score,
							awayScore: f.team_a_score,
							gameweek: f.event || currentGameweek,
							league: 'Premier League',
							pools: { win: { total: 0, betCount: 0 }, draw: { total: 0, betCount: 0 }, lose: { total: 0, betCount: 0 } },
							winningOutcome: null,
							isPayoutProcessed: false,
							totalPoolSize: 0,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						}
					})
					
					const data = { success: true, fixtures }
					
					if (data.success && Array.isArray(data.fixtures)) {
						// Log sample fixture to verify kickoffTime is present
						if (data.fixtures.length > 0) {
							const sample = data.fixtures[0]
							console.log(`✅ Fetched ${data.fixtures.length} fixtures with actual match times`)
							console.log('📅 Sample fixture kickoffTime:', sample.kickoffTime, '| Type:', typeof sample.kickoffTime)
						}
						setFixtures(data.fixtures as ApiFixture[])
					} else {
						throw new Error('Invalid response format from API')
					}
				} else {
					// Fallback to backend proxy
					const apiBaseUrl = getApiBaseUrl()
					const apiUrl = `${apiBaseUrl}/api/fixtures`
					console.log('📡 Using backend proxy:', apiUrl)

					const response = await fetch(apiUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					})

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`)
					}

					const data = await response.json()

					if (data.success && Array.isArray(data.fixtures)) {
						// Log sample fixture to verify kickoffTime is present
						if (data.fixtures.length > 0) {
							const sample = data.fixtures[0]
							console.log(`✅ Fetched ${data.fixtures.length} fixtures with actual match times`)
							console.log('📅 Sample fixture kickoffTime:', sample.kickoffTime, '| Type:', typeof sample.kickoffTime)
						}
						setFixtures(data.fixtures as ApiFixture[])
					} else {
						throw new Error('Invalid response format from API')
					}
				}
			} catch (err) {
				console.error('❌ Error fetching fixtures from FPL API:', err)
				setError(err instanceof Error ? err.message : 'Failed to fetch fixtures')
				// Keep existing fixtures on error
			} finally {
				setLoading(false)
			}
		}

		fetchFixtures()

		// Refetch every 5 minutes to get updated fixtures
		const interval = setInterval(fetchFixtures, 5 * 60 * 1000)

		return () => clearInterval(interval)
	}, [setFixtures, setLoading, setError])

	return {
		fixtures,
		loading,
		error,
		refetch: async () => {
			setLoading(true)
			try {
				const apiBaseUrl = getApiBaseUrl()
				const response = await fetch(`${apiBaseUrl}/api/fixtures`)
				const data = await response.json()
				if (data.success && Array.isArray(data.fixtures)) {
					setFixtures(data.fixtures as ApiFixture[])
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch fixtures')
			} finally {
				setLoading(false)
			}
		},
	}
}

/**
 * Hook to fetch only upcoming fixtures via API server proxy
 * Filters fixtures to only show those that haven't started yet
 */
export const useUpcomingFixtures = () => {
	const [fixtures, setFixtures] = useState<ApiFixture[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchUpcomingFixtures = async () => {
			setLoading(true)
			setError(null)

			try {
				// Try direct FPL API access first
				let fplData = await tryDirectFPLFetch('/fixtures/')
				
				if (fplData && Array.isArray(fplData)) {
					console.log('✅ Direct FPL API access successful for upcoming fixtures!')
					
					// Fetch teams for name mapping
					const teamsData = await tryDirectFPLFetch('/bootstrap-static/')
					const teams: Record<number, { name: string; shortName: string }> = {}
					if (teamsData?.teams) {
						teamsData.teams.forEach((team: any) => {
							teams[team.id] = { name: team.name, shortName: team.short_name }
						})
					}
					
					// Get current gameweek
					let currentGameweek = 1
					if (teamsData?.events) {
						const currentEvent = teamsData.events.find((e: any) => e.is_current)
						if (currentEvent) currentGameweek = currentEvent.id
					}
					
					const now = new Date()
					
					// Filter and transform upcoming fixtures
					const upcomingFixtures = fplData
						.filter((f: any) => {
							if (f.finished) return false
							if (f.kickoff_time) {
								const kickoff = new Date(f.kickoff_time)
								return kickoff > now
							}
							return false
						})
						.map((f: any) => {
							const homeTeam = teams[f.team_h]?.name || `Team ${f.team_h}`
							const awayTeam = teams[f.team_a]?.name || `Team ${f.team_a}`
							let status: 'pending' | 'live' | 'finished' = 'pending'
							if (f.finished) status = 'finished'
							else if (f.started) status = 'live'
							
							return {
								id: f.id.toString(),
								externalId: f.id.toString(),
								homeTeam,
								awayTeam,
								homeTeamId: f.team_h?.toString() || '',
								awayTeamId: f.team_a?.toString() || '',
								kickoffTime: f.kickoff_time || new Date().toISOString(),
								status,
								homeScore: f.team_h_score,
								awayScore: f.team_a_score,
								gameweek: f.event || currentGameweek,
								league: 'Premier League',
								pools: { win: { total: 0, betCount: 0 }, draw: { total: 0, betCount: 0 }, lose: { total: 0, betCount: 0 } },
								winningOutcome: null,
								isPayoutProcessed: false,
								totalPoolSize: 0,
								createdAt: new Date().toISOString(),
								updatedAt: new Date().toISOString(),
							}
						})
					
					if (upcomingFixtures.length > 0) {
						const sample = upcomingFixtures[0]
						console.log(`✅ Fetched ${upcomingFixtures.length} upcoming fixtures`)
						console.log('📅 Sample fixture:', {
							id: sample.id,
							homeTeam: sample.homeTeam,
							awayTeam: sample.awayTeam,
							league: sample.league,
							country: sample.country,
							kickoffTime: sample.kickoffTime,
						})
					}
					setFixtures(upcomingFixtures)
				} else {
					// Fallback to backend proxy
					const apiBaseUrl = getApiBaseUrl()
					const apiUrl = `${apiBaseUrl}/api/fixtures-upcoming`
					console.log('📡 Using backend proxy for upcoming fixtures:', apiUrl)

					const response = await fetch(apiUrl, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							'User-Agent': 'BaseLeague/1.0',
						},
					})

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`)
					}

					const data = await response.json()

					if (data.success && Array.isArray(data.fixtures)) {
						// Log sample fixture to verify data
						if (data.fixtures.length > 0) {
							const sample = data.fixtures[0]
							console.log(`✅ Fetched ${data.fixtures.length} upcoming fixtures with actual match times`)
							console.log('📅 Sample fixture:', {
								id: sample.id,
								homeTeam: sample.homeTeam,
								awayTeam: sample.awayTeam,
								homeTeamId: sample.homeTeamId,
								awayTeamId: sample.awayTeamId,
								league: sample.league,
								country: sample.country,
								kickoffTime: sample.kickoffTime,
							})
						}
						setFixtures(data.fixtures as ApiFixture[])
					} else {
						throw new Error('Invalid response format from API')
					}
				}
			} catch (err) {
				console.error('❌ Error fetching upcoming fixtures from FPL API:', err)
				setError(err instanceof Error ? err.message : 'Failed to fetch upcoming fixtures')
			} finally {
				setLoading(false)
			}
		}

		fetchUpcomingFixtures()

		// Refetch every 5 minutes
		const interval = setInterval(fetchUpcomingFixtures, 5 * 60 * 1000)

		return () => clearInterval(interval)
	}, [])

	return {
		fixtures,
		loading,
		error,
		refetch: async () => {
			setLoading(true)
			try {
				const apiBaseUrl = getApiBaseUrl()
				const response = await fetch(`${apiBaseUrl}/api/fixtures-upcoming`)
				const data = await response.json()
				if (data.success && Array.isArray(data.fixtures)) {
					setFixtures(data.fixtures as ApiFixture[])
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch upcoming fixtures')
			} finally {
				setLoading(false)
			}
		},
	}
}

