import { useAccount, useReadContract, usePublicClient } from 'wagmi'
import { useState, useEffect, useMemo } from 'react'
import { formatEther } from 'viem'
import { CONTRACTS, ABIS } from '@/lib/contracts'

export interface LeaderboardEntry {
	rank: number
	address: `0x${string}`
	wins: number
	losses: number
	totalMatches: number
	earnings: string // In CELO
	winRate: number
	totalBets: number
	totalWagered: string // In CELO
}

interface BetData {
	bettor: `0x${string}`
	amount: bigint
	isSettled: boolean
	isWinner: boolean
}

/**
 * Hook to calculate leaderboard from contract data
 * Fetches all bets and calculates stats per address
 */
export const useLeaderboard = () => {
	const { isConnected } = useAccount()
	const publicClient = usePublicClient()
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
	const [isLoading, setIsLoading] = useState(false)

	// Get total number of bets
	const { data: nextBetId } = useReadContract({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		functionName: 'nextBetId',
		query: {
			enabled: isConnected,
			refetchInterval: 10000, // Refetch every 10 seconds
		},
	})

	// Fetch all bets and calculate leaderboard
	useEffect(() => {
		if (!isConnected || !publicClient || !nextBetId || nextBetId === 0n) {
			setLeaderboard([])
			return
		}

		const fetchLeaderboard = async () => {
			setIsLoading(true)
			try {
				const betPromises: Promise<BetData | null>[] = []
				const betCount = Number(nextBetId) > 100 ? 100 : Number(nextBetId) // Limit to 100 bets

				// Fetch all bets
				for (let i = 0; i < betCount; i++) {
					const betId = BigInt(i)
					const promise = publicClient
						.readContract({
							address: CONTRACTS.PREDICTION_CONTRACT,
							abi: ABIS.PREDICTION_CONTRACT,
							functionName: 'getBet',
							args: [betId],
						})
						.then((bet: any) => {
							if (bet && bet.bettor && bet.bettor !== '0x0000000000000000000000000000000000000000') {
								return {
									bettor: bet.bettor as `0x${string}`,
									amount: bet.amount,
									isSettled: bet.isSettled,
									isWinner: bet.isWinner,
								} as BetData
							}
							return null
						})
						.catch(() => null)

					betPromises.push(promise)
				}

				const results = await Promise.all(betPromises)
				const validBets = results.filter((bet): bet is BetData => bet !== null)

				// Calculate stats per address
				const statsMap = new Map<`0x${string}`, {
					wins: number
					losses: number
					totalBets: number
					totalWagered: bigint
					totalEarnings: bigint
				}>()

				validBets.forEach((bet) => {
					if (!statsMap.has(bet.bettor)) {
						statsMap.set(bet.bettor, {
							wins: 0,
							losses: 0,
							totalBets: 0,
							totalWagered: 0n,
							totalEarnings: 0n,
						})
					}

					const stats = statsMap.get(bet.bettor)!
					stats.totalBets++
					stats.totalWagered += bet.amount

					if (bet.isSettled) {
						if (bet.isWinner) {
							stats.wins++
							// Estimate earnings (simplified - actual earnings would need to track payouts)
							// For now, we'll use a multiplier based on win rate
							stats.totalEarnings += bet.amount * 2n // Simplified: 2x for wins
						} else {
							stats.losses++
						}
					}
				})

				// Convert to leaderboard entries
				const entries: LeaderboardEntry[] = Array.from(statsMap.entries())
					.map(([address, stats]) => {
						const totalMatches = stats.wins + stats.losses
						const winRate = totalMatches > 0 ? (stats.wins / totalMatches) * 100 : 0
						
						return {
							address,
							wins: stats.wins,
							losses: stats.losses,
							totalMatches,
							totalBets: stats.totalBets,
							earnings: formatEther(stats.totalEarnings),
							winRate,
							totalWagered: formatEther(stats.totalWagered),
						} as Omit<LeaderboardEntry, 'rank'>
					})
					.filter((entry) => entry.totalMatches > 0) // Only show players with settled matches
					.sort((a, b) => {
						// Sort by wins first, then win rate, then earnings
						if (b.wins !== a.wins) return b.wins - a.wins
						if (b.winRate !== a.winRate) return b.winRate - a.winRate
						return parseFloat(b.earnings) - parseFloat(a.earnings)
					})
					.map((entry, index) => ({
						...entry,
						rank: index + 1,
					}))

				setLeaderboard(entries)
			} catch (error) {
				console.error('Error calculating leaderboard:', error)
				setLeaderboard([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchLeaderboard()
	}, [isConnected, publicClient, nextBetId])

	return {
		leaderboard,
		isLoading,
	}
}
