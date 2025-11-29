// Configuration utility for environment variables
export const config = {
  // Application settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'SoccerLeague',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // Wallet connection
  wallet: {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chainId: import.meta.env.VITE_CHAIN_ID || '11142220', // Celo Sepolia
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org',
  },

  // Smart contracts
  contracts: {
    bleagToken: import.meta.env.VITE_BLEAG_TOKEN_ADDRESS || '0x1234567890123456789012345678901234567890',
    resultsConsumer: import.meta.env.VITE_RESULTS_CONSUMER_ADDRESS || '0x816B6a402cC26F0D5B3b28794061C75BC673490f', // CustomResultsOracle
    predictionContract: import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS || '0xfBa3E093ad88Ad56abd90956Bc383898bb85e0b2',
    // Legacy support
    matchManager: import.meta.env.VITE_MATCH_MANAGER_ADDRESS || import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS || '0xfBa3E093ad88Ad56abd90956Bc383898bb85e0b2',
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://soccerleague.vercel.app',
    football: {
      key: import.meta.env.VITE_API_FOOTBALL_KEY || 'demo-key',
      baseUrl: import.meta.env.VITE_API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
    },
  },

  // Oracle service
  oracle: {
    privateKey: import.meta.env.VITE_ORACLE_PRIVATE_KEY,
    serviceUrl: import.meta.env.VITE_ORACLE_SERVICE_URL || 'http://localhost:3002',
  },

  // Analytics and monitoring
  analytics: {
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  },

  // Feature flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    errorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  },
} as const;

// Validation function
export const validateConfig = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required environment variables
  if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
    warnings.push('VITE_WALLETCONNECT_PROJECT_ID not set - using demo project ID');
  }

  if (!import.meta.env.VITE_BLEAG_TOKEN_ADDRESS) {
    warnings.push('VITE_BLEAG_TOKEN_ADDRESS not set - using demo address');
  }

  if (!import.meta.env.VITE_MATCH_MANAGER_ADDRESS) {
    warnings.push('VITE_MATCH_MANAGER_ADDRESS not set - using demo address');
  }

  // Log warnings in development
  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn('Configuration warnings (development mode):', warnings);
  }

  // Only fail if critical errors exist
  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors);
    return false;
  }

  return true;
};

// Log configuration in development
if (config.app.debug) {
  console.log('SoccerLeague Configuration:', {
    app: config.app,
    wallet: { ...config.wallet, projectId: config.wallet.projectId ? '***' : undefined },
    contracts: config.contracts,
    api: { ...config.api, football: { ...config.api.football, key: config.api.football.key ? '***' : undefined } },
    oracle: { ...config.oracle, privateKey: config.oracle.privateKey ? '***' : undefined },
    features: config.features,
  });
}
