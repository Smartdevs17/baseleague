import Match from '../models/Match.js'
import { fetchAllFixtures, getCurrentGameweek, parseFixture } from './fplService.js'
import { submitResult, hasOutcome, getBalance } from './contractService.js'
import { logger } from '../utils/logger.js'

async function processFixtures(fixtures) {
	let processed = 0
	let newMatches = 0
	let updatedMatches = 0

	for (const fixture of fixtures) {
		try {
			const matchData = parseFixture(fixture)
			const existingMatch = await Match.findOne({
				gameweek: matchData.gameweek,
				matchId: matchData.matchId,
			})

			if (existingMatch) {
				existingMatch.homeScore = matchData.homeScore
				existingMatch.awayScore = matchData.awayScore
				existingMatch.status = matchData.status
				existingMatch.finished = matchData.finished
				existingMatch.lastChecked = new Date()
				await existingMatch.save()
				updatedMatches++
			} else {
				await Match.create(matchData)
				newMatches++
			}

			processed++
		} catch (error) {
			logger.error(`Error processing fixture ${fixture.id}:`, error.message)
		}
	}

	logger.info(`Processed ${processed} fixtures: ${newMatches} new, ${updatedMatches} updated`)
}

async function submitFinishedMatches() {
	try {
		const finishedMatches = await Match.find({
			finished: true,
			submittedToContract: false,
			homeScore: { $ne: null },
			awayScore: { $ne: null },
		})

		if (finishedMatches.length === 0) {
			logger.info('No finished matches to submit')
			return
		}

		logger.info(`Found ${finishedMatches.length} finished matches to submit`)

		const balance = await getBalance()
		logger.info(`Oracle wallet balance: ${balance} CELO`)

		if (parseFloat(balance) < 0.01) {
			logger.warn('Low balance! Please fund the oracle wallet.')
		}

		let submitted = 0
		let failed = 0

		for (const match of finishedMatches) {
			try {
				const existsOnChain = await hasOutcome(match.gameweek, match.matchId)

				if (existsOnChain) {
					logger.info(`Result already on-chain for gameweek ${match.gameweek}, match ${match.matchId}`)
					match.submittedToContract = true
					match.submittedAt = new Date()
					await match.save()
					continue
				}

				const txHash = await submitResult(
					match.gameweek,
					match.matchId,
					match.homeScore,
					match.awayScore,
					match.status
				)

				if (txHash) {
					match.submittedToContract = true
					match.submittedAt = new Date()
					match.submissionTxHash = txHash
					await match.save()
					submitted++

					logger.info(`Successfully submitted gameweek ${match.gameweek}, match ${match.matchId}`)
				} else {
					logger.warn(`Skipped gameweek ${match.gameweek}, match ${match.matchId} (already exists)`)
				}

				await new Promise((resolve) => setTimeout(resolve, 2000))
			} catch (error) {
				logger.error(`Failed to submit gameweek ${match.gameweek}, match ${match.matchId}:`, error.message)
				failed++
			}
		}

		logger.info(`Submission summary: ${submitted} submitted, ${failed} failed`)
	} catch (error) {
		logger.error('Error in submitFinishedMatches:', error.message)
		throw error
	}
}

export async function runOracleJob() {
	try {
		logger.info('Starting oracle job...')

		const currentGameweek = await getCurrentGameweek()
		const allFixtures = await fetchAllFixtures()

		await processFixtures(allFixtures)
		await submitFinishedMatches()

		logger.info('Oracle job completed successfully')
	} catch (error) {
		logger.error('Oracle job failed:', error.message)
		throw error
	}
}
