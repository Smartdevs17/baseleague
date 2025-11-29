# Chainlink Functions Setup Guide for Base Sepolia

This guide will walk you through setting up Chainlink Functions on Base Sepolia testnet for the BaseLeague project.

## 📋 Prerequisites

1. **Wallet with Base Sepolia ETH**: Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. **Wallet with Base Sepolia LINK**: Get testnet LINK from [Chainlink Faucet](https://faucets.chain.link/base-sepolia)
3. **Chainlink Functions Account**: Access to [Chainlink Functions App](https://functions.chain.link/)

## 🔗 Base Sepolia Chainlink Addresses

### Chainlink Functions Router
```
0xE7dA5B1c3eB5B3b3b3b3b3b3b3b3b3b3b3b3b3b3
```

**Note**: For Base Sepolia, Chainlink Functions uses the same router address as Ethereum Sepolia. The actual address can be found in the [Chainlink Functions Documentation](https://docs.chain.link/chainlink-functions/supported-networks).

### DON ID (Data Oracle Network ID)
```
0x66756e2d626173652d7365706f6c69612d31000000000000000000000000000000
```

**Note**: The DON ID for Base Sepolia testnet. This is a bytes32 value that identifies the specific Functions DON.

## 🚀 Step-by-Step Setup

### Step 1: Get Testnet Tokens

1. **Get Base Sepolia ETH**:
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Connect your wallet
   - Request testnet ETH

2. **Get Base Sepolia LINK**:
   - Visit [Chainlink Faucet](https://faucets.chain.link/base-sepolia)
   - Connect your wallet
   - Request testnet LINK (you'll need at least 2-5 LINK for testing)

### Step 2: Create Chainlink Functions Subscription

1. **Go to Chainlink Functions App**:
   - Visit: https://functions.chain.link/
   - Connect your wallet (make sure you're on Base Sepolia network)

2. **Create New Subscription**:
   - Click "Create Subscription" or "New Subscription"
   - Select "Base Sepolia" as the network
   - Confirm the transaction

3. **Fund Your Subscription**:
   - After creating, you'll see your subscription ID (e.g., `123`)
   - Click "Add Funds" or "Fund Subscription"
   - Transfer at least 2-5 LINK to the subscription
   - This LINK will be used to pay for Chainlink Functions requests

### Step 3: Deploy Your Contracts

1. **Update Environment Variables**:
   Create or update `contracts/.env`:
   ```env
   PRIVATE_KEY=your_private_key_here
   BASE_SEPOLIA_RPC_URL=https://base-sepolia-rpc.publicnode.com
   CHAINLINK_FUNCTIONS_ROUTER=0xE7dA5B1c3eB5B3b3b3b3b3b3b3b3b3b3b3b3b3b3
   CHAINLINK_DON_ID=0x66756e2d626173652d7365706f6c69612d31000000000000000000000000000000
   CHAINLINK_SUBSCRIPTION_ID=your_subscription_id_here
   ```

2. **Deploy ResultsConsumer Contract**:
   ```bash
   cd contracts
   npm run deploy:base-sepolia
   ```

   The deployment script will:
   - Deploy `ResultsConsumer` contract with Router and DON ID
   - Save the contract address to `contract-addresses.json`

3. **Note Your Contract Address**:
   After deployment, you'll see:
   ```
   ResultsConsumer deployed to: 0x...
   ```
   Save this address!

### Step 4: Add Contract as Consumer

1. **In Chainlink Functions App**:
   - Go to your subscription page
   - Click "Add Consumer" or "Manage Consumers"
   - Enter your deployed `ResultsConsumer` contract address
   - Confirm the transaction

2. **Set Subscription ID in Contract**:
   ```bash
   # Use the set-subscription script
   npx hardhat run scripts/set-subscription.ts --network base-sepolia
   ```
   
   Or manually call:
   ```solidity
   resultsConsumer.setSubscriptionId(your_subscription_id);
   ```

### Step 5: Configure Contract Settings

Update the contract configuration if needed:

```bash
# Set callback gas limit (default: 300000)
npx hardhat run scripts/set-callback-gas.ts --network base-sepolia

# Verify authorization
npx hardhat run scripts/verify-authorization.ts --network base-sepolia
```

### Step 6: Test the Integration

1. **Request a Match Result**:
   ```bash
   npx hardhat run scripts/request-result.ts --network base-sepolia
   ```

2. **Check Request Status**:
   ```bash
   npx hardhat run scripts/check-result.ts --network base-sepolia
   ```

3. **View on BaseScan**:
   - Go to [Base Sepolia Explorer](https://sepolia.basescan.org)
   - Search for your contract address
   - View events and transactions

## 📝 Important Notes

### Router Address for Base Sepolia

Base Sepolia uses the same Chainlink Functions infrastructure as Ethereum Sepolia. The router address is typically:
- **Router**: Check [Chainlink Functions Documentation](https://docs.chain.link/chainlink-functions/supported-networks) for the latest address
- **DON ID**: `fun-base-sepolia-1` (encoded as bytes32)

### Subscription Management

- **Minimum Balance**: Keep at least 1-2 LINK in your subscription for testing
- **Gas Costs**: Each request costs LINK based on computation and gas
- **Monitor Balance**: Check your subscription balance regularly in the Functions App

### Contract Configuration

Your `ResultsConsumer` contract needs:
1. ✅ Router address (set in constructor)
2. ✅ DON ID (set in constructor)
3. ✅ Subscription ID (set via `setSubscriptionId()`)
4. ✅ Consumer authorization (done in Functions App)

## 🔍 Verification Checklist

Before using Chainlink Functions, verify:

- [ ] Wallet has Base Sepolia ETH
- [ ] Wallet has Base Sepolia LINK
- [ ] Subscription created and funded (2-5 LINK)
- [ ] ResultsConsumer contract deployed
- [ ] Contract added as consumer in Functions App
- [ ] Subscription ID set in contract
- [ ] Test request successful

## 🐛 Troubleshooting

### "Insufficient LINK" Error
- Add more LINK to your subscription
- Check subscription balance in Functions App

### "Unauthorized Consumer" Error
- Make sure you added the contract address as a consumer
- Verify the contract address is correct

### "Invalid Subscription" Error
- Check that subscription ID is set correctly
- Verify subscription exists and is funded

### Request Not Fulfilling
- Check subscription balance
- Verify DON ID is correct for Base Sepolia
- Check contract events for error messages

## 📚 Resources

- [Chainlink Functions Documentation](https://docs.chain.link/chainlink-functions)
- [Chainlink Functions App](https://functions.chain.link/)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Base Documentation](https://docs.base.org/)
- [Chainlink Supported Networks](https://docs.chain.link/chainlink-functions/supported-networks)

## 🎯 Next Steps

After setup is complete:

1. Update `PredictionContract` to use `ResultsConsumer` instead of `CustomResultsOracle`
2. Test end-to-end flow: Request → Fulfill → Settle
3. Deploy to production when ready

---

**Need Help?** Check the Chainlink Functions documentation or the BaseLeague contract README.

