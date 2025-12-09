import { ethers } from 'ethers'
import { config } from '../config/index.js'
import { fetchAllFixtures, getTeams, getCurrentGameweek } from './fplService.js'
import { setResultManually } from './blockchainService.js'

// PredictionContract ABI (minimal for what we need)
const PREDICTION_CONTRACT_ABI = [
	'function nextBetId() external view returns (uint256)',
	'function getBet(uint256 betId) external view returns (tuple(address bettor, uint256 gameweek, uint256 matchId, uint256 amount, uint8 prediction, bool isSettled, bool isWinner, uint256 timestamp))',
	'function isMatchSettled(uint256 gameweek, uint256 matchId) external view returns (bool)',
	'function settleMatch(uint256 gameweek, uint256 matchId) external',
]

// ResultsConsumer ABI (minimal)
const RESULTS_CONSUMER_ABI = [
	'function hasOutcome(uint256 gameweek, uint256 matchId) external view returns (bool)',
	'function getOutcome(uint256 gameweek, uint256 matchId) external view returns (tuple(uint8 homeScore, uint8 awayScore, string status, uint256 timestamp, bool exists))',
]

/**
 * Get PredictionContract instance
 */
function getPredictionContract(provider) {
	return new ethers.Contract(
		config.blockchain.predictionContractAddress,
		PREDICTION_CONTRACT_ABI,
		provider
	)
}

/**
 * Get ResultsConsumer instance
 */
function getResultsConsumer(provider) {
	return new ethers.Contract(
		config.blockchain.resultsConsumerAddress,
		RESULTS_CONSUMER_ABI,
		provider
	)
}

/**
 * Fetch all active matches from PredictionContract
 * @returns {Promise<Array<{gameweek: number, matchId: number, betCount: number, hasBets: boolean}>>}
 */
async function getActiveMatches(provider) {
	const predictionContract = getPredictionContract(provider)
	
	// Get total number of bets
	const nextBetId = await predictionContract.nextBetId()
	
	if (nextBetId === 0n) {
		return []
	}

	// Fetch all bets
	const bets = []
	for (let i = 0n; i < nextBetId; i++) {
		try {
			const bet = await predictionContract.getBet(i)
			bets.push({
				betId: Number(i),
				gameweek: Number(bet.gameweek),
				matchId: Number(bet.matchId),
				isSettled: bet.isSettled,
				timestamp: Number(bet.timestamp),
			})
		} catch (error) {
			console.warn(`⚠️  Error fetching bet ${i}:`, error.message)
		}
	}

	// Group bets by gameweek/matchId
	const matchMap = new Map()
	
	for (const bet of bets) {
		if (bet.isSettled) continue // Skip settled bets
		
		const key = `${bet.gameweek}-${bet.matchId}`
		if (!matchMap.has(key)) {
			matchMap.set(key, {
				gameweek: bet.gameweek,
				matchId: bet.matchId,
				betCount: 0,
				hasBets: false,
			})
		}
		
		const match = matchMap.get(key)
		match.betCount++
		match.hasBets = true
	}

	// Filter out matches that are already settled
	const activeMatches = []
	for (const [key, match] of matchMap.entries()) {
		try {
			const isSettled = await predictionContract.isMatchSettled(
				match.gameweek,
				match.matchId
			)
			if (!isSettled && match.hasBets) {
				activeMatches.push(match)
			}
		} catch (error) {
			console.warn(`⚠️  Error checking settlement for ${key}:`, error.message)
		}
	}

	return activeMatches
}

/**
 * Check if a match has finished (time has passed)
 * @param {number} matchId - FPL fixture ID
 * @param {number} gameweek - Gameweek number
 * @returns {Promise<{finished: boolean, fixture: object|null}>}
 */
async function checkMatchFinished(matchId, gameweek) {
	try {
		const fixtures = await fetchAllFixtures()
		const fixture = fixtures.find((f) => f.id === matchId && f.event === gameweek)
		
		if (!fixture) {
			console.warn(`⚠️  Fixture not found: Gameweek ${gameweek}, Match ${matchId}`)
			return { finished: false, fixture: null }
		}

		// Check if match is finished
		const finished = fixture.finished === true
		const kickoffTime = fixture.kickoff_time ? new Date(fixture.kickoff_time) : null
		const now = new Date()
		
		// Match is finished if:
		// 1. FPL API says it's finished, OR
		// 2. Kickoff time was more than 2 hours ago (typical match duration)
		const timePassed = kickoffTime && (now - kickoffTime) > 2 * 60 * 60 * 1000
		
		return {
			finished: finished || timePassed || false,
			fixture,
		}
	} catch (error) {
		console.error(`❌ Error checking match finish status:`, error.message)
		return { finished: false, fixture: null }
	}
}

/**
 * Get match result from FPL API
 * @param {object} fixture - FPL fixture object
 * @returns {{homeScore: number, awayScore: number, status: string}}
 */
