import { useState, useMemo } from 'react'
import { Match, Fixture } from '@/types/match'
import { ApiFixture } from '@/store/fixtures'
import { useTeamLogos } from './useTeamLogos'
import {
	mockFixtures,
	mockOpenMatches,
	mockActiveMatches,
	mockCompletedMatches,
	mockUserStats,
	mockTokenBalance,
	mockTokenAllowance,
	convertApiFixtureToFixture,
} from '@/data/mockData'

// Mock token hook
export const useToken = () => {
	const [balance] = useState(mockTokenBalance)
	const [allowance] = useState(mockTokenAllowance)
	const [isApproving, setIsApproving] = useState(false)

	const approve = async (amount: bigint) => {
		setIsApproving(true)
		// Simulate approval delay
		await new Promise(resolve => setTimeout(resolve, 2000))
		setIsApproving(false)
		return { hash: '0x' + Math.random().toString(16).substr(2, 64) as `0x${string}` }
	}

	return {
		balance,
		allowance,
		approve,
		isApproving,
		approveError: null,
	}
}

// Mock matches hook
export const useMatches = () => {
	return {
		openMatches: mockOpenMatches.map(m => parseInt(m.id)),
		activeMatches: mockActiveMatches.map(m => parseInt(m.id)),
		completedMatches: mockCompletedMatches.map(m => parseInt(m.id)),
		userMatches: [...mockOpenMatches, ...mockActiveMatches, ...mockCompletedMatches].map(m => parseInt(m.id)),
		userStats: mockUserStats,
	}
}

// Mock create match hook
export const useCreateMatch = () => {
	const [isCreating, setIsCreating] = useState(false)

	const createMatch = async (fixtureId: string, prediction: number, stakeAmount: bigint) => {
		setIsCreating(true)
		// Simulate creation delay
		await new Promise(resolve => setTimeout(resolve, 2000))
		setIsCreating(false)
		return { hash: '0x' + Math.random().toString(16).substr(2, 64) as `0x${string}` }
	}

	return {
		createMatch,
		isCreating,
		createError: null,
	}
}

// Mock match hook
export const useMatch = (matchId: number) => {
	const [isJoining, setIsJoining] = useState(false)
	const [isCancelling, setIsCancelling] = useState(false)

	const allMatches = [...mockOpenMatches, ...mockActiveMatches, ...mockCompletedMatches]
	const match = allMatches.find(m => m.id === matchId.toString())

	const joinMatch = async (prediction: number) => {
		setIsJoining(true)
		// Simulate join delay
		await new Promise(resolve => setTimeout(resolve, 2000))
		setIsJoining(false)
		return { hash: '0x' + Math.random().toString(16).substr(2, 64) as `0x${string}` }
	}

	const cancelMatch = async () => {
		setIsCancelling(true)
		// Simulate cancel delay
		await new Promise(resolve => setTimeout(resolve, 2000))
		setIsCancelling(false)
		return { hash: '0x' + Math.random().toString(16).substr(2, 64) as `0x${string}` }
	}

	return {
		match: match ? {
			id: parseInt(match.id),
			creator: match.creator,
			joiner: match.joiner || '',
			stakeAmount: BigInt(match.stake),
			fixtureId: match.fixtureId.toString(),
			creatorPrediction: match.creatorPrediction === 'home' ? 0 : match.creatorPrediction === 'draw' ? 1 : 2,
			joinerPrediction: match.joinerPrediction ? (match.joinerPrediction === 'home' ? 0 : match.joinerPrediction === 'draw' ? 1 : 2) : 0,
			status: match.status === 'open' ? 0 : match.status === 'active' ? 1 : 2,
			result: 0,
			createdAt: BigInt(match.createdAt),
			completedAt: BigInt(0),
			isSettled: match.settled,
		} : undefined,
		joinMatch,
		cancelMatch,
		isJoining,
		isCancelling,
		joinError: null,
		cancelError: null,
	}
}

// Mock account hook
export const useAccount = () => {
	return {
		address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
		isConnected: true,
		connector: null,
	}
}

// Mock fixtures hook
export const useUpcomingFixturesQuery = () => {
	const { getTeamLogo } = useTeamLogos()
	
	const fixtures = useMemo(() => {
		return mockFixtures.filter(fixture => {
			const kickoffTime = new Date(fixture.kickoffTime)
			return fixture.status === 'pending' && kickoffTime > new Date()
		})
	}, [])

	return {
		fixtures,
		loading: false,
		error: null,
		refetch: async () => ({ fixtures, loading: false, error: null }),
	}
}

// Mock open matches with fixtures hook
export const useOpenMatchesWithFixtures = () => {
	const { getTeamLogo } = useTeamLogos()

	const matches = useMemo(() => {
		return mockOpenMatches.map(match => {
			const fixture = convertApiFixtureToFixture(
				mockFixtures.find(f => f.externalId === match.fixtureId.toString()) || mockFixtures[0],
				getTeamLogo
			)
			return {
				...match,
				fixture,
			}
		})
	}, [getTeamLogo])

	return {
		matches,
		isLoading: false,
		error: null,
		openMatchesCount: matches.length,
	}
}

// Mock active matches with fixtures hook
export const useActiveMatchesWithFixtures = () => {
	const { getTeamLogo } = useTeamLogos()

	const matches = useMemo(() => {
		return mockActiveMatches.map(match => {
			const fixture = convertApiFixtureToFixture(
				mockFixtures.find(f => f.externalId === match.fixtureId.toString()) || mockFixtures[0],
				getTeamLogo
			)
			return {
				...match,
				fixture,
			}
		})
	}, [getTeamLogo])

	return {
		matches,
		isLoading: false,
		error: null,
		activeMatchesCount: matches.length,
	}
}

// Mock completed matches with fixtures hook
export const useCompletedMatchesWithFixtures = () => {
	const { getTeamLogo } = useTeamLogos()

	const matches = useMemo(() => {
		return mockCompletedMatches.map(match => {
			const fixture = convertApiFixtureToFixture(
				mockFixtures.find(f => f.externalId === match.fixtureId.toString()) || mockFixtures[0],
				getTeamLogo
			)
			return {
				...match,
				fixture,
			}
		})
	}, [getTeamLogo])

	return {
		matches,
		isLoading: false,
		error: null,
		completedMatchesCount: matches.length,
	}
}

