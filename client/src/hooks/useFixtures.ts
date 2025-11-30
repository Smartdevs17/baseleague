import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { fixturesState, fixturesLoadingState, fixturesErrorState, ApiFixture } from '@/store/fixtures'

// Use Vercel serverless function to proxy FPL API (handles CORS)
const getApiBaseUrl = () => {
	// In development, use Vite proxy (configured in vite.config.ts)
	// In production, use the deployed Vercel function
	if (import.meta.env.DEV) {
		// Use relative path - Vite proxy will handle it
		return ''
	}
	return import.meta.env.VITE_API_BASE_URL || window.location.origin
}

/**
 * Hook to fetch fixtures via Vercel serverless function proxy
 * Returns fixtures with actual match times from FPL API
 * Uses serverless function to handle CORS issues
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
				const apiBaseUrl = getApiBaseUrl()
				const apiUrl = `${apiBaseUrl}/api/fixtures`
				console.log('📡 Fetching fixtures via proxy:', apiUrl)

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
 * Hook to fetch only upcoming fixtures via Vercel serverless function proxy
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
				const apiBaseUrl = getApiBaseUrl()
				const apiUrl = `${apiBaseUrl}/api/fixtures-upcoming`
				console.log('📡 Fetching upcoming fixtures via proxy:', apiUrl)

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
					// Log sample fixture to verify kickoffTime is present
					if (data.fixtures.length > 0) {
						const sample = data.fixtures[0]
						console.log(`✅ Fetched ${data.fixtures.length} upcoming fixtures with actual match times`)
						console.log('📅 Sample fixture kickoffTime:', sample.kickoffTime, '| Type:', typeof sample.kickoffTime)
					}
					setFixtures(data.fixtures as ApiFixture[])
				} else {
					throw new Error('Invalid response format from API')
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