function getResultFromFixture(fixture) {
	const homeScore = fixture.team_h_score !== null ? fixture.team_h_score : 0
	const awayScore = fixture.team_a_score !== null ? fixture.team_a_score : 0
	
	let status = 'NS'
	if (fixture.finished) {
		status = 'FT'
	} else if (fixture.started) {
		status = 'LIVE'
	} else if (fixture.kickoff_time) {
		const kickoff = new Date(fixture.kickoff_time)
		const now = new Date()
		if (kickoff > now) {
			status = 'NS'
		}
	}

	return { homeScore, awayScore, status }
}

/**
 * Settle a single match
 * @param {number} gameweek
 * @param {number} matchId
 * @param {ethers.Provider} provider
 * @param {ethers.Signer} signer
 * @returns {Promise<{success: boolean, message: string, details?: object}>}
 */
async function settleSingleMatch(gameweek, matchId, provider, signer) {
	try {
		const resultsConsumer = getResultsConsumer(provider)
		const predictionContract = getPredictionContract(signer)

		// Check if result exists
		const hasOutcome = await resultsConsumer.hasOutcome(gameweek, matchId)
		
		if (!hasOutcome) {
			// Result doesn't exist - check if match is finished and get result from FPL
			console.log(`   📡 Result not found, checking FPL API...`)
			const { finished, fixture } = await checkMatchFinished(matchId, gameweek)
			
			if (!finished || !fixture) {
				return {
					success: false,
					message: `Match not finished yet or fixture not found`,
				}
			}

			// Get result from FPL and set it manually
			const { homeScore, awayScore, status } = getResultFromFixture(fixture)
			
			if (status !== 'FT') {
				return {
					success: false,
					message: `Match not finished (status: ${status})`,
				}
			}

			console.log(`   📝 Setting result manually: ${homeScore}-${awayScore} (${status})`)
			
			try {
				await setResultManually(gameweek, matchId, homeScore, awayScore, status)
				console.log(`   ✅ Result set successfully`)
			} catch (error) {
				if (error.message.includes('already exists')) {
					console.log(`   ℹ️  Result already exists (may have been set by another process)`)
				} else {
					throw error
				}
			}
		}

		// Now settle the match
		console.log(`   🎯 Settling match...`)
		const tx = await predictionContract.settleMatch(gameweek, matchId, {
			gasLimit: 500000,
		})
		
		console.log(`   ⏳ Transaction sent: ${tx.hash}`)
		const receipt = await tx.wait()
		
		console.log(`   ✅ Match settled in block ${receipt.blockNumber}`)
		
		return {
			success: true,
			message: 'Match settled successfully',
			details: {
				transactionHash: tx.hash,
				blockNumber: receipt.blockNumber,
			},
		}
	} catch (error) {
		console.error(`   ❌ Error settling match:`, error.message)
		
		// Handle specific errors
		if (error.message.includes('MatchNotFulfilled')) {
			return {
				success: false,
				message: 'Match result not available in ResultsConsumer',
			}
		}
		if (error.message.includes('MatchAlreadySettled')) {
			return {
				success: false,
				message: 'Match already settled',
			}
		}
		
		return {
			success: false,
			message: error.message || 'Failed to settle match',
		}
	}
}

/**
 * Process all active matches and settle those that are ready
 * @returns {Promise<{processed: number, settled: number, errors: number, details: Array}>}
 */
export async function processActiveMatches() {
	console.log('\n🔄 [Cron Job] Processing active matches...')
	console.log(`   Time: ${new Date().toISOString()}`)
	
	if (!config.blockchain.privateKey) {
		console.warn('⚠️  PRIVATE_KEY not set - cannot process matches')
		return {
			processed: 0,
			settled: 0,
			errors: 0,
			details: [],
		}
	}

	try {
		// Initialize provider and signer
		const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
		const signer = new ethers.Wallet(config.blockchain.privateKey, provider)

		// Get all active matches
		console.log('   📋 Fetching active matches...')
		const activeMatches = await getActiveMatches(provider)
		
		console.log(`   Found ${activeMatches.length} active matches`)
		
		if (activeMatches.length === 0) {
			console.log('   ✅ No active matches to process')
			return {
				processed: 0,
				settled: 0,
				errors: 0,
				details: [],
			}
		}

		const results = {
			processed: activeMatches.length,
			settled: 0,
			errors: 0,
			details: [],
		}

		// Process each match
		for (const match of activeMatches) {
			console.log(`\n   🎮 Processing: Gameweek ${match.gameweek}, Match ${match.matchId} (${match.betCount} bets)`)
			
			try {
				const result = await settleSingleMatch(
					match.gameweek,
					match.matchId,
					provider,
					signer
				)
				
				results.details.push({
					gameweek: match.gameweek,
					matchId: match.matchId,
					...result,
				})

				if (result.success) {
					results.settled++
				} else {
					results.errors++
				}
			} catch (error) {
				console.error(`   ❌ Error processing match:`, error.message)
				results.errors++
				results.details.push({
					gameweek: match.gameweek,
					matchId: match.matchId,
					success: false,
					message: error.message,
				})
			}
		}

		console.log(`\n✅ [Cron Job] Complete: ${results.settled} settled, ${results.errors} errors`)
		
		return results
	} catch (error) {
		console.error('❌ [Cron Job] Fatal error:', error)
		return {
			processed: 0,
			settled: 0,
			errors: 1,
			details: [{ error: error.message }],
		}
	}
}

