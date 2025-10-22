# BaseLeague Backend

A Node.js/Express backend API for the BaseLeague application.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your environment variables:
```bash
NODE_ENV=development
PORT=5000
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

Set these in your Vercel project settings:

- `NODE_ENV`: Set to `production`
- Add any other environment variables your application needs

### API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/leagues` - Fetch leagues data

### Local Testing

To test the Vercel build locally:

```bash
vercel dev
```

This will start a local server that mimics Vercel's serverless environment.
