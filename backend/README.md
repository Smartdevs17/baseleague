# BaseLeague Backend

A Node.js/Express backend API for the BaseLeague application.

## 📚 API Documentation

**Postman Collection**: [View API Documentation](https://documenter.getpostman.com/view/21732859/2sB3WjxiGx)

The complete API documentation with examples, authentication flows, and testing scenarios is available in our Postman workspace.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your environment variables:
```bash
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/baseleague

# Premier League API Configuration
# No API key required - uses free Fantasy Premier League API
# Base URL: https://fantasy.premierleague.com/api

# Optional: External Football API (if using alternative data source)
# RAPID_API_KEY=your_rapidapi_key_here
# FOOTBALL_BASE_API_URL=https://free-api-live-football-data.p.rapidapi.com
```

3. Start the development server:
```bash
npm run dev
```

## Vercel Deployment

This backend is configured for deployment on Vercel.

### Prerequisites

1. A Vercel account
2. Vercel CLI installed (`npm i -g vercel`)

### Deployment Steps

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy from the backend directory:**
```bash
cd backend
vercel
```

3. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add your environment variables

### Environment Variables

#### Required Variables

- `NODE_ENV`: Environment mode (`development` or `production`)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string

#### Vercel Deployment Variables

Set these in your Vercel project settings:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baseleague?retryWrites=true&w=majority
```

#### Optional Variables

- `RAPID_API_KEY`: For alternative football data APIs
- `FOOTBALL_BASE_API_URL`: Alternative API base URL

#### Premier League API

The application uses the free Fantasy Premier League API:
- **Base URL**: `https://fantasy.premierleague.com/api`
- **No API key required**
- **Endpoints used**:
  - `/bootstrap-static/` - Players and teams data
  - `/fixtures/` - All fixtures
  - `/fixtures/?event={gameweek}` - Specific gameweek fixtures

### Database Setup

The application uses MongoDB with Mongoose ODM. You'll need:

1. **Local Development**: Install MongoDB locally or use MongoDB Atlas
2. **Production**: Use MongoDB Atlas or another cloud MongoDB service
3. **Connection**: Set `MONGODB_URI` environment variable

#### MongoDB Atlas Setup (Recommended for Production)

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose free tier for development
3. **Get Connection String**: 
   - Go to "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
4. **Set Environment Variable**:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baseleague?retryWrites=true&w=majority
   ```

#### Local MongoDB Setup

1. **Install MongoDB**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)
2. **Start MongoDB**: `mongod` (or `brew services start mongodb-community` on macOS)
3. **Set Environment Variable**:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/baseleague
   ```

### Premier League API Integration

The backend integrates with the free Fantasy Premier League API:

#### Available Endpoints
- **Players & Teams**: `GET https://fantasy.premierleague.com/api/bootstrap-static/`
- **All Fixtures**: `GET https://fantasy.premierleague.com/api/fixtures/`
- **Gameweek Fixtures**: `GET https://fantasy.premierleague.com/api/fixtures/?event={gameweek}`

#### Data Sync Process
1. **Sync Fixtures**: `POST /api/betting/sync-fixtures`
   - Fetches all fixtures from Premier League API
   - Processes team information
   - Stores fixtures in MongoDB with betting pools

2. **Real-time Updates**: Fixtures are updated with:
   - Match results
   - Pool calculations
   - Payout processing

#### API Features
- ✅ **No API key required** - Free public API
- ✅ **Real-time data** - Live fixture updates
- ✅ **Team information** - Complete team and player data
- ✅ **Gameweek support** - Filter by specific gameweeks

### User Management System

The BaseLeague backend includes a comprehensive user management system with wallet-based authentication:

#### Key Features
- 🔐 **Wallet-based Authentication** - No passwords required, uses Ethereum signatures
- 👤 **User Profiles** - Customizable usernames, display names, and avatars
- 📊 **Betting Statistics** - Automatic tracking of betting performance
- 🏆 **Leaderboards** - Competitive rankings based on winnings
- 🔍 **User Search** - Find users by username or display name
- 🛡️ **Security** - Signature verification prevents impersonation

#### Authentication Headers
For authenticated requests, include these headers:
```
walletAddress: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
signature: 0x1234...abcd
message: BaseLeague Authentication\n\nWallet: 0x...\nNonce: ...\nTimestamp: ...
```

#### User Data Model
- **Wallet Address** - Unique identifier (Ethereum address)
- **Username** - Unique display name (3-20 characters)
- **Display Name** - Public display name (max 50 characters)
- **Avatar** - Profile image URL
- **Betting Stats** - Total bets, wins, losses, winnings, win rate
- **Preferences** - Notification settings, theme preferences

### API Endpoints

#### General
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/leagues` - Fetch leagues data

#### User Management & Authentication
- `POST /api/users/auth-challenge` - Get authentication challenge for wallet connection
- `POST /api/users/verify-signature` - Verify wallet signature and authenticate user
- `GET /api/users/profile` - Get authenticated user's profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `GET /api/users/wallet/:address` - Get user profile by wallet address (public)
- `GET /api/users/betting-stats` - Get user betting statistics (requires auth)
- `GET /api/users/leaderboard` - Get leaderboard of top users
- `GET /api/users/search` - Search users by username or display name
- `DELETE /api/users/account` - Deactivate user account (requires auth)

#### Betting System
- `GET /api/betting/fixtures` - Get all available fixtures for betting
- `GET /api/betting/fixtures/:id` - Get specific fixture with betting pools
- `POST /api/betting/bet` - Place a new bet (requires authentication)
- `GET /api/betting/my-bets` - Get authenticated user's bets (requires auth)
- `GET /api/betting/user/:address/bets` - Get user bets by wallet address (public)
- `POST /api/betting/sync-fixtures` - Sync fixtures from Premier League API
- `POST /api/betting/fixtures/:id/result` - Update fixture result and process payouts
- `GET /api/betting/stats` - Get betting statistics

#### Authentication Flow
1. **Connect Wallet**: User connects their Ethereum wallet
2. **Get Auth Challenge**: `POST /api/users/auth-challenge` - Get message to sign
3. **Sign Message**: User signs the message with their wallet
4. **Verify Signature**: `POST /api/users/verify-signature` - Authenticate user
5. **Access Protected Endpoints**: Use authenticated endpoints with wallet headers

#### Betting Flow
1. **Sync Fixtures**: `POST /api/betting/sync-fixtures` - Load fixtures from Premier League API
2. **View Fixtures**: `GET /api/betting/fixtures` - See available matches
3. **Authenticate**: Complete wallet authentication flow
4. **Place Bet**: `POST /api/betting/bet` - Bet on match outcome (requires auth)
5. **View My Bets**: `GET /api/betting/my-bets` - See your betting history
6. **Update Result**: `POST /api/betting/fixtures/:id/result` - Set match result
7. **View Stats**: `GET /api/betting/stats` - See betting statistics

### Local Testing

To test the Vercel build locally:

```bash
vercel dev
```

This will start a local server that mimics Vercel's serverless environment.
