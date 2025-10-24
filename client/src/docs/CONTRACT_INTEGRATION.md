# Contract Integration Guide

This document explains how to use the smart contract integration in the BaseLeague application.

## Overview

The application now includes full smart contract integration with:
- **BLEAG Token Contract**: ERC20 token for staking and rewards
- **Match Manager Contract**: Handles match creation, joining, and settlement

## File Structure

```
src/
├── contracts/
│   ├── match_manager.json    # Match Manager ABI
│   └── token.json           # BLEAG Token ABI
├── lib/
│   ├── contracts.ts         # Contract configurations and types
│   └── wagmi.ts            # Wagmi configuration and helpers
├── hooks/
│   └── useContracts.ts      # Custom hooks for contract interactions
└── components/
    └── ContractExample.tsx  # Example component showing usage
```

## Key Features

### 1. Contract Configuration (`lib/contracts.ts`)

- **ABI Integration**: Uses actual ABI files instead of hardcoded interfaces
- **Type Safety**: Full TypeScript support with proper types
- **Enums**: Predefined enums for predictions, match status, and results

### 2. Wagmi Integration (`lib/wagmi.ts`)

- **Contract Helpers**: Pre-configured contract interaction functions
- **Easy Access**: Simple functions for common operations
- **Type Safety**: Full TypeScript support

### 3. Custom Hooks (`hooks/useContracts.ts`)

- **useToken**: Token balance, allowance, and approval operations
- **useMatches**: Match listings and user statistics
- **useMatch**: Individual match operations (create, join, cancel)
- **useTransactionStatus**: Transaction status tracking

## Usage Examples

### Basic Token Operations

```typescript
import { useToken } from '@/hooks/useContracts';

const MyComponent = () => {
  const { balance, allowance, approve, isApproving } = useToken();

  const handleApprove = async () => {
    const amount = BigInt(100) * BigInt(10 ** 18); // 100 BLEAG tokens
    await approve(amount);
  };

  return (
    <div>
      <p>Balance: {balance ? (Number(balance) / 10 ** 18).toFixed(2) : '0'} BLEAG</p>
      <button onClick={handleApprove} disabled={isApproving}>
        {isApproving ? 'Approving...' : 'Approve Tokens'}
      </button>
    </div>
  );
};
```

### Match Operations

```typescript
import { useMatch, useMatches } from '@/hooks/useContracts';
import { Prediction } from '@/lib/contracts';

const MatchComponent = () => {
  const { openMatches, userStats } = useMatches();
  const match = useMatch(1); // Match ID 1

  const handleCreateMatch = async () => {
    const stakeAmount = BigInt(100) * BigInt(10 ** 18);
    await match.createMatch('fixture-123', Prediction.HOME, stakeAmount);
  };

  const handleJoinMatch = async () => {
    await match.joinMatch(Prediction.AWAY);
  };

  return (
    <div>
      <p>Open Matches: {openMatches?.length || 0}</p>
      <button onClick={handleCreateMatch}>Create Match</button>
      <button onClick={handleJoinMatch}>Join Match</button>
    </div>
  );
};
```

### Direct Contract Calls

```typescript
import { useContractRead, useContractWrite } from 'wagmi';
import { contractHelpers } from '@/lib/wagmi';

const DirectContractComponent = () => {
  const { data: balance } = useContractRead({
    ...contractHelpers.getTokenBalance('0x...'),
  });

  const write = useContractWrite({
    address: contracts.matchManager.address,
    abi: contracts.matchManager.abi,
    functionName: 'createMatch',
  });

  const createMatch = () => {
    write.write({
      args: ['fixture-123', 0, BigInt(100) * BigInt(10 ** 18)],
    });
  };

  return (
    <div>
      <p>Balance: {balance?.toString()}</p>
      <button onClick={createMatch}>Create Match</button>
    </div>
  );
};
```

## Contract Functions

### BLEAG Token Contract

- `balanceOf(address)`: Get token balance
- `approve(spender, amount)`: Approve token spending
- `allowance(owner, spender)`: Check allowance
- `transfer(to, amount)`: Transfer tokens
- `transferFrom(from, to, amount)`: Transfer from another address

### Match Manager Contract

- `createMatch(fixtureId, prediction, stakeAmount)`: Create a new match
- `joinMatch(matchId, prediction)`: Join an existing match
- `getMatch(matchId)`: Get match details
- `getUserMatches(user)`: Get user's matches
- `getOpenMatches()`: Get all open matches
- `getActiveMatches()`: Get all active matches
- `getCompletedMatches()`: Get all completed matches
- `getUserStats(user)`: Get user statistics
- `cancelMatch(matchId)`: Cancel a match

## Enums

### Prediction
```typescript
enum Prediction {
  HOME = 0,  // Home team win
  DRAW = 1,  // Draw
  AWAY = 2,  // Away team win
}
```

### Match Status
```typescript
enum MatchStatus {
  OPEN = 0,      // Match is open for joining
  ACTIVE = 1,    // Match has two participants
  COMPLETED = 2,  // Match is completed
  CANCELLED = 3,  // Match is cancelled
}
```

### Match Result
```typescript
enum MatchResult {
  CREATOR_WIN = 0,  // Creator won
  DRAW = 1,         // Draw
  JOINER_WIN = 2,   // Joiner won
  CANCELLED = 3,    // Match was cancelled
}
```

## Error Handling

All contract interactions include proper error handling:

```typescript
const { createMatch, createError, isCreating } = useMatch(0);

const handleCreate = async () => {
  try {
    await createMatch('fixture-123', Prediction.HOME, BigInt(100) * BigInt(10 ** 18));
    toast.success('Match created successfully');
  } catch (error) {
    toast.error('Failed to create match');
    console.error('Create match error:', createError);
  }
};
```

## Transaction Status

Track transaction status with the `useTransactionStatus` hook:

```typescript
import { useTransactionStatus } from '@/hooks/useContracts';

const MyComponent = () => {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { receipt, isLoading, error, isSuccess } = useTransactionStatus(txHash);

  if (isLoading) return <p>Transaction pending...</p>;
  if (error) return <p>Transaction failed: {error.message}</p>;
  if (isSuccess) return <p>Transaction successful!</p>;

  return <div>Transaction status: {receipt?.status}</div>;
};
```

## Best Practices

1. **Always check wallet connection** before contract interactions
2. **Handle loading states** for better UX
3. **Use proper error handling** for failed transactions
4. **Convert token amounts** to wei (multiply by 10^18)
5. **Use the custom hooks** for common operations
6. **Track transaction status** for user feedback

## Testing

Use the `ContractExample` component to test all contract functionality:

```typescript
import ContractExample from '@/components/ContractExample';

const TestPage = () => {
  return <ContractExample />;
};
```

This component provides a complete interface for testing all contract operations including token approval, match creation, and match joining.
