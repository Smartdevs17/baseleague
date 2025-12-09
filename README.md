# 🏆 BaseLeague - Decentralized Football Betting Platform

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Powered by Base](https://img.shields.io/badge/Powered%20by-Base-0052FF?style=for-the-badge&logo=base)](https://base.org/)
[![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Solidity-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Chainlink Functions](https://img.shields.io/badge/Oracle-Chainlink%20Functions-375BD2?style=for-the-badge&logo=chainlink)](https://chain.link/functions)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

> **A decentralized fantasy football prediction platform built on Base Sepolia Testnet.** Compete head-to-head in Premier League matches, stake ETH, predict outcomes, and win rewards. Backend now handles results (FPL fallback); Chainlink UI requests are disabled, but contracts remain compatible.

## 🎯 Project Overview
BaseLeague is a Web3 fantasy football platform on Base Sepolia that enables decentralized match predictions and automated result settlement. Fantasy-style features (squad, transfers, chips, mini-leagues) are planned and marked "Coming Soon" in the UI.

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
- Backend fetches the final score (FPL fallback) and stores the result via the ResultsConsumer-compatible flow
- Result is used to settle via `PredictionContract`
- Winners receive their share of the prize pool
- If only one bettor (unmatched), owner can refund in full (no platform fee)

## 🏗️ Architecture
### Smart Contracts (Base Sepolia)
- **`ResultsConsumer.sol`** - Chainlink Functions consumer contract
  - Can request match results from FPL API via Chainlink Functions (UI flow disabled; backend handles results)
  - Stores match outcomes on-chain (gameweek, matchId, homeScore, awayScore, status)
- **`PredictionContract.sol`** - Main betting contract
  - Users place bets with ETH
  - Groups bets by gameweek + matchId
  - Settles matches from on-chain outcome
  - Owner can refund unmatched single-sided bets in full (no platform fee)

### Oracle / Backend Flow
- Primary (current): backend fetches results (FPL) → sets result → calls `settleMatch`.
- Chainlink Functions remains compatible but is not invoked from the UI.

## 🚀 Quick Start
### Prerequisites
- Node.js 18+ and npm
- Wallet with ETH on Base Sepolia testnet
- Git

### Installation
```bash
git clone <repository-url>
cd baseleague

# Contracts
cd contracts && npm install

# Backend
cd ../backend && npm install

# Client
cd ../client && npm install
```

### Configuration
#### Contracts
```bash
cd contracts
cp .env.example .env
```
Fill `PRIVATE_KEY`, `BASE_SEPOLIA_RPC_URL`.

#### Backend
```bash
cd backend
cp .env.example .env
```
Set `PRIVATE_KEY`, `OWNER_ADDRESS`, `PREDICTION_CONTRACT_ADDRESS`, `RESULTS_CONSUMER_ADDRESS`, `RPC_URL`.

#### Client
```bash
cd client
cp .env.example .env
```
Set contract addresses and WalletConnect project ID.

### Deployment
```bash
cd contracts
npm run deploy:base-sepolia
```
Updates `.env` files with deployed addresses.

### Backend Server
```bash
cd backend
npm start
```
Serves fixtures/results at `http://localhost:3002` in development.

## 📁 Project Structure
```
baseleague/
├── contracts/   # Solidity, Hardhat, scripts, tests
├── backend/     # Express server, settlement/cron scripts
└── client/      # React frontend (Vite)
```

## 🔗 Deployed Contracts (Base Sepolia)
- **ResultsConsumer**: `0xA7C6A76A73Fe9CB5Bb508e0277e064678C2d6D8D`
- **PredictionContract**: `0xd3A3f2c96b8a5390D29893184cc236b2b5767e43`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: https://sepolia.basescan.org

## 🛠️ Tech Stack
- Solidity 0.8.20, Hardhat, OpenZeppelin, ethers.js
- Backend: Node/Express
- Frontend: React, Vite, Wagmi, RainbowKit
- Oracle-compatible: Chainlink Functions (UI disabled; backend handles results)

## 📝 Key Features
### Current
- Head-to-head match betting with ETH stakes
- Backend result fetch (FPL fallback) → settlement
- Refund unmatched bets (no platform fee)
- Leaderboard tracking

### Planned / Coming Soon (Fantasy & Social)
- Squad Selection: 15 players (2 GK, 5 DEF, 5 MID, 3 FWD), 100.0M budget
- Transfers: 1 free transfer per gameweek; extra transfers cost -4 points
- Chips: Wildcard (2/season), Free Hit (1), Triple Captain (1), Bench Boost (1)
- Gameweek Management: set XI, captain/vice; points from goals/assists/clean sheets/saves/bonus; transfer hits
- Mini-Leagues: private leagues with invite link/code; classic & H2H formats
- Player Stats & History: points, price changes, GW history, transfer log
- NFTs (Planned): optional collectibles for achievements (weekly winner, top %, clean-sheet streaks); opt-in, no paywall
- Identity/Badge (Planned): optional profile badge, no PII

## How Fantasy Flow Would Work (Planned)
1) Pick squad (15 players, 100.0M cap); store lineup.
2) Each GW: set XI + captain/vice; apply chips; lineup locks at first kickoff.
3) Scoring: goals, assists, clean sheets, saves, bonus; negatives for cards/own goals; -4 per extra transfer.
4) Settlement: backend ingests official stats, computes GW points, updates leagues.
5) Rewards (planned): weekly winner badges/NFTs; optional on-chain proof; fantasy mode no staking required.

## Backend Settlement & Refund Script (Owner)
```bash
cd backend
OWNER_ADDRESS=0x575109e921c6d6a1cb7ca60be0191b10950afa6c \
PRIVATE_KEY=<owner_key> \
RPC_URL=<rpc> \
PREDICTION_CONTRACT_ADDRESS=0xd3A3f2c96b8a5390D29893184cc236b2b5767e43 \
RESULTS_CONSUMER_ADDRESS=0xA7C6A76A73Fe9CB5Bb508e0277e064678C2d6D8D \
node scripts/settle-and-refund.js
```

## 🔐 Security Notes
- `.env` files are ignored (`backend/.env`, `client/.env`, `contracts/.env`).
- Keep private keys out of the repo; use env vars.
- If re-enabling Chainlink UI flows, ensure subscription/LINK funding and authorization.

## 📚 Documentation
- Chainlink setup: `contracts/CHAINLINK_SETUP.md`
- Contracts: `contracts/README.md`

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch
3. Commit and push changes
4. Open a PR

## 📄 License
MIT

## 🙏 Acknowledgments
- FPL API for match data
- Base Foundation for testnet infrastructure
- OpenZeppelin for secure contract libraries
