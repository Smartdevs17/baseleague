/**
 * Hook to fetch matches from PredictionContract
 * Fetches bets from the contract and groups them by match
 */

import { useMemo, useState, useEffect } from 'react'
import { useAccount, useReadContract, usePublicClient } from 'wagmi'
import { CONTRACTS, ABIS } from '@/lib/contracts'
import { formatEther } from 'viem'
import { Match } from '@/types/match'
import { useFixtures } from '@/hooks/useFixtures'
import { useTeamLogos } from '@/hooks/useTeamLogos'
import { ApiFixture } from '@/store/fixtures'

interface BetData {
	betId: bigint
	bettor: `0x${string}`
	gameweek: bigint
	matchId: bigint
	amount: bigint
	prediction: bigint // 0 = HOME, 1 = DRAW, 2 = AWAY
	isSettled: boolean
	isWinner: boolean
	timestamp: bigint
}

interface MatchData {
	gameweek: number
	matchId: number
	bets: BetData[]
	isSettled: boolean
	totalAmount: bigint
	homeBets: BetData[]
	drawBets: BetData[]
	awayBets: BetData[]
}

/**
 * Fetch all bets and group them by match
 */
export const useContractMatches = () => {
	const { address, isConnected } = useAccount()
	const publicClient = usePublicClient()
	const { fixtures } = useFixtures()
	const { getTeamLogo } = useTeamLogos()
	const [bets, setBets] = useState<BetData[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	// Get total number of bets
	const { data: nextBetId } = useReadContract({
		address: CONTRACTS.PREDICTION_CONTRACT,
		abi: ABIS.PREDICTION_CONTRACT,
		functionName: 'nextBetId',
		query: {
			enabled: isConnected,
			refetchInterval: 5000, // Refetch every 5 seconds to catch new bets
		},
	})

	// Log when nextBetId changes (removed for cleaner logs)

	// Fetch all bets from contract
	useEffect(() => {
		if (!isConnected || !publicClient || !nextBetId || nextBetId === 0n) {
			setBets([])
			return
		}

		const fetchAllBets = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const betPromises: Promise<BetData | null>[] = []
				
				// Limit to first 100 bets to avoid too many calls
				const maxBets = 100
				const betCount = Number(nextBetId) > maxBets ? maxBets : Number(nextBetId)
				
				// Create promises for all bet IDs
				for (let i = 0; i < betCount; i++) {
					const betId = BigInt(i)
					const promise = publicClient.readContract({
						address: CONTRACTS.PREDICTION_CONTRACT,
						abi: ABIS.PREDICTION_CONTRACT,
						functionName: 'getBet',
						args: [betId],
					}).then((bet: any) => {
						if (bet && bet.bettor && bet.bettor !== '0x0000000000000000000000000000000000000000') {
							return {
								betId: betId,
								bettor: bet.bettor as `0x${string}`,
								gameweek: bet.gameweek,
								matchId: bet.matchId,
								amount: bet.amount,
								prediction: bet.prediction,
								isSettled: bet.isSettled,
								isWinner: bet.isWinner,
								timestamp: bet.timestamp,
							} as BetData
						}
						return null
					}).catch((err) => {
						console.warn(`Failed to fetch bet ${i}:`, err)
						return null
					})

					betPromises.push(promise)
				}

				const results = await Promise.all(betPromises)
				const validBets = results.filter((bet): bet is BetData => bet !== null)
				
				// Debug: Log fetched bets
				console.log(`📊 [useContractMatches] Fetched ${validBets.length} bets from contract (nextBetId: ${nextBetId})`)
				if (validBets.length > 0) {
					console.log('📋 Sample bets:', validBets.slice(0, 5).map(b => ({
						betId: Number(b.betId),
						matchId: Number(b.matchId),
						gameweek: Number(b.gameweek),
						bettor: b.bettor,
						prediction: Number(b.prediction),
					})))
				}
				
				setBets(validBets)
			} catch (err) {
				console.error('Error fetching bets:', err)
				setError(err instanceof Error ? err : new Error('Failed to fetch bets'))
			} finally {
				setIsLoading(false)
			}
		}

		fetchAllBets()
	}, [isConnected, publicClient, nextBetId])

	// Group bets by match
	const matches = useMemo(() => {
		const matchMap = new Map<string, MatchData>()

		bets.forEach((bet) => {
			const key = `${bet.gameweek}-${bet.matchId}`
			
			if (!matchMap.has(key)) {
				matchMap.set(key, {
					gameweek: Number(bet.gameweek),
					matchId: Number(bet.matchId),
					bets: [],
					isSettled: bet.isSettled, // Use bet's isSettled as initial value
					totalAmount: 0n,
					homeBets: [],
					drawBets: [],
					awayBets: [],
				})
			}

			const match = matchMap.get(key)!
			match.bets.push(bet)
			match.totalAmount += bet.amount
			
			// If any bet is settled, the match is settled
			if (bet.isSettled) {
				match.isSettled = true
			}

			// Group by prediction
			if (bet.prediction === 0n) {
				match.homeBets.push(bet)
			} else if (bet.prediction === 1n) {
				match.drawBets.push(bet)
			} else {
				match.awayBets.push(bet)
			}
		})

		const matchesArray = Array.from(matchMap.values())
		
		// Sort bets by timestamp to ensure creator (first bet) is first
		matchesArray.forEach(match => {
			match.bets.sort((a, b) => {
				const timeA = Number(a.timestamp || 0n)
				const timeB = Number(b.timestamp || 0n)
				return timeA - timeB
			})
		})

		return matchesArray
	}, [bets])

	// Helper function to find fixture by matchId
	const findFixture = useMemo(() => {
		return (matchId: number): ApiFixture | null => {
			// Try to match by externalId first (string match)
			let fixture = fixtures.find(f => f.externalId === matchId.toString())
			// If not found, try matching by id
			if (!fixture) {
				fixture = fixtures.find(f => parseInt(f.id) === matchId || parseInt(f.externalId) === matchId)
			}
			
			// Debug fixture matching
			if (!fixture) {
				console.warn(`⚠️ [useContractMatches] No fixture found for matchId ${matchId}. Available fixtures: ${fixtures.length}, sample IDs: ${fixtures.slice(0, 5).map(f => f.externalId || f.id).join(', ')}`)
			} else {
				console.log(`✅ [useContractMatches] Found fixture for matchId ${matchId}: ${fixture.homeTeam} vs ${fixture.awayTeam}`)
			}
			
			return fixture || null
		}
	}, [fixtures])

	// Convert to Match format for UI
	const openMatches = useMemo(() => {
		// Debug: Log all matches before filtering
		console.log(`🔍 [useContractMatches] Processing ${matches.length} matches for open matches`)
		matches.forEach(m => {
			console.log(`  Match ${m.gameweek}-${m.matchId}: ${m.bets.length} bets, settled: ${m.isSettled}`)
		})
		
		// Open matches are those with exactly 1 bet (waiting for opponent)
		const open = matches
			.filter((m) => !m.isSettled && m.bets.length === 1)
			.map((m) => {
				const fixture = findFixture(m.matchId)
				
				// If fixture found, use real data with actual match time from FPL API
				// Otherwise use placeholder (fallback should be rare now that we fetch from API)
				const fixtureData = fixture ? {
					id: parseInt(fixture.externalId || fixture.id),
					date: fixture.kickoffTime, // Actual match time from FPL API, not system time
					homeTeam: fixture.homeTeam,
					awayTeam: fixture.awayTeam,
					homeTeamLogo: getTeamLogo(fixture.homeTeamId, fixture.homeTeam),
					awayTeamLogo: getTeamLogo(fixture.awayTeamId, fixture.awayTeam),
					status: fixture.status === 'pending' ? 'upcoming' as const :
					        fixture.status === 'live' ? 'live' as const :
					        fixture.status === 'finished' ? 'finished' as const : 'upcoming' as const,
					league: 'Premier League',
				} : {
					id: m.matchId,
					date: new Date(Number(m.bets[0]?.timestamp || 0n) * 1000).toISOString(),
					homeTeam: `Match ${m.matchId}`,
					awayTeam: `Opponent ${m.matchId}`,
					homeTeamLogo: '',
					awayTeamLogo: '',
					status: 'upcoming' as const,
					league: 'Premier League',
				}

				const predictionValue = Number(m.bets[0]?.prediction || 0n)
				const creatorPrediction = predictionValue === 0 ? 'home' : predictionValue === 1 ? 'draw' : 'away'
				
				// Debug prediction mapping
				console.log('🔍 [useContractMatches] Open match prediction:', {
					matchId: m.matchId,
					betId: Number(m.bets[0]?.betId),
					contractPrediction: Number(m.bets[0]?.prediction),
					mappedTo: creatorPrediction,
					bettor: m.bets[0]?.bettor,
				})

				return {
					id: `${m.gameweek}-${m.matchId}`,
					creator: m.bets[0]?.bettor || '0x0',
					stake: m.bets[0]?.amount.toString() || '0',
					fixtureId: m.matchId,
					fixture: fixtureData,
					creatorPrediction,
					settled: m.isSettled,
					status: m.isSettled ? 'completed' : 'open' as const,
					createdAt: Number(m.bets[0]?.timestamp || 0n),
				} as Match
			})
		
		// Debug: Log final open matches with predictions
		if (open.length > 0) {
			console.log('📋 [useContractMatches] Final open matches:', open.map(m => ({
				id: m.id,
				creator: m.creator,
				creatorPrediction: m.creatorPrediction,
			})))
		}
		
		return open
	}, [matches, findFixture, getTeamLogo])

	const activeMatches = useMemo(() => {
		// Debug: Log all matches before filtering for active
		console.log(`🔍 [useContractMatches] Processing ${matches.length} matches for active matches`)
		
		// Active matches are those with multiple bets but not settled
		const active = matches
			.filter((m) => !m.isSettled && m.bets.length > 1)
			.map((m) => {
				const fixture = findFixture(m.matchId)
				
				const fixtureData = fixture ? {
					id: parseInt(fixture.externalId || fixture.id),
					date: fixture.kickoffTime,
					homeTeam: fixture.homeTeam,
					awayTeam: fixture.awayTeam,
					homeTeamLogo: getTeamLogo(fixture.homeTeamId, fixture.homeTeam),
					awayTeamLogo: getTeamLogo(fixture.awayTeamId, fixture.awayTeam),
					status: fixture.status === 'live' ? 'live' as const : 'upcoming' as const,
					league: 'Premier League',
				} : {
					id: m.matchId,
					date: new Date(Number(m.bets[0]?.timestamp || 0n) * 1000).toISOString(),
					homeTeam: `Match ${m.matchId}`,
					awayTeam: `Opponent ${m.matchId}`,
					homeTeamLogo: '',
					awayTeamLogo: '',
					status: 'live' as const,
					league: 'Premier League',
				}

				const creatorPredictionValue = Number(m.bets[0]?.prediction || 0n)
				const creatorPrediction = creatorPredictionValue === 0 ? 'home' : creatorPredictionValue === 1 ? 'draw' : 'away'
				const joinerPredictionValue = m.bets.length > 1 ? Number(m.bets[1]?.prediction || 0n) : undefined
				const joinerPrediction = joinerPredictionValue !== undefined
					? (joinerPredictionValue === 0 ? 'home' : joinerPredictionValue === 1 ? 'draw' : 'away')
					: undefined

				return {
					id: `${m.gameweek}-${m.matchId}`,
					creator: m.bets[0]?.bettor || '0x0',
					joiner: m.bets.length > 1 ? m.bets[1]?.bettor : undefined,
					stake: m.bets[0]?.amount.toString() || '0',
					fixtureId: m.matchId,
					fixture: fixtureData,
					creatorPrediction,
					joinerPrediction,
					settled: false,
					status: 'active' as const,
					createdAt: Number(m.bets[0]?.timestamp || 0n),
				} as Match
			})
			// Filter out matches where creator and joiner are the same address
			.filter((m) => {
				if (!m.joiner) return true
				return m.creator.toLowerCase() !== m.joiner.toLowerCase()
			})
		
		return active
	}, [matches, fixtures, getTeamLogo])

	const completedMatches = useMemo(() => {
		return matches
			.filter((m) => m.isSettled)
			.map((m) => {
				const fixture = findFixture(m.matchId)
				const winnerBet = m.bets.find((b) => b.isWinner)
				
				const fixtureData = fixture ? {
					id: parseInt(fixture.externalId || fixture.id),
					date: fixture.kickoffTime,
					homeTeam: fixture.homeTeam,
					awayTeam: fixture.awayTeam,
					homeTeamLogo: getTeamLogo(fixture.homeTeamId, fixture.homeTeam),
					awayTeamLogo: getTeamLogo(fixture.awayTeamId, fixture.awayTeam),
					status: 'finished' as const,
					league: 'Premier League',
					score: fixture.homeScore !== undefined && fixture.awayScore !== undefined ? {
						home: fixture.homeScore,
						away: fixture.awayScore,
					} : undefined,
				} : {
					id: m.matchId,
					date: new Date(Number(m.bets[0]?.timestamp || 0n) * 1000).toISOString(),
					homeTeam: `Match ${m.matchId}`,
					awayTeam: `Opponent ${m.matchId}`,
					homeTeamLogo: '',
					awayTeamLogo: '',
					status: 'finished' as const,
					league: 'Premier League',
				}

				return {
					id: `${m.gameweek}-${m.matchId}`,
					creator: m.bets[0]?.bettor || '0x0',
					joiner: m.bets.length > 1 ? m.bets[1]?.bettor : undefined,
					stake: m.bets[0]?.amount.toString() || '0',
					fixtureId: m.matchId,
					fixture: fixtureData,
					creatorPrediction: m.bets[0]?.prediction === 0n ? 'home' : m.bets[0]?.prediction === 1n ? 'draw' : 'away',
					joinerPrediction: m.bets.length > 1 
						? (m.bets[1]?.prediction === 0n ? 'home' : m.bets[1]?.prediction === 1n ? 'draw' : 'away')
						: undefined,
					settled: true,
					winner: winnerBet?.bettor,
					status: 'completed' as const,
					createdAt: Number(m.bets[0]?.timestamp || 0n),
				} as Match
			})
	}, [matches, fixtures, getTeamLogo])

	return {
		openMatches,
		activeMatches,
		completedMatches,
		isLoading,
		error,
		openMatchesCount: openMatches.length,
		activeMatchesCount: activeMatches.length,
		completedMatchesCount: completedMatches.length,
	}
}

