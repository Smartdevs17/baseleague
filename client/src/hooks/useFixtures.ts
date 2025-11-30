import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { fixturesState, fixturesLoadingState, fixturesErrorState, ApiFixture } from '@/store/fixtures'
import { config } from '@/lib/config'

/**
 * Hook to fetch fixtures from the backend API
 * Returns fixtures with actual match times from FPL API
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
				// Use localhost in development, production URL otherwise
				const apiBaseUrl = import.meta.env.DEV 
					? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002')
					: config.api.baseUrl
				const apiUrl = `${apiBaseUrl}/api/fixtures`
				console.log('📡 Fetching fixtures from:', apiUrl)

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
			} catch (err) {
				console.error('❌ Error fetching fixtures:', err)
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
				const apiBaseUrl = import.meta.env.DEV 
					? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002')
					: config.api.baseUrl
				const apiUrl = `${apiBaseUrl}/api/fixtures`
				const response = await fetch(apiUrl)
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
 * Hook to fetch only upcoming fixtures
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
				// Use localhost in development, production URL otherwise
				const apiBaseUrl = import.meta.env.DEV 
					? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002')
					: config.api.baseUrl
				const apiUrl = `${apiBaseUrl}/api/fixtures/upcoming`
				console.log('📡 Fetching upcoming fixtures from:', apiUrl)

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
						console.log(`✅ Fetched ${data.fixtures.length} upcoming fixtures with actual match times`)
						console.log('📅 Sample fixture kickoffTime:', sample.kickoffTime, '| Type:', typeof sample.kickoffTime)
					}
					setFixtures(data.fixtures as ApiFixture[])
				} else {
					throw new Error('Invalid response format from API')
				}
			} catch (err) {
				console.error('❌ Error fetching upcoming fixtures:', err)
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
				const apiBaseUrl = import.meta.env.DEV 
					? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002')
					: config.api.baseUrl
				const apiUrl = `${apiBaseUrl}/api/fixtures/upcoming`
				const response = await fetch(apiUrl)
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

