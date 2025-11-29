import { ethers } from 'ethers'
import { logger } from '../utils/logger.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const abiPath = path.join(__dirname, '../../abis/CustomResultsOracle.abi.json')
const CustomResultsOracleABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'))

let provider = null
let wallet = null
let contract = null

export function initializeContract() {
	try {
		const rpcUrl = process.env.CELO_SEPOLIA_RPC_URL
		const privateKey = process.env.ORACLE_PRIVATE_KEY
		const contractAddress = process.env.CUSTOM_RESULTS_ORACLE_ADDRESS

		if (!rpcUrl || !privateKey || !contractAddress) {
			throw new Error('Missing required environment variables: CELO_SEPOLIA_RPC_URL, ORACLE_PRIVATE_KEY, or CUSTOM_RESULTS_ORACLE_ADDRESS')
		}

		provider = new ethers.JsonRpcProvider(rpcUrl)
		wallet = new ethers.Wallet(privateKey, provider)
		contract = new ethers.Contract(contractAddress, CustomResultsOracleABI, wallet)

		logger.info('Contract service initialized')
		logger.info(`Oracle address: ${wallet.address}`)
		logger.info(`Contract address: ${contractAddress}`)

		return { provider, wallet, contract }
	} catch (error) {
		logger.error('Failed to initialize contract service:', error.message)
		throw error
	}
}

export async function submitResult(gameweek, matchId, homeScore, awayScore, status) {
	try {
		if (!contract) {
			initializeContract()
		}

		const hasOutcome = await contract.hasOutcome(gameweek, matchId)
		if (hasOutcome) {
			logger.warn(`Result already exists for gameweek ${gameweek}, match ${matchId}`)
			return null
		}

		logger.info(`Submitting result: Gameweek ${gameweek}, Match ${matchId}, Score: ${homeScore}-${awayScore}, Status: ${status}`)

		const tx = await contract.submitResult(gameweek, matchId, homeScore, awayScore, status)

		logger.info(`Transaction submitted: ${tx.hash}`)
		logger.info('Waiting for confirmation...')

		const receipt = await tx.wait()

		logger.info(`Result submitted successfully! Tx: ${receipt.hash}, Block: ${receipt.blockNumber}`)

		return receipt.hash
	} catch (error) {
		logger.error(`Error submitting result for gameweek ${gameweek}, match ${matchId}:`, error.message)

		if (error.reason) {
			logger.error(`Reason: ${error.reason}`)
		}

		if (error.code === 'CALL_EXCEPTION') {
			logger.error('This might be an authorization issue. Check if oracle address is authorized.')
		}

		throw error
	}
}

export async function hasOutcome(gameweek, matchId) {
	try {
		if (!contract) {
			initializeContract()
		}

		return await contract.hasOutcome(gameweek, matchId)
	} catch (error) {
		logger.error(`Error checking outcome for gameweek ${gameweek}, match ${matchId}:`, error.message)
		throw error
	}
}

export async function getOutcome(gameweek, matchId) {
	try {
		if (!contract) {
			initializeContract()
		}

		const outcome = await contract.getOutcome(gameweek, matchId)
		return {
			homeScore: Number(outcome.homeScore),
			awayScore: Number(outcome.awayScore),
			status: outcome.status,
			timestamp: Number(outcome.timestamp),
			exists: outcome.exists,
		}
	} catch (error) {
		logger.error(`Error getting outcome for gameweek ${gameweek}, match ${matchId}:`, error.message)
		throw error
	}
}

export async function getBalance() {
	try {
		if (!wallet) {
			initializeContract()
		}

		const balance = await provider.getBalance(wallet.address)
		return ethers.formatEther(balance)
	} catch (error) {
		logger.error('Error getting balance:', error.message)
		throw error
	}
}
