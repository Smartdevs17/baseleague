# Smart Contracts: Chainlink Functions Oracle Integration

This directory contains smart contracts for integrating Chainlink Functions on Celo Sepolia Testnet to automatically fetch and settle match results from the FPL API.

## Contract Files

### Core Contracts

- **`ResultsConsumer.sol`** - Base consumer contract for Chainlink Functions integration
  - Handles Chainlink Functions requests and responses
  - Parses match result data from FPL API
  - Manages subscription configuration
  - Tracks request state and handles errors

- **`ResultsConsumerWithSettlement.sol`** - Extended consumer with automatic settlement
  - Extends `ResultsConsumer` with MatchManager integration
  - Automatically settles matches after receiving results
  - Handles settlement failures gracefully
  - Tracks pending settlements

- **`IMatchManager.sol`** - Interface for MatchManager contract
  - Defines required functions for settlement integration
  - Provides type definitions for match data structures

### Supporting Files

- **`functions-source.js`** - JavaScript source code for Chainlink Functions
  - Fetches match data from FPL API
  - Parses and validates response
  - Returns structured match result data

## Documentation

- **`ORACLE_INTEGRATION.md`** - Comprehensive architecture and integration guide
  - Architecture overview
  - Data flow diagrams
  - Edge case handling
  - Security considerations
  - Troubleshooting guide

- **`QUICK_START.md`** - Step-by-step setup and deployment guide
  - Prerequisites
  - Installation steps
  - Deployment instructions
  - Testing guide

## Architecture Overview

```
MatchManager → ResultsConsumerWithSettlement → ResultsConsumer → Chainlink Functions → FPL API
```

1. **MatchManager** - Existing contract managing matches and predictions
2. **ResultsConsumerWithSettlement** - Orchestrates request and settlement
3. **ResultsConsumer** - Handles Chainlink Functions integration
4. **Chainlink Functions** - Decentralized oracle network executing JavaScript
5. **FPL API** - External data source for match results

## Key Features

### Request Handling
- Initiates Chainlink Functions requests with FPL API fixture IDs
- Tracks request state and handles timeouts
- Validates responses before processing

### Error Handling
- API downtime detection and reporting
- Malformed JSON response handling
- Delayed response timeout management
- Invalid match status validation

### Automatic Settlement
- Integrates with MatchManager contract
- Automatically settles matches after receiving results
- Handles settlement failures with proper error reporting

### Configuration
- Owner-controlled subscription management
- Configurable gas limits and confirmations
- DON ID configuration for different networks

## Setup Requirements

### Dependencies
```bash
npm install @chainlink/contracts
```

### Chainlink Functions Subscription
1. Create subscription on [Chainlink Functions App](https://functions.chain.link/)
2. Fund with LINK tokens
3. Authorize consumer contract address

### Network Configuration
- **Network:** Celo Sepolia Testnet
- **Functions Router:** Check [Chainlink Docs](https://docs.chain.link/chainlink-functions/supported-networks)
- **LINK Token:** Check [Chainlink Docs](https://docs.chain.link/chainlink-functions/supported-networks)
- **DON ID:** Check [Chainlink Docs](https://docs.chain.link/chainlink-functions/supported-networks)

## Usage

### Basic Request

```solidity
// Request match result
bytes32 requestId = resultsConsumer.requestMatchResult(
    matchId,      // Internal match ID
    fixtureId,    // FPL API fixture ID
    apiKey        // FPL API key (use encrypted secrets in production)
);
```

### Request with Auto-Settlement

```solidity
// Request and automatically settle
bytes32 requestId = resultsConsumerWithSettlement.requestAndSettleMatch(
    matchId,
    fixtureId,
    apiKey
);
```

### Event Monitoring

```javascript
// Listen for events
consumer.on("RequestSent", (requestId, matchId, fixtureId, requester) => {
    // Handle request sent
});

consumer.on("RequestFulfilled", (requestId, matchId, result) => {
    // Handle successful fulfillment
});

consumer.on("RequestFailed", (requestId, matchId, error) => {
    // Handle request failure
});
```

## Security Considerations

1. **API Key Management**
   - Use Chainlink Functions encrypted secrets for API keys
   - Never hardcode API keys in contract source
   - Rotate API keys regularly

2. **Access Control**
   - Owner-only configuration functions
   - Role-based access for settlement (if needed)
   - Validate match state before processing

3. **Gas Optimization**
   - Set appropriate callback gas limits
   - Monitor gas usage
   - Optimize response parsing

4. **Input Validation**
   - Validate match IDs before processing
   - Check match status before settlement
   - Prevent duplicate requests

## Edge Cases Handled

- ✅ API downtime and errors
- ✅ Malformed JSON responses
- ✅ Delayed API responses
- ✅ Match not finished scenarios
- ✅ Invalid fixture IDs
- ✅ Network timeouts
- ✅ Settlement failures

## Testing

### Local Testing
- Use Hardhat/Foundry for local contract testing
- Mock Chainlink Functions responses
- Test all edge cases

### Testnet Testing
- Deploy to Celo Sepolia Testnet
- Test with real FPL API (test key)
- Monitor events and gas usage
- Test error scenarios

## Next Steps

1. **Deploy Contracts** - Follow `QUICK_START.md`
2. **Configure Subscription** - Set up Chainlink Functions subscription
3. **Update MatchManager** - Add `settleMatchWithResult` function
4. **Test Integration** - Test with real match data
5. **Set Up Automation** - Integrate Chainlink Automation for periodic settlement

## References

- [Chainlink Functions Documentation](https://docs.chain.link/chainlink-functions/getting-started)
- [Chainlink Testnet Oracles](https://docs.chain.link/any-api/testnet-oracles)
- [Chainlink Functions Automation](https://docs.chain.link/chainlink-functions/tutorials/automate-functions-custom-logic)
- [Functions on Celo](https://dev.chain.link/changelog/functions-on-celo)
- [Celo Sepolia Testnet](https://docs.celo.org/tooling/testnets/celo-sepolia)

## Support

For issues or questions:
1. Check `ORACLE_INTEGRATION.md` for detailed documentation
2. Review `QUICK_START.md` for setup issues
3. Consult Chainlink Functions documentation
4. Check contract events for error details

