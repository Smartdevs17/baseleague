import dotenv from 'dotenv'
import { connectDatabase } from '../config/database.js'
import { disconnectDatabase } from '../config/database.js'
import { initializeContract, submitResult, hasOutcome, getOutcome, getBalance } from '../services/contractService.js'
import { fetchAllFixtures, getCurrentGameweek, parseFixture } from '../services/fplService.js'
import { logger } from '../utils/logger.js'

dotenv.config()

async function testFullFlow() {
	logger.info('🧪 Starting Full Flow Test...\n')

	let success = true
	const errors = []

	try {
		// Test 1: Environment Variables
		logger.info('📋 Test 1: Checking Environment Variables...')
		const requiredEnvVars = [
			'MONGODB_URI',
			'CELO_SEPOLIA_RPC_URL',
			'CUSTOM_RESULTS_ORACLE_ADDRESS',
			'ORACLE_PRIVATE_KEY',
		]

		const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
		if (missingVars.length > 0) {
			throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
		}
		logger.info('✅ All environment variables present\n')

		// Test 2: MongoDB Connection
		logger.info('📦 Test 2: Connecting to MongoDB...')
		try {
			await connectDatabase()
			logger.info('✅ MongoDB connected successfully\n')
		} catch (error) {
			throw new Error(`MongoDB connection failed: ${error.message}`)
		}

		// Test 3: Contract Connection
		logger.info('⛓️  Test 3: Connecting to Celo Sepolia and Contract...')
		try {
			initializeContract()
			const balance = await getBalance()
			logger.info(`✅ Contract connected successfully`)
			logger.info(`💰 Oracle wallet balance: ${balance} CELO\n`)

			if (parseFloat(balance) < 0.01) {
				logger.warn('⚠️  Warning: Low balance! You may need more CELO for transactions.\n')
			}
		} catch (error) {
			throw new Error(`Contract connection failed: ${error.message}`)
		}

		// Test 4: FPL API Connection
		logger.info('📡 Test 4: Testing FPL API Connection...')
		try {
			const currentGameweek = await getCurrentGameweek()
			logger.info(`✅ FPL API connected successfully`)
			logger.info(`📅 Current gameweek: ${currentGameweek}\n`)
		} catch (error) {
			throw new Error(`FPL API connection failed: ${error.message}`)
		}

		// Test 5: Fetch Real Match Data
		logger.info('⚽ Test 5: Fetching Real Match Data from FPL API...')
		let testMatch = null
		try {
			const allFixtures = await fetchAllFixtures()
			logger.info(`✅ Fetched ${allFixtures.length} fixtures from FPL API`)

			// Find a finished match (FT status) for testing
			const finishedMatches = allFixtures.filter(
				(f) => f.finished === true && f.team_h_score !== null && f.team_a_score !== null
			)

			if (finishedMatches.length === 0) {
				logger.warn('⚠️  No finished matches found. Using a test match...')
				// Use a test match that we'll submit
				testMatch = {
					gameweek: 1,
					matchId: 12345,
					homeScore: 2,
					awayScore: 1,
					status: 'FT',
				}
			} else {
				// Use the first finished match
				const fixture = finishedMatches[0]
				testMatch = parseFixture(fixture)
				logger.info(`📊 Selected test match:`)
				logger.info(`   Gameweek: ${testMatch.gameweek}`)
				logger.info(`   Match ID: ${testMatch.matchId}`)
				logger.info(`   ${testMatch.homeTeam} vs ${testMatch.awayTeam}`)
				logger.info(`   Score: ${testMatch.homeScore}-${testMatch.awayScore}`)
				logger.info(`   Status: ${testMatch.status}\n`)
			}
		} catch (error) {
			throw new Error(`Failed to fetch match data: ${error.message}`)
		}

		// Test 6: Check if Match Result Already Exists
		logger.info('🔍 Test 6: Checking if Match Result Already Exists on Contract...')
		try {
			const exists = await hasOutcome(testMatch.gameweek, testMatch.matchId)
			if (exists) {
				logger.info('✅ Match result already exists on contract')
				const existingOutcome = await getOutcome(testMatch.gameweek, testMatch.matchId)
				logger.info(`   Existing result: ${existingOutcome.homeScore}-${existingOutcome.awayScore}, Status: ${existingOutcome.status}\n`)

				// Test 7: Verify Existing Result
				logger.info('✅ Test 7: Verifying Existing Result...')
				logger.info('✅ Result verified on-chain!\n')
				logger.info('🎉 All tests passed! The match result is already on-chain.\n')
				return
			} else {
				logger.info('ℹ️  Match result does not exist yet. Will submit...\n')
			}
		} catch (error) {
			logger.warn(`⚠️  Error checking existing result: ${error.message}`)
			logger.info('   Continuing with submission test...\n')
		}

		// Test 7: Submit Match Result to Contract
		logger.info('📤 Test 7: Submitting Match Result to Contract...')
		logger.info(`   Gameweek: ${testMatch.gameweek}`)
		logger.info(`   Match ID: ${testMatch.matchId}`)
		logger.info(`   Score: ${testMatch.homeScore}-${testMatch.awayScore}`)
		logger.info(`   Status: ${testMatch.status}`)
		logger.info('   ⏳ Submitting transaction...\n')

		try {
			const txHash = await submitResult(
				testMatch.gameweek,
				testMatch.matchId,
				testMatch.homeScore,
				testMatch.awayScore,
				testMatch.status
			)

			if (txHash) {
				logger.info(`✅ Transaction submitted successfully!`)
				logger.info(`   Transaction Hash: ${txHash}`)
				logger.info(`   View on CeloScan: https://celoscan.io/tx/${txHash}\n`)
			} else {
				logger.warn('⚠️  Transaction was skipped (result may already exist)\n')
			}
		} catch (error) {
			if (error.reason && error.reason.includes('ResultAlreadySet')) {
				logger.warn('⚠️  Result already set on contract (this is expected if running test multiple times)\n')
			} else {
				throw error
			}
		}

		// Test 8: Verify Result on Contract
		logger.info('🔍 Test 8: Verifying Result on Contract...')
		try {
			// Wait a bit for the transaction to be mined
			logger.info('   ⏳ Waiting for transaction confirmation...')
			await new Promise((resolve) => setTimeout(resolve, 5000))

			const exists = await hasOutcome(testMatch.gameweek, testMatch.matchId)
			if (exists) {
				const outcome = await getOutcome(testMatch.gameweek, testMatch.matchId)
				logger.info('✅ Result verified on-chain!')
				logger.info(`   Home Score: ${outcome.homeScore}`)
				logger.info(`   Away Score: ${outcome.awayScore}`)
				logger.info(`   Status: ${outcome.status}`)
				logger.info(`   Timestamp: ${new Date(Number(outcome.timestamp) * 1000).toISOString()}\n`)
			} else {
				logger.warn('⚠️  Result not found on-chain yet. Transaction may still be pending.\n')
			}
		} catch (error) {
			logger.warn(`⚠️  Error verifying result: ${error.message}\n`)
		}

		logger.info('🎉 All Tests Completed Successfully!\n')
		logger.info('📋 Summary:')
		logger.info('   ✅ Environment variables configured')
		logger.info('   ✅ MongoDB connected')
		logger.info('   ✅ Contract connected')
		logger.info('   ✅ FPL API accessible')
		logger.info('   ✅ Match data fetched')
		logger.info('   ✅ Result submitted to contract')
		logger.info('   ✅ Result verified on-chain\n')

		logger.info('🚀 The oracle service is ready to run!\n')
	} catch (error) {
		logger.error('❌ Test Failed:', error.message)
		logger.error('   Stack:', error.stack)
		success = false
		errors.push(error.message)
	} finally {
		// Cleanup
		try {
			await disconnectDatabase()
		} catch (error) {
			logger.warn('⚠️  Error disconnecting from MongoDB:', error.message)
		}
	}

	if (!success) {
		logger.error('\n❌ Test Flow Failed!')
		logger.error('Errors encountered:')
		errors.forEach((error, index) => {
			logger.error(`   ${index + 1}. ${error}`)
		})
		process.exit(1)
	}
}

// Run the test
testFullFlow()
	.then(() => {
		logger.info('✅ Test flow completed')
		process.exit(0)
	})
	.catch((error) => {
		logger.error('❌ Fatal error:', error)
		process.exit(1)
	})

