# 🏆 BaseLeague - Decentralized Football Betting Platform

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Powered by Base](https://img.shields.io/badge/Powered%20by-Base-0052FF?style=for-the-badge&logo=base)](https://base.org/)
[![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Solidity-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Chainlink Functions](https://img.shields.io/badge/Oracle-Chainlink%20Functions-375BD2?style=for-the-badge&logo=chainlink)](https://chain.link/functions)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

> **A decentralized fantasy football prediction platform built on **Base Sepolia Testnet**. Compete head-to-head in Premier League matches, stake ETH, predict outcomes, and win rewards.

## 🎯 Project Overview

BaseLeague is a Web3 fantasy football platform built on Base Sepolia Testnet that enables decentralized match predictions and automated result settlement.

## 📖 User Story

**Alice** wants to bet on an upcoming Arsenal vs Chelsea match. She:
1. Connects her wallet to BaseLeague on Base Sepolia
2. Browses available matches on the Dashboard
3. Creates a new match by selecting the fixture, staking 0.005 ETH, and predicting "Home Win" (Arsenal)
4. Waits for another user to join with the same stake and an opposing prediction

**Bob** sees Alice's open match and:
1. Joins the match by staking 0.005 ETH and predicting "Away Win" (Chelsea)
2. The match automatically moves to "Active Matches" once both bets are placed

**After the match finishes:**
- Chainlink Functions automatically fetches the final score from the FPL API
- The result is stored on-chain via the ResultsConsumer contract
- Winners can settle the match and receive their share of the prize pool
- Alice wins if Arsenal wins, Bob wins if Chelsea wins, or both get refunded if it's a draw

## 🏗️ Architecture

### Smart Contracts (Base Sepolia)

- **`ResultsConsumer.sol`** - Chainlink Functions consumer contract
  - Requests match results from FPL API via Chainlink Functions
  - Stores match outcomes on-chain (gameweek, matchId, homeScore, awayScore, status)
  - Provides on-chain access to match results for settlement

- **`PredictionContract.sol`** - Main betting contract
  - Users place bets by sending ETH directly
  - Groups bets into matches (same gameweek + matchId)
  - Settles matches based on results from ResultsConsumer (Chainlink Functions)
  - Distributes winnings to correct predictions

### Oracle Architecture

**Chainlink Functions Integration:**

BaseLeague uses Chainlink Functions for decentralized oracle services:

- **Chainlink Functions** - Fetches match results from FPL API automatically
  - No backend server needed - fully decentralized
  - Results are fetched on-demand when matches need to be settled
  - All data is stored on-chain via ResultsConsumer contract
  - Requires Chainlink Functions subscription (funded with LINK tokens)

**How it works:**
1. When a match needs to be settled, `PredictionContract` calls `ResultsConsumer.requestResult()`
2. `ResultsConsumer` sends a request to Chainlink Functions
3. Chainlink Functions executes JavaScript code to fetch from FPL API
4. Results are returned and stored on-chain in `ResultsConsumer`
5. `PredictionContract` reads results from `ResultsConsumer` and settles bets


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Wallet with ETH on Base Sepolia testnet
- Chainlink Functions subscription (funded with LINK tokens)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd baseleague

# Install contract dependencies
cd contracts
npm install

# Install API server dependencies
cd ../api-server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

#### 1. Contracts

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env`:
```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://base-sepolia-rpc.publicnode.com
```

### Deployment

#### Deploy Contracts

```bash
cd contracts
npm run deploy:base-sepolia
```

This will deploy:
- ResultsConsumer (Chainlink Functions consumer)
- PredictionContract

Update `.env` files with the deployed addresses.

#### Setup Chainlink Functions

1. **Create Chainlink Functions Subscription:**
   - Visit [Chainlink Functions App](https://functions.chain.link/)
   - Connect your wallet (Base Sepolia network)
   - Create a new subscription
   - Fund it with LINK tokens (at least 2-5 LINK for testing)

2. **Authorize ResultsConsumer Contract:**
   - In the Functions App, add your deployed `ResultsConsumer` contract address as a consumer
   - This allows the contract to make requests

3. **Set Subscription ID:**
   ```bash
   cd contracts
   npm run set-subscription
   ```
   Enter your subscription ID when prompted.

See `contracts/CHAINLINK_SETUP.md` for detailed setup instructions.

#### Start API Server (for fixtures)

The API server proxies FPL API requests and handles CORS:

```bash
cd api-server
npm start
```

The server will run on `http://localhost:3002` and provide:
- `GET /api/fixtures` - All fixtures
- `GET /api/fixtures-upcoming` - Upcoming fixtures only

**Note:** The client is configured to use `http://localhost:3002` in development mode.

## 📁 Project Structure

```
baseleague/
├── contracts/          # Smart contracts (Hardhat)
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   └── test/           # Contract tests
├── api-server/         # Simple API server for FPL API proxy
│   └── server.js       # Express server with CORS
└── client/             # Frontend application
```

## 🔗 Deployed Contracts (Base Sepolia)

- **ResultsConsumer**: `0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592`
- **PredictionContract**: `0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: [Base Sepolia Explorer](https://sepolia.basescan.org)

## 🛠️ Tech Stack

### Smart Contracts
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- ethers.js

### Oracle
- Chainlink Functions
- ResultsConsumer contract


## 📝 Key Features

- ✅ Automatic result submission via oracle
- ✅ Match settlement and prize distribution

## 🔐 Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Keep private keys secure
- Use different keys for different environments
- ResultsConsumer contract must be authorized in Chainlink Functions subscription

## 📚 Documentation

- **Chainlink Functions**: See `contracts/CHAINLINK_SETUP.md` for oracle setup
- **Contracts**: See `contracts/README.md` for contract details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- FPL API for match data
- Base Foundation for testnet infrastructure
- OpenZeppelin for secure contract libraries

