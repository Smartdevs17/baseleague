import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { config } from './config'

// Define Celo Sepolia chain
const celoSepolia = defineChain({
	id: 11142220,
	name: 'Celo Sepolia',
	nativeCurrency: {
		decimals: 18,
		name: 'CELO',
		symbol: 'CELO',
	},
	rpcUrls: {
		default: {
			http: ['https://forno.celo-sepolia.celo-testnet.org'],
		},
	},
	blockExplorers: {
		default: {
			name: 'CeloScan',
			url: 'https://celoscan.io',
		},
	},
	testnet: true,
})

// Configure wagmi with Celo Sepolia
export const wagmiConfig = getDefaultConfig({
	appName: config.app.name,
	projectId: config.wallet.projectId,
	chains: [celoSepolia],
	ssr: false, // If your dApp uses server-side rendering (SSR)
})

// Export chain configuration
export const supportedChains = [celoSepolia]

// Helper to check if connected to correct network
export const isCorrectNetwork = (chainId?: number): boolean => {
	return chainId === celoSepolia.id
}

// Network display info
export const networkInfo = {
	name: 'Celo Sepolia',
	chainId: celoSepolia.id,
	currency: 'CELO',
	explorer: 'https://celoscan.io',
	rpcUrl: config.wallet.rpcUrl,
}

