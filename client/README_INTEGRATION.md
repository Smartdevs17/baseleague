# BaseLeague Frontend - Integration Guide

## 🎉 What's Been Built

A complete, production-ready frontend for BaseLeague with:

### ✅ Core Features
- **Wallet Connection**: Full RainbowKit integration for MetaMask, Coinbase Wallet, etc.
- **Dashboard**: View all open, active, and completed matches
- **Create Match**: Select fixtures and create challenges with custom stakes
- **My Matches**: Track your performance with stats dashboard
- **Leaderboard**: Top performers ranked by wins and earnings
- **Match Cards**: Beautiful UI showing fixtures, stakes, predictions, and status
- **Modals**: Create and join match flows with validation
- **Toast Notifications**: Transaction feedback and status updates

### 🎨 Design System
- Base blue as primary brand color (#0052FF)
- Dark theme with neon accents
- Success green for wins, red for errors
- Smooth animations and hover effects
- Responsive layout for all screen sizes

### 📦 Tech Stack
- React + Vite + TypeScript
- Tailwind CSS for styling
- Wagmi + RainbowKit for Web3
- Radix UI components
- React Router for navigation
- TanStack Query for data fetching

---

## 🔗 Integration Steps

### 1. Smart Contract Configuration

**File:** `src/lib/contracts.ts`

Replace the placeholder addresses with your deployed contracts:

```typescript
export const BLEAG_TOKEN_ADDRESS = '0xYourDeployedBLEAGAddress';
export const MATCH_MANAGER_ADDRESS = '0xYourDeployedMatchManagerAddress';
```

### 2. WalletConnect Project ID

**File:** `src/lib/wagmi.ts`

Get a free Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/):

```typescript
export const config = getDefaultConfig({
  appName: 'BaseLeague',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace this
  chains: [baseSepolia],
  ssr: false,
});
```

### 3. Backend API Integration

Currently using mock data. Replace with your backend endpoints:

**Dashboard** (`src/pages/Dashboard.tsx`):
- Fetch open/active matches from your API
- Replace `mockMatches` with real contract/API calls

**Create Match** (`src/pages/CreateMatch.tsx`):
- Fetch upcoming fixtures from API-Football
- Replace `mockFixtures` with real fixture data
- Implement `handleCreateMatch` to call smart contract

**My Matches** (`src/pages/MyMatches.tsx`):
- Fetch user's matches from contract
- Calculate real stats from on-chain data

**Leaderboard** (`src/pages/Leaderboard.tsx`):
- Fetch top users from your backend
- Real-time stats from contract events

### 4. Smart Contract Integration

Add contract interaction hooks in components:

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { MATCH_MANAGER_ABI, MATCH_MANAGER_ADDRESS } from '@/lib/contracts';

// Create Match
const { writeContract } = useWriteContract();

const createMatch = async (stake: string, fixtureId: number, prediction: number) => {
  await writeContract({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'createMatch',
    args: [parseEther(stake), fixtureId, prediction],
  });
};

// Join Match
const joinMatch = async (matchId: string, prediction: number) => {
  await writeContract({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'joinMatch',
    args: [matchId, prediction],
  });
};

// Read Match Data
const { data: match } = useReadContract({
  address: MATCH_MANAGER_ADDRESS,
  abi: MATCH_MANAGER_ABI,
  functionName: 'getMatch',
  args: [matchId],
});
```

### 5. Token Approval Flow

Before creating/joining matches, users must approve token spending:

```typescript
import { BLEAG_TOKEN_ABI, BLEAG_TOKEN_ADDRESS } from '@/lib/contracts';

const approveTokens = async (amount: string) => {
  await writeContract({
    address: BLEAG_TOKEN_ADDRESS,
    abi: BLEAG_TOKEN_ABI,
    functionName: 'approve',
    args: [MATCH_MANAGER_ADDRESS, parseEther(amount)],
  });
};
```

### 6. Event Listening

Listen for contract events to update UI in real-time:

```typescript
import { useWatchContractEvent } from 'wagmi';

useWatchContractEvent({
  address: MATCH_MANAGER_ADDRESS,
  abi: MATCH_MANAGER_ABI,
  eventName: 'MatchCreated',
  onLogs(logs) {
    // Refresh matches list
    refetchMatches();
  },
});
```

---

## 🔧 What You Need to Build Separately

### Backend Oracle Service (Node.js)
- Integrate API-Football for live match results
- Monitor active matches
- Sign and submit settlement transactions
- Store match history

### Smart Contracts (Solidity)
- Deploy BLEAG ERC20 token to Base Sepolia
- Deploy MatchManager contract
- Set up oracle wallet permissions
- Test all functions (create, join, settle)

### API Endpoints
Your backend should expose:
- `GET /fixtures` - Upcoming football matches
- `GET /matches` - All platform matches
- `GET /matches/:id` - Specific match details
- `GET /user/:address/matches` - User's matches
- `GET /leaderboard` - Top players

---

## 🚀 Running the App

```bash
npm install
npm run dev
```

The app will run on `http://localhost:8080`

---

## 📝 Key Files to Modify

1. **`src/lib/contracts.ts`** - Contract addresses and ABIs
2. **`src/lib/wagmi.ts`** - WalletConnect config
3. **`src/pages/Dashboard.tsx`** - Match listing and joining
4. **`src/pages/CreateMatch.tsx`** - Match creation flow
5. **`src/pages/MyMatches.tsx`** - User stats and history
6. **`src/types/match.ts`** - Type definitions

---

## 🎯 Testing Checklist

- [ ] Connect wallet on Base Sepolia
- [ ] Get test BLEAG tokens from faucet
- [ ] Approve token spending
- [ ] Create a match
- [ ] Join a match from another wallet
- [ ] Wait for match settlement
- [ ] Verify winner receives tokens
- [ ] Check leaderboard updates

---

## 📚 Additional Resources

- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://rainbowkit.com/)
- [Base Sepolia Testnet](https://sepolia.base.org/)
- [API-Football](https://www.api-football.com/)
- [Viem Docs](https://viem.sh/)

---

## 💡 Pro Tips

1. **Gas Optimization**: Batch approval and staking in one transaction
2. **Error Handling**: Add try-catch blocks for all contract calls
3. **Loading States**: Show spinners during transactions
4. **Transaction Receipts**: Wait for confirmations before updating UI
5. **Real-time Updates**: Poll contract every 10-15 seconds or use events
6. **Mobile Testing**: Test wallet connection on mobile browsers

---

## 🐛 Troubleshooting

**Wallet won't connect?**
- Make sure you have the WalletConnect Project ID set
- Check you're on Base Sepolia network

**Transactions failing?**
- Verify contract addresses are correct
- Ensure you have approved sufficient tokens
- Check you have ETH for gas fees

**UI not updating?**
- Implement proper refetching after transactions
- Add event listeners for real-time updates
- Clear cache if needed

---

Built with ❤️ for BaseLeague
