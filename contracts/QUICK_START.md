# 🚀 Quick Start: Chainlink Functions on Base Sepolia

## Step 1: Get Testnet Tokens

### Get Base Sepolia ETH
1. Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect your wallet
3. Request testnet ETH

### Get Base Sepolia LINK
1. Visit: https://faucets.chain.link/base-sepolia
2. Connect your wallet  
3. Request testnet LINK (get 5-10 LINK for testing)

## Step 2: Create Chainlink Functions Subscription

1. **Go to Chainlink Functions App**:
   - Visit: https://functions.chain.link/
   - Connect your wallet
   - **Switch to Base Sepolia network** in your wallet

2. **Create Subscription**:
   - Click "Create Subscription" or "+ New Subscription"
   - Select "Base Sepolia" network
   - Confirm transaction
   - **Save your Subscription ID** (you'll see it like: `123`)

3. **Fund Subscription**:
   - Click on your subscription
   - Click "Add Funds" or "Fund Subscription"
   - Transfer **5 LINK** to the subscription
   - Wait for confirmation

## Step 3: Get Chainlink Addresses

For Base Sepolia, you need:

### Option A: From Chainlink Docs (Recommended)
1. Visit: https://docs.chain.link/chainlink-functions/supported-networks
2. Find "Base Sepolia" section
3. Copy:
   - **Router Address** (e.g., `0x...`)
   - **DON ID** (e.g., `fun-base-sepolia-1`)

### Option B: Use These (Verify First!)
- **Router**: Check Chainlink docs for latest address
- **DON ID**: `fun-base-sepolia-1` (will be converted to bytes32)

## Step 4: Configure Environment

Create `contracts/.env`:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://base-sepolia-rpc.publicnode.com

# Chainlink Functions Configuration
CHAINLINK_FUNCTIONS_ROUTER=0x_YOUR_ROUTER_ADDRESS
CHAINLINK_FUNCTIONS_DON_ID=fun-base-sepolia-1
CHAINLINK_SUBSCRIPTION_ID=your_subscription_id_here
```

**Important**: 
- Replace `your_private_key_here` with your wallet private key
- Replace `your_subscription_id_here` with the subscription ID from Step 2
- Get Router address from Chainlink docs

## Step 5: Deploy Contracts

```bash
cd contracts
npm install
npm run deploy:base-sepolia
```

This will:
- Deploy `ResultsConsumer` contract
- Deploy `PredictionContract` contract
- Authorize `PredictionContract` to use `ResultsConsumer`
- Set subscription ID (if provided in .env)
- Save addresses to `.env`

**Save the contract addresses** that are printed!

## Step 6: Add Contract as Consumer

1. **Go back to Chainlink Functions App**
2. **Open your subscription**
3. **Click "Add Consumer"** or "Manage Consumers"
4. **Paste your ResultsConsumer contract address**
5. **Confirm transaction**

## Step 7: Test It!

```bash
# Request a match result
npx hardhat run scripts/request-result.ts --network base-sepolia

# Check if result was fulfilled
npx hardhat run scripts/check-result.ts --network base-sepolia
```

## ✅ Verification Checklist

Before using in production:

- [ ] Wallet has Base Sepolia ETH
- [ ] Wallet has Base Sepolia LINK  
- [ ] Subscription created and funded (5+ LINK)
- [ ] Contracts deployed successfully
- [ ] ResultsConsumer added as consumer in Functions App
- [ ] Subscription ID set in contract
- [ ] Test request successful

## 🐛 Common Issues

**"Insufficient LINK"**
→ Add more LINK to subscription

**"Unauthorized Consumer"**  
→ Make sure you added contract address in Functions App

**"Invalid Subscription"**
→ Check subscription ID is correct in .env

## 📚 Full Documentation

See `CHAINLINK_SETUP.md` for detailed guide.

---

**Need the Router Address?**  
Check: https://docs.chain.link/chainlink-functions/supported-networks

