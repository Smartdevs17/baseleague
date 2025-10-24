import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { config as appConfig } from './config';
import { BLEAG_TOKEN_ABI, MATCH_MANAGER_ABI, BLEAG_TOKEN_ADDRESS, MATCH_MANAGER_ADDRESS } from './contracts';

// Select chain based on environment
const selectedChain = appConfig.wallet.chainId === '8453' ? base : baseSepolia;

export const config = getDefaultConfig({
  appName: appConfig.app.name,
  projectId: appConfig.wallet.projectId,
  chains: [selectedChain],
  ssr: false,
});

// Contract configurations for easy access
export const contracts = {
  bleagToken: {
    address: BLEAG_TOKEN_ADDRESS,
    abi: BLEAG_TOKEN_ABI,
  },
  matchManager: {
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
  },
} as const;

// Helper functions for common contract interactions
export const contractHelpers = {
  // Token functions
  getTokenBalance: (address: string) => ({
    address: BLEAG_TOKEN_ADDRESS,
    abi: BLEAG_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  }),
  
  approveToken: (spender: string, amount: bigint) => ({
    address: BLEAG_TOKEN_ADDRESS,
    abi: BLEAG_TOKEN_ABI,
    functionName: 'approve',
    args: [spender, amount],
  }),
  
  getTokenAllowance: (owner: string, spender: string) => ({
    address: BLEAG_TOKEN_ADDRESS,
    abi: BLEAG_TOKEN_ABI,
    functionName: 'allowance',
    args: [owner, spender],
  }),

  // Match Manager functions
  createMatch: (fixtureId: string, prediction: number, stakeAmount: bigint) => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'createMatch',
    args: [fixtureId, prediction, stakeAmount],
  }),
  
  joinMatch: (matchId: number, prediction: number) => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'joinMatch',
    args: [matchId, prediction],
  }),
  
  getMatch: (matchId: number) => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'getMatch',
    args: [matchId],
  }),
  
  getUserMatches: (userAddress: string) => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'getUserMatches',
    args: [userAddress],
  }),
  
  getOpenMatches: () => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'getOpenMatches',
    args: [],
  }),
  
  getActiveMatches: () => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'getActiveMatches',
    args: [],
  }),
  
  getCompletedMatches: () => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'getCompletedMatches',
    args: [],
  }),
  
  getUserStats: (userAddress: string) => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'getUserStats',
    args: [userAddress],
  }),
  
  cancelMatch: (matchId: number) => ({
    address: MATCH_MANAGER_ADDRESS,
    abi: MATCH_MANAGER_ABI,
    functionName: 'cancelMatch',
    args: [matchId],
  }),
} as const;
