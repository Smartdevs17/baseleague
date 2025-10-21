import { config } from './config';

// Smart Contract ABIs and Addresses
export const BLEAG_TOKEN_ADDRESS = config.contracts.bleagToken;
export const MATCH_MANAGER_ADDRESS = config.contracts.matchManager;

export const BLEAG_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
] as const;

export const MATCH_MANAGER_ABI = [
  'event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 stake, uint256 fixtureId)',
  'event MatchJoined(uint256 indexed matchId, address indexed joiner)',
  'event MatchSettled(uint256 indexed matchId, address indexed winner, uint256 reward)',
  
  'function createMatch(uint256 stake, uint256 fixtureId, uint8 prediction) returns (uint256)',
  'function joinMatch(uint256 matchId, uint8 prediction) returns (bool)',
  'function getMatch(uint256 matchId) view returns (tuple(address creator, address joiner, uint256 stake, uint256 fixtureId, uint8 creatorPrediction, uint8 joinerPrediction, bool settled, address winner))',
  'function getUserMatches(address user) view returns (uint256[])',
] as const;
