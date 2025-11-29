import ResultsConsumerABI from '@/contracts/ResultsConsumer.abi.json'
import PredictionContractABI from '@/contracts/PredictionContract.abi.json'
import TokenABI from '@/contracts/token.json'
import { config } from './config'

// Contract addresses
export const CONTRACTS = {
	RESULTS_CONSUMER: (config.contracts.resultsConsumer as `0x${string}`) || '0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592', // Chainlink ResultsConsumer
	PREDICTION_CONTRACT: (config.contracts.predictionContract as `0x${string}`) || '0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB',
	BLEAG_TOKEN: (config.contracts.bleagToken as `0x${string}`) || '0x1234567890123456789012345678901234567890',
} as const

// Contract ABIs
export const ABIS = {
	RESULTS_CONSUMER: ResultsConsumerABI,
	PREDICTION_CONTRACT: PredictionContractABI,
	BLEAG_TOKEN: TokenABI,
} as const

// Network configuration
export const NETWORK = {
	name: 'Base Sepolia',
	chainId: 84532,
	rpcUrl: config.wallet.rpcUrl,
	explorer: 'https://sepolia.basescan.org',
} as const

// Prediction types (matches contract enum)
export enum Prediction {
	HOME_WIN = 0,
	DRAW = 1,
	AWAY_WIN = 2,
}

// Match status (matches contract enum)
export enum MatchStatus {
	OPEN = 0,
	ACTIVE = 1,
	COMPLETED = 2,
}

// Outcome type from ResultsConsumer
export interface MatchOutcome {
	exists: boolean
	homeScore: bigint
	awayScore: bigint
	status: string
	timestamp: bigint
}

// Bet type from PredictionContract
export interface Bet {
	player: `0x${string}`
	amount: bigint
	prediction: Prediction
	isWinner: boolean
	isSettled: boolean
}

// Helper function to get prediction label
export const getPredictionLabel = (prediction: Prediction): string => {
	switch (prediction) {
		case Prediction.HOME_WIN:
			return 'Home Win'
		case Prediction.DRAW:
			return 'Draw'
		case Prediction.AWAY_WIN:
			return 'Away Win'
		default:
			return 'Unknown'
	}
}

// Helper function to get match status label
export const getMatchStatusLabel = (status: MatchStatus): string => {
	switch (status) {
		case MatchStatus.OPEN:
			return 'Open'
		case MatchStatus.ACTIVE:
			return 'Active'
		case MatchStatus.COMPLETED:
			return 'Completed'
		default:
			return 'Unknown'
	}
}

// Helper function to determine match outcome from scores
export const getMatchOutcome = (homeScore: bigint, awayScore: bigint): Prediction => {
	if (homeScore > awayScore) {
		return Prediction.HOME_WIN
	} else if (awayScore > homeScore) {
		return Prediction.AWAY_WIN
	} else {
		return Prediction.DRAW
	}
}

