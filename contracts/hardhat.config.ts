import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import 'dotenv/config'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.20',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			viaIR: true,
		},
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},
		localhost: {
			url: 'http://127.0.0.1:8545',
			chainId: 1337,
		},
		'celo-sepolia': {
			url: process.env.CELO_SEPOLIA_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org',
			chainId: 11142220, // Celo Sepolia testnet
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			timeout: 120000, // 2 minutes timeout
		},
		'celo-alfajores': {
			url: 'https://alfajores-forno.celo-testnet.org',
			chainId: 44787, // Celo Alfajores testnet (Chainlink Functions supported)
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			timeout: 120000,
		},
		'sepolia': {
			url: process.env.ETHEREUM_SEPOLIA_RPC_URL || 'https://sepolia.drpc.org',
			chainId: 11155111, // Ethereum Sepolia testnet (Chainlink Functions fully supported)
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			timeout: 120000,
		},
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: 'USD',
	},
	etherscan: {
		apiKey: {
			'celo-sepolia': process.env.CELOSCAN_API_KEY || '',
			'sepolia': process.env.ETHERSCAN_API_KEY || '',
		},
		customChains: [
			{
				network: 'celo-sepolia',
				chainId: 11142220,
				urls: {
					apiURL: 'https://api.celoscan.io/api',
					browserURL: 'https://celoscan.io',
				},
			},
		],
	},
	paths: {
		sources: './contracts',
		tests: './test',
		cache: './cache',
		artifacts: './artifacts',
	},
	typechain: {
		outDir: 'typechain-types',
		target: 'ethers-v6',
	},
}

export default config

