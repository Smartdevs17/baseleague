import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { fixturesState, fixturesLoadingState, fixturesErrorState, ApiFixture } from '@/store/fixtures'

const FPL_API_BASE_URL = 'https://fantasy.premierleague.com/api'

/**
 * Hook to fetch fixtures directly from FPL API
 * Returns fixtures with actual match times from FPL API
 * No backend needed - FPL API is public and doesn't require authentication
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
				const apiUrl = `${FPL_API_BASE_URL}/fixtures/`
				console.log('📡 Fetching fixtures directly from FPL API:', apiUrl)

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

				const fplFixtures = await response.json()

				if (!Array.isArray(fplFixtures)) {
					throw new Error('Invalid response format from FPL API')
				}

				// Get current gameweek for reference
				let currentGameweek = 1
				try {
					const bootstrapResponse = await fetch(`${FPL_API_BASE_URL}/bootstrap-static/`)
					if (bootstrapResponse.ok) {
						const bootstrap = await bootstrapResponse.json()
						const currentEvent = bootstrap.events?.find((e: any) => e.is_current)
						if (currentEvent) {
							currentGameweek = currentEvent.id
						}
					}
				} catch (e) {
					console.warn('Could not fetch current gameweek, using default:', e)
				}

				// Transform FPL fixtures to our API format
				const transformedFixtures: ApiFixture[] = fplFixtures.map((fplFixture: any) => {
					// Determine status
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
						kickoffTime: fplFixture.kickoff_time || new Date().toISOString(), // Actual match time from FPL API
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
				})

				// Log sample fixture to verify kickoffTime is present
				if (transformedFixtures.length > 0) {
					const sample = transformedFixtures[0]
					console.log(`✅ Fetched ${transformedFixtures.length} fixtures with actual match times from FPL API`)
					console.log('📅 Sample fixture kickoffTime:', sample.kickoffTime, '| Type:', typeof sample.kickoffTime)
				}

				setFixtures(transformedFixtures)
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
				const response = await fetch(`${FPL_API_BASE_URL}/fixtures/`)
				const fplFixtures = await response.json()
				if (Array.isArray(fplFixtures)) {
					// Transform same as above
					const transformedFixtures: ApiFixture[] = fplFixtures.map((fplFixture: any) => ({
						id: fplFixture.id.toString(),
						externalId: fplFixture.id.toString(),
						homeTeam: fplFixture.team_h_name || `Team ${fplFixture.team_h}`,
						awayTeam: fplFixture.team_a_name || `Team ${fplFixture.team_a}`,
						homeTeamId: fplFixture.team_h?.toString() || '',
						awayTeamId: fplFixture.team_a?.toString() || '',
						kickoffTime: fplFixture.kickoff_time || new Date().toISOString(),
						status: fplFixture.finished ? 'finished' : fplFixture.started ? 'live' : 'pending',
						homeScore: fplFixture.team_h_score,
						awayScore: fplFixture.team_a_score,
						gameweek: fplFixture.event || 1,
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
					}))
					setFixtures(transformedFixtures)
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
 * Hook to fetch only upcoming fixtures directly from FPL API
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
				const apiUrl = `${FPL_API_BASE_URL}/fixtures/`
				console.log('📡 Fetching upcoming fixtures directly from FPL API:', apiUrl)

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

				const fplFixtures = await response.json()

				if (!Array.isArray(fplFixtures)) {
					throw new Error('Invalid response format from FPL API')
				}

				// Get current gameweek
				let currentGameweek = 1
				try {
					const bootstrapResponse = await fetch(`${FPL_API_BASE_URL}/bootstrap-static/`)
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

				const now = new Date()

				// Filter and transform upcoming fixtures
				const transformedFixtures: ApiFixture[] = fplFixtures
					.filter((fplFixture: any) => {
						// Only include fixtures that haven't finished
						if (fplFixture.finished) return false

						// Check if kickoff time is in the future
						if (fplFixture.kickoff_time) {
							const kickoff = new Date(fplFixture.kickoff_time)
							return kickoff > now
						}

						return false
					})
					.map((fplFixture: any) => ({
						id: fplFixture.id.toString(),
						externalId: fplFixture.id.toString(),
						homeTeam: fplFixture.team_h_name || `Team ${fplFixture.team_h}`,
						awayTeam: fplFixture.team_a_name || `Team ${fplFixture.team_a}`,
						homeTeamId: fplFixture.team_h?.toString() || '',
						awayTeamId: fplFixture.team_a?.toString() || '',
						kickoffTime: fplFixture.kickoff_time, // Actual match time from FPL API
						status: 'pending' as const,
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
					}))

				// Log sample fixture to verify kickoffTime is present
				if (transformedFixtures.length > 0) {
					const sample = transformedFixtures[0]
					console.log(`✅ Fetched ${transformedFixtures.length} upcoming fixtures with actual match times from FPL API`)
					console.log('📅 Sample fixture kickoffTime:', sample.kickoffTime, '| Type:', typeof sample.kickoffTime)
				}

				setFixtures(transformedFixtures)
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
				const response = await fetch(`${FPL_API_BASE_URL}/fixtures/`)
				const fplFixtures = await response.json()
				if (Array.isArray(fplFixtures)) {
					const now = new Date()
					const transformedFixtures: ApiFixture[] = fplFixtures
						.filter((fplFixture: any) => {
							if (fplFixture.finished) return false
							if (fplFixture.kickoff_time) {
								return new Date(fplFixture.kickoff_time) > now
							}
							return false
						})
						.map((fplFixture: any) => ({
							id: fplFixture.id.toString(),
							externalId: fplFixture.id.toString(),
							homeTeam: fplFixture.team_h_name || `Team ${fplFixture.team_h}`,
							awayTeam: fplFixture.team_a_name || `Team ${fplFixture.team_a}`,
							homeTeamId: fplFixture.team_h?.toString() || '',
							awayTeamId: fplFixture.team_a?.toString() || '',
							kickoffTime: fplFixture.kickoff_time,
							status: 'pending' as const,
							gameweek: fplFixture.event || 1,
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
						}))
					setFixtures(transformedFixtures)
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch upcoming fixtures')
			} finally {
				setLoading(false)
			}
		},
	}
}

