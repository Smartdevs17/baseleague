# SoccerLeague Oracle Service

Backend oracle service that automatically fetches match results from the FPL API and submits them to the `CustomResultsOracle` smart contract on Celo Sepolia.

## Features

- 🔄 **Automated Polling**: Fetches match results from FPL API every 5 minutes (configurable)
- 📦 **MongoDB Storage**: Tracks matches and prevents duplicate submissions
- ⛓️ **Blockchain Integration**: Automatically submits finished matches to the contract
- 🛡️ **Error Handling**: Robust error handling and logging
- ⏰ **Cron Jobs**: Scheduled execution using node-cron

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Variables:**
- `MONGODB_URI`: MongoDB connection string
- `CELO_SEPOLIA_RPC_URL`: Celo Sepolia RPC endpoint
- `CUSTOM_RESULTS_ORACLE_ADDRESS`: Deployed CustomResultsOracle contract address
- `ORACLE_PRIVATE_KEY`: Private key of wallet authorized to submit results

### 3. Authorize Oracle Wallet

The wallet used in `ORACLE_PRIVATE_KEY` must be authorized in the `CustomResultsOracle` contract:

```solidity
// Call this on the contract (as owner)
addAuthorizedOracle(oracleWalletAddress)
```

Or use the owner account's private key directly.

### 4. Fund Oracle Wallet

Make sure the oracle wallet has CELO for gas fees:

```bash
# Check balance (you can do this in the service logs)
# The service will log the balance on each run
```

### 5. Run the Service

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## How It Works

1. **Fetch Matches**: Polls FPL API for match fixtures
2. **Store in MongoDB**: Saves/updates match data locally
3. **Check Finished Matches**: Finds matches with `finished: true`
4. **Submit to Contract**: Calls `submitResult()` on CustomResultsOracle
5. **Track Submissions**: Marks matches as submitted to prevent duplicates

## Cron Schedule

Default: Every 5 minutes (`*/5 * * * *`)

You can customize this in `.env`:
```env
CRON_SCHEDULE=*/15 * * * *  # Every 15 minutes
```

## MongoDB Schema

The `Match` model stores:
- `gameweek`: Gameweek number
- `matchId`: Match ID from FPL API
- `homeTeam` / `awayTeam`: Team names
- `homeScore` / `awayScore`: Match scores
- `status`: Match status (NS, LIVE, HT, FT)
- `finished`: Whether match is finished
- `submittedToContract`: Whether result was submitted
- `submissionTxHash`: Transaction hash of submission

## Monitoring

The service logs:
- ✅ Successful submissions
- ❌ Errors and failures
- 📊 Statistics (processed, submitted, failed)
- 💰 Wallet balance checks

## Troubleshooting

### "UnauthorizedOracle" Error
- Make sure the oracle wallet is authorized in the contract
- Check that `ORACLE_PRIVATE_KEY` matches the authorized address

### Low Balance Warning
- Fund the oracle wallet with CELO
- Check balance in logs

### MongoDB Connection Error
- Verify `MONGODB_URI` is correct
- Ensure MongoDB is running (if local)

### API Rate Limiting
- The service includes delays between submissions
- If needed, increase the cron schedule interval

## Development

```bash
# Run with auto-reload
npm run dev

# Check logs
tail -f logs/oracle.log  # If file logging is added
```

## Production Deployment

Recommended platforms:
- **Vercel**: Serverless functions with cron
- **Railway**: Easy Node.js deployment
- **Heroku**: Traditional hosting with scheduler
- **AWS Lambda**: Serverless with EventBridge
- **DigitalOcean**: Droplet with PM2

Make sure to:
1. Set environment variables in your hosting platform
2. Keep the service running 24/7
3. Monitor logs for errors
4. Keep oracle wallet funded

