// Configuration utility for environment variables
export const config = {
  // Application settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'BaseLeague',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // Wallet connection
  wallet: {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chainId: import.meta.env.VITE_CHAIN_ID || '84532', // Base Sepolia
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://base-sepolia-rpc.publicnode.com',
  },

  // Smart contracts
  contracts: {
    bleagToken: import.meta.env.VITE_BLEAG_TOKEN_ADDRESS || '0x1234567890123456789012345678901234567890',
    resultsConsumer: import.meta.env.VITE_RESULTS_CONSUMER_ADDRESS || '0xaF404EA0C622c1bcd7ddca1DC866Ad2eAe248592', // Chainlink ResultsConsumer
    predictionContract: import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS || '0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB',
    // Legacy support
    matchManager: import.meta.env.VITE_MATCH_MANAGER_ADDRESS || import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS || '0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB',
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://baseleague.vercel.app',
    football: {
      key: import.meta.env.VITE_API_FOOTBALL_KEY || 'demo-key',
      baseUrl: import.meta.env.VITE_API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
    },
  },

  // Chainlink Functions (no backend service needed)
  chainlink: {
    functionsRouter: import.meta.env.VITE_CHAINLINK_FUNCTIONS_ROUTER || '0xf9B8fc078197181C841c296C876945aaa425B278',
    donId: import.meta.env.VITE_CHAINLINK_DON_ID || 'fun-base-sepolia-1',
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
  console.log('BaseLeague Configuration:', {
    app: config.app,
    wallet: { ...config.wallet, projectId: config.wallet.projectId ? '***' : undefined },
    contracts: config.contracts,
    api: { ...config.api, football: { ...config.api.football, key: config.api.football.key ? '***' : undefined } },
    chainlink: config.chainlink,
    features: config.features,
  });
}
