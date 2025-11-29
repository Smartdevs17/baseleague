import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { config } from './config'

// Define Base Sepolia chain
const baseSepolia = defineChain({
	id: 84532,
	name: 'Base Sepolia',
	nativeCurrency: {
		decimals: 18,
		name: 'ETH',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: {
			http: ['https://base-sepolia-rpc.publicnode.com'],
		},
	},
	blockExplorers: {
		default: {
			name: 'BaseScan',
			url: 'https://sepolia.basescan.org',
		},
	},
	testnet: true,
})

// Configure wagmi with Base Sepolia
export const wagmiConfig = getDefaultConfig({
	appName: config.app.name,
	projectId: config.wallet.projectId,
	chains: [baseSepolia],
	ssr: false, // If your dApp uses server-side rendering (SSR)
})

// Export chain configuration
export const supportedChains = [baseSepolia]

// Helper to check if connected to correct network
export const isCorrectNetwork = (chainId?: number): boolean => {
	return chainId === baseSepolia.id
}

// Network display info
export const networkInfo = {
	name: 'Base Sepolia',
	chainId: baseSepolia.id,
	currency: 'ETH',
	explorer: 'https://sepolia.basescan.org',
	rpcUrl: config.wallet.rpcUrl,
}

