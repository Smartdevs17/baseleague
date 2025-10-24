import { config } from './config';
import matchManagerABI from '../contracts/match_manager.json';
import tokenABI from '../contracts/token.json';

// Smart Contract ABIs and Addresses
export const BLEAG_TOKEN_ADDRESS = config.contracts.bleagToken;
export const MATCH_MANAGER_ADDRESS = config.contracts.matchManager;

// Use the actual ABI files instead of hardcoded ABIs
export const BLEAG_TOKEN_ABI = tokenABI;
export const MATCH_MANAGER_ABI = matchManagerABI;

// Type definitions for better TypeScript support
export interface Match {
  id: number;
  creator: string;
  joiner: string;
  stakeAmount: bigint;
  fixtureId: string;
  creatorPrediction: number;
  joinerPrediction: number;
  status: number;
  result: number;
  createdAt: bigint;
  completedAt: bigint;
  isSettled: boolean;
}

export interface UserStats {
  totalMatches: bigint;
  wins: bigint;
  losses: bigint;
  totalStaked: bigint;
  totalWinnings: bigint;
  winRate: bigint;
}

// Enum values for better type safety
export enum Prediction {
  HOME = 0,
  DRAW = 1,
  AWAY = 2,
}

export enum MatchStatus {
  OPEN = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export enum MatchResult {
  CREATOR_WIN = 0,
  DRAW = 1,
  JOINER_WIN = 2,
  CANCELLED = 3,
}
