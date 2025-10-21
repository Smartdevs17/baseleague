import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { config as appConfig } from './config';

// Select chain based on environment
const selectedChain = appConfig.wallet.chainId === '8453' ? base : baseSepolia;

export const config = getDefaultConfig({
  appName: appConfig.app.name,
  projectId: appConfig.wallet.projectId,
  chains: [selectedChain],
  ssr: false,
});
