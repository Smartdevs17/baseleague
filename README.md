# 🏆 BaseLeague - Decentralized Football Betting Platform

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Powered by Base](https://img.shields.io/badge/Powered%20by-Base-0052FF?style=for-the-badge&logo=base)](https://base.org/)
[![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Solidity-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Database MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
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
- The backend oracle service fetches the final score from the FPL API
- The result is submitted to the smart contract
- Winners can settle the match and receive their share of the prize pool
- Alice wins if Arsenal wins, Bob wins if Chelsea wins, or both get refunded if it's a draw

## 🏗️ Architecture

### Smart Contracts (Base Sepolia)

- **`CustomResultsOracle.sol`** - Custom oracle contract that stores match results on-chain
  - Authorized oracles can submit match results
  - Owner can update results for corrections
  - Stores: gameweek, matchId, homeScore, awayScore, status

- **`PredictionContract.sol`** - Main betting contract
  - Users place bets by sending ETH directly
  - Groups bets into matches (same gameweek + matchId)
  - Settles matches based on results from CustomResultsOracle
  - Distributes winnings to correct predictions

### Backend Oracle Service

**Why a Custom Oracle?**

Base Sepolia testnet provides a reliable environment for decentralized applications. To work on Base Sepolia, we built:

- **Custom Oracle Contract** - On-chain storage for match results
- **Backend Oracle Service** - Node.js service that:
  - Polls FPL API every 5 minutes for match results
  - Stores matches in MongoDB
  - Automatically submits finished matches to the CustomResultsOracle contract
  - Tracks submissions to prevent duplicates

**Tech Stack:**
- Node.js with Express
- MongoDB with Mongoose
- ethers.js for contract interactions
- node-cron for scheduled jobs
- FPL API for match data


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Wallet with ETH on Base Sepolia testnet
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd baseleague

# Install contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
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

#### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/baseleague
BASE_SEPOLIA_RPC_URL=https://base-sepolia-rpc.publicnode.com
CUSTOM_RESULTS_ORACLE_ADDRESS=0x816B6a402cC26F0D5B3b28794061C75BC673490f
PREDICTION_CONTRACT_ADDRESS=0xfBa3E093ad88Ad56abd90956Bc383898bb85e0b2
ORACLE_PRIVATE_KEY=your_oracle_private_key_here
```

### Deployment

#### Deploy Contracts

```bash
cd contracts
npm run deploy:base-sepolia
```

This will deploy:
- CustomResultsOracle
- PredictionContract

Update `.env` files with the deployed addresses.

#### Start Backend Oracle Service

```bash
cd backend
npm start
```

The service will:
- Connect to MongoDB
- Poll FPL API every 5 minutes
- Submit finished matches to the contract

## 📁 Project Structure

```
baseleague/
├── contracts/          # Smart contracts (Hardhat)
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   └── test/           # Contract tests
├── backend/            # Oracle service
│   ├── src/
│   │   ├── services/   # FPL API, contract, oracle services
│   │   ├── models/     # MongoDB models
│   │   └── scripts/    # Test scripts
│   └── abis/           # Contract ABIs
└── client/             # Frontend application
```

## 🔗 Deployed Contracts (Base Sepolia)

- **CustomResultsOracle**: `0x816B6a402cC26F0D5B3b28794061C75BC673490f`
- **PredictionContract**: `0xfBa3E093ad88Ad56abd90956Bc383898bb85e0b2`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: [Base Sepolia Explorer](https://sepolia.basescan.org)

## 🛠️ Tech Stack

### Smart Contracts
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- ethers.js

### Backend
- Node.js
- MongoDB + Mongoose
- ethers.js
- node-cron
- axios


## 📝 Key Features

- ✅ Automatic result submission via oracle
- ✅ Match settlement and prize distribution

## 🔐 Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Keep private keys secure
- Use different keys for different environments
- Oracle wallet must be authorized in CustomResultsOracle contract

## 📚 Documentation

- **Backend**: See `backend/README.md` for oracle service setup
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

