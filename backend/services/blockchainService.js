import { ethers } from 'ethers'
import { config } from '../config/index.js'

// Initialize provider and signer (only if private key is provided)
let provider = null
let signer = null

/**
 * Initialize blockchain connection
 */
export function initializeBlockchain() {
	if (!config.blockchain.privateKey) {
		console.warn('⚠️  PRIVATE_KEY not set - blockchain features will be limited')
		return { provider: null, signer: null }
	}

	try {
		provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl)
		signer = new ethers.Wallet(config.blockchain.privateKey, provider)
		console.log('✅ Blockchain connection initialized')
		console.log('   Signer address:', signer.address)
		return { provider, signer }
	} catch (error) {
		console.warn('⚠️  Failed to initialize blockchain connection:', error.message)
		console.warn('   Manual result setting will not be available')
		return { provider: null, signer: null }
	}
}

// Initialize on module load
const { provider: initializedProvider, signer: initializedSigner } = initializeBlockchain()
export { initializedProvider as provider, initializedSigner as signer }

/**
 * Get ResultsConsumer contract instance
 * @param {ethers.Signer | ethers.Provider} signerOrProvider
 * @returns {ethers.Contract}
 */
export function getResultsConsumerContract(signerOrProvider) {
	const abi = [
		'function setResultManually(uint256 gameweek, uint256 matchId, uint8 homeScore, uint8 awayScore, string memory status) external',
		'function hasOutcome(uint256 gameweek, uint256 matchId) external view returns (bool)',
		'function getOutcome(uint256 gameweek, uint256 matchId) external view returns (tuple(uint8 homeScore, uint8 awayScore, string status, uint256 timestamp, bool exists))',
		'function owner() external view returns (address)',
	]

	return new ethers.Contract(config.blockchain.resultsConsumerAddress, abi, signerOrProvider)
}

/**
 * Set match result manually (owner only)
 * @param {number} gameweek
 * @param {number} matchId
 * @param {number} homeScore
 * @param {number} awayScore
 * @param {string} status
 * @returns {Promise<{transactionHash: string, blockNumber: number, result: object}>}
 */
export async function setResultManually(gameweek, matchId, homeScore, awayScore, status) {
	if (!signer) {
		throw new Error('Blockchain signer not available. Set PRIVATE_KEY environment variable.')
	}

	const resultsConsumer = getResultsConsumerContract(signer)

	// Check if result already exists
	const hasOutcome = await resultsConsumer.hasOutcome(gameweek, matchId)
	if (hasOutcome) {
		const existing = await resultsConsumer.getOutcome(gameweek, matchId)
		throw new Error(`Result already exists for Gameweek ${gameweek}, Match ${matchId}`, {
			cause: {
				existing: {
					homeScore: Number(existing.homeScore),
					awayScore: Number(existing.awayScore),
					status: existing.status,
					timestamp: Number(existing.timestamp),
				},
			},
		})
	}

	// Call setResultManually
	const tx = await resultsConsumer.setResultManually(
		BigInt(gameweek),
		BigInt(matchId),
		Number(homeScore),
		Number(awayScore),
		status,
		{
			gasLimit: 300000,
		}
	)

	console.log(`   Transaction sent: ${tx.hash}`)
	console.log(`   Waiting for confirmation...`)

	const receipt = await tx.wait()
	console.log(`✅ Result set successfully in block ${receipt.blockNumber}`)

	// Verify the result was set
	const outcome = await resultsConsumer.getOutcome(gameweek, matchId)

	return {
		transactionHash: tx.hash,
		blockNumber: receipt.blockNumber,
		result: {
			gameweek: Number(gameweek),
			matchId: Number(matchId),
			homeScore: Number(outcome.homeScore),
			awayScore: Number(outcome.awayScore),
			status: outcome.status,
			timestamp: Number(outcome.timestamp),
		},
	}
}

/**
 * Check if a match result exists
 * @param {number} gameweek
 * @param {number} matchId
 * @returns {Promise<{hasOutcome: boolean, result?: object}>}
 */
export async function checkResult(gameweek, matchId) {
	if (!provider) {
		throw new Error('Blockchain provider not available')
	}

	const resultsConsumer = getResultsConsumerContract(provider)
	const hasOutcome = await resultsConsumer.hasOutcome(gameweek, matchId)

	if (hasOutcome) {
		const outcome = await resultsConsumer.getOutcome(gameweek, matchId)
		return {
			hasOutcome: true,
			result: {
				gameweek: Number(gameweek),
				matchId: Number(matchId),
				homeScore: Number(outcome.homeScore),
				awayScore: Number(outcome.awayScore),
				status: outcome.status,
				timestamp: Number(outcome.timestamp),
			},
		}
	}

	return {
		hasOutcome: false,
		message: `No result found for Gameweek ${gameweek}, Match ${matchId}`,
	}
}

