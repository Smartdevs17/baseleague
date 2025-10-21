# BaseLeague Smart Contracts

This directory contains the Foundry-based smart contracts for the BaseLeague platform.

## Overview

The BaseLeague platform consists of two main smart contracts:

1. **BleagToken** - ERC20 token for the platform
2. **MatchManager** - Manages betting matches between users

## Contracts

### BleagToken
- ERC20 token with minting and burning capabilities
- Initial supply: 1,000,000 tokens
- Owner can mint additional tokens
- Users can burn their own tokens

### MatchManager
- Manages betting matches between users
- Users can create matches with a stake amount
- Other users can join matches with their own stake
- Matches are settled by the contract owner
- Winners receive 2x their stake amount

## Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js (for dependencies)

### Setup
```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report
```

### Testing
```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/BleagToken.t.sol

# Run with verbose output
forge test -vvv
```

### Deployment
```bash
# Deploy to local network
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to testnet (requires PRIVATE_KEY environment variable)
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast --verify
```

## Contract Functions

### BleagToken
- `mint(address to, uint256 amount)` - Mint new tokens (owner only)
- `burn(uint256 amount)` - Burn tokens from caller
- Standard ERC20 functions: `transfer`, `approve`, `transferFrom`, etc.

### MatchManager
- `createMatch(uint256 stake, uint256 fixtureId, uint8 prediction)` - Create a new match
- `joinMatch(uint256 matchId, uint8 prediction)` - Join an existing match
- `getMatch(uint256 matchId)` - Get match details
- `getUserMatches(address user)` - Get all matches for a user
- `settleMatch(uint256 matchId, address winner)` - Settle a match (owner only)

## Events

### MatchManager Events
- `MatchCreated(uint256 indexed matchId, address indexed creator, uint256 stake, uint256 fixtureId)`
- `MatchJoined(uint256 indexed matchId, address indexed joiner)`
- `MatchSettled(uint256 indexed matchId, address indexed winner, uint256 reward)`

## Security Considerations

- The MatchManager contract holds user funds and should be carefully audited
- Only the contract owner can settle matches
- Emergency withdraw function is available for the owner
- All token transfers use SafeERC20 for additional security

## License

MIT