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
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    chainId: import.meta.env.VITE_CHAIN_ID || '84532',
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://sepolia.base.org',
  },

  // Smart contracts
  contracts: {
    bleagToken: import.meta.env.VITE_BLEAG_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    matchManager: import.meta.env.VITE_MATCH_MANAGER_ADDRESS || '0x0000000000000000000000000000000000000000',
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    football: {
      key: import.meta.env.VITE_API_FOOTBALL_KEY,
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

  if (!config.wallet.projectId) {
    errors.push('VITE_WALLETCONNECT_PROJECT_ID is required');
  }

  if (config.contracts.bleagToken === '0x0000000000000000000000000000000000000000') {
    errors.push('VITE_BLEAG_TOKEN_ADDRESS must be set to a valid contract address');
  }

  if (config.contracts.matchManager === '0x0000000000000000000000000000000000000000') {
    errors.push('VITE_MATCH_MANAGER_ADDRESS must be set to a valid contract address');
  }

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
    oracle: { ...config.oracle, privateKey: config.oracle.privateKey ? '***' : undefined },
    features: config.features,
  });
}
