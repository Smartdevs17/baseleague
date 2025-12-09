import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure we always load the backend .env even if the working directory differs
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const config = {
	server: {
		port: process.env.PORT || 3002,
	},

	fpl: {
		baseUrl: 'https://fantasy.premierleague.com/api',
	},

	blockchain: {
		resultsConsumerAddress: process.env.RESULTS_CONSUMER_ADDRESS || '0x5D8F251D046819757054673CA6bB143f36B389FF',
		predictionContractAddress: process.env.PREDICTION_CONTRACT_ADDRESS || '0x3bf17469296eE3dADE758cD2F82F76f76EF14d40',
		rpcUrl: process.env.RPC_URL || process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia-rpc.publicnode.com',
		privateKey: process.env.PRIVATE_KEY, // Required for manual result setting
		ownerAddress: process.env.OWNER_ADDRESS || '0x575109e921c6d6a1cb7ca60be0191b10950afa6c',
	},
}

