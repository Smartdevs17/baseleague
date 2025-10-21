# Environment Setup Guide

This guide explains how to configure the BaseLeague application using environment variables.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in the `.env` file
3. Run the application:
   ```bash
   npm run dev
   ```

## Required Environment Variables

### 🔑 Essential Variables (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/) | `abc123def456...` |
| `VITE_BLEAG_TOKEN_ADDRESS` | Deployed BLEAG token contract address | `0x1234...5678` |
| `VITE_MATCH_MANAGER_ADDRESS` | Deployed MatchManager contract address | `0x8765...4321` |

### 🌐 Network Configuration

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_CHAIN_ID` | Blockchain network ID | `84532` | `84532` (Base Sepolia), `8453` (Base Mainnet) |
| `VITE_RPC_URL` | RPC endpoint URL | `https://sepolia.base.org` | Your preferred RPC provider |

### 🔌 API Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes (for production) |
| `VITE_API_FOOTBALL_KEY` | API-Football API key | Yes (for live match data) |
| `VITE_API_FOOTBALL_BASE_URL` | API-Football base URL | No (has default) |

### 🔮 Oracle Service

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ORACLE_PRIVATE_KEY` | Oracle wallet private key | Yes (for match settlement) |
| `VITE_ORACLE_SERVICE_URL` | Oracle service endpoint | No (has default) |

### 📊 Analytics & Monitoring (Optional)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GA_TRACKING_ID` | Google Analytics tracking ID | No |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | No |

### 🎛️ Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `VITE_ENABLE_ERROR_TRACKING` | Enable error tracking | `false` |
| `VITE_ENABLE_DEBUG_MODE` | Enable debug mode | `false` |

## Getting Your API Keys

### 1. WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy the Project ID

### 2. API-Football Key

1. Go to [API-Football](https://www.api-football.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env` file

### 3. Smart Contract Addresses

You'll need to deploy your smart contracts and get their addresses:

- **BLEAG Token**: Deploy an ERC20 token contract
- **Match Manager**: Deploy the main contract for managing matches

## Environment-Specific Configurations

### Development
```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
VITE_CHAIN_ID=84532
VITE_RPC_URL=https://sepolia.base.org
```

### Production
```env
VITE_DEBUG=false
VITE_LOG_LEVEL=info
VITE_CHAIN_ID=8453
VITE_RPC_URL=https://mainnet.base.org
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Keep private keys secure** - Store oracle private keys securely
3. **Use different keys for different environments**
4. **Rotate keys regularly** - Especially for production

## Troubleshooting

### Common Issues

1. **"VITE_WALLETCONNECT_PROJECT_ID is required"**
   - Make sure you've set the WalletConnect Project ID
   - Check that the variable name is correct

2. **"Contract addresses are not set"**
   - Ensure you've deployed your contracts
   - Verify the addresses are correct (42 characters starting with 0x)

3. **"API key not working"**
   - Check that your API-Football key is valid
   - Ensure you have sufficient API credits

### Debug Mode

Enable debug mode to see detailed configuration logs:
```env
VITE_DEBUG=true
VITE_ENABLE_DEBUG_MODE=true
```

## Configuration Validation

The app automatically validates your configuration on startup. Check the browser console for any validation errors.

## Need Help?

- Check the [Integration Guide](README_INTEGRATION.md)
- Review the [main README](README.md)
- Open an issue if you encounter problems
