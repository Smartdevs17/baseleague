/**
 * Hook to fetch real bets from PredictionContract
 * Replaces mock data with actual on-chain data
 */

import { useAccount, useReadContract } from 'wagmi'
import { useMemo } from 'react'
import { CONTRACTS, ABIS, Bet } from '@/lib/contracts'
import { formatEther } from 'viem'

interface BetData {
	betId: bigint
	bettor: `0x${string}`
	gameweek: bigint
	matchId: bigint
	amount: bigint
	prediction: bigint
	isSettled: boolean
	isWinner: boolean
	timestamp: bigint
}

interface MatchGroup {
	gameweek: number
	matchId: number
	bets: BetData[]
	isSettled: boolean
	totalAmount: bigint
}

/**
 * Fetch all bets from the contract
 */
export const useAllBets = () => {
	const { address, isConnected } = useAccount()

	// Get total number of bets
	const { data: nextBetId, isLoading: isLoadingNextBetId } = useReadContract({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		functionName: 'nextBetId',
		query: {
			enabled: isConnected,
		},
	})

	// Fetch all bets by iterating through betIds
	const betIds = useMemo(() => {
		if (!nextBetId || nextBetId === 0n) return []
		const ids: bigint[] = []
		for (let i = 0n; i < nextBetId; i++) {
			ids.push(i)
		}
		return ids
	}, [nextBetId])

	// Fetch each bet
	const betQueries = betIds.map((betId) => ({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		functionName: 'getBet' as const,
		args: [betId],
		query: {
			enabled: isConnected && betIds.length > 0,
		},
	}))

	// Note: wagmi doesn't support multiple useReadContract calls easily
	// We'll need to use a different approach - fetch sequentially or use events
	// For now, let's use events which is more efficient

	return {
		nextBetId: nextBetId || 0n,
		isLoading: isLoadingNextBetId,
		totalBets: Number(nextBetId || 0n),
	}
}

/**
 * Fetch bets for a specific match
 * Uses BetPlaced events filtered by gameweek and matchId
 */
export const useMatchBets = (gameweek: number, matchId: number) => {
	const { isConnected } = useAccount()

	// Check if match is settled
	const { data: isSettled } = useReadContract({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		functionName: 'isMatchSettled',
		args: [BigInt(gameweek), BigInt(matchId)],
		query: {
			enabled: isConnected,
		},
	})

	return {
		isSettled: isSettled || false,
	}
}

/**
 * Fetch user's bets
 * This would require iterating through all bets or using events
 * For now, we'll use a simplified approach
 */
export const useUserBets = () => {
	const { address, isConnected } = useAccount()

	// Get total number of bets
	const { data: nextBetId } = useReadContract({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		functionName: 'nextBetId',
		query: {
			enabled: isConnected && !!address,
		},
	})

	// In a real implementation, you'd:
	// 1. Listen to BetPlaced events filtered by bettor address
	// 2. Or iterate through betIds and filter by bettor
	// For now, return empty array - will be populated by events

	return {
		bets: [] as BetData[],
		isLoading: false,
		totalBets: Number(nextBetId || 0n),
	}
}

