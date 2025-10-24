import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { contractHelpers } from '@/lib/wagmi';
import { contracts } from '@/lib/wagmi';
import { Match, UserStats, Prediction } from '@/lib/contracts';

// Hook for token operations
export const useToken = () => {
  const { address } = useAccount();

  const { data: balance } = useContractRead({
    ...contractHelpers.getTokenBalance(address || '0x0'),
    enabled: !!address,
  });

  const { data: allowance } = useContractRead({
    ...contractHelpers.getTokenAllowance(address || '0x0', contracts.matchManager.address),
    enabled: !!address,
  });

  const { writeContract: approveWrite, isPending: isApproving, error: approveError } = useContractWrite();

  const approve = (amount: bigint) => {
    return approveWrite({
      address: contracts.bleagToken.address,
      abi: contracts.bleagToken.abi,
      functionName: 'approve',
      args: [contracts.matchManager.address, amount],
    });
  };

  return {
    balance,
    allowance,
    approve,
    isApproving,
    approveError,
  };
};

// Hook for match operations
export const useMatches = () => {
  const { address } = useAccount();

  const { data: openMatches } = useContractRead({
    ...contractHelpers.getOpenMatches(),
  });

  const { data: activeMatches } = useContractRead({
    ...contractHelpers.getActiveMatches(),
  });

  const { data: completedMatches } = useContractRead({
    ...contractHelpers.getCompletedMatches(),
  });

  const { data: userMatches } = useContractRead({
    ...contractHelpers.getUserMatches(address || '0x0'),
    enabled: !!address,
  });

  const { data: userStats } = useContractRead({
    ...contractHelpers.getUserStats(address || '0x0'),
    enabled: !!address,
  }) as { data: UserStats | undefined };

  return {
    openMatches: openMatches as number[] | undefined,
    activeMatches: activeMatches as number[] | undefined,
    completedMatches: completedMatches as number[] | undefined,
    userMatches: userMatches as number[] | undefined,
    userStats,
  };
};

// Hook for creating matches (doesn't require a matchId)
export const useCreateMatch = () => {
  const { writeContract: createMatchWrite, isPending: isCreating, error: createError } = useContractWrite();

  const createMatch = (fixtureId: string, prediction: Prediction, stakeAmount: bigint) => {
    return createMatchWrite({
      address: contracts.matchManager.address,
      abi: contracts.matchManager.abi,
      functionName: 'createMatch',
      args: [fixtureId, prediction, stakeAmount],
    });
  };

  return {
    createMatch,
    isCreating,
    createError,
  };
};

// Hook for individual match operations
export const useMatch = (matchId: number) => {
  const { data: match } = useContractRead({
    ...contractHelpers.getMatch(matchId),
  }) as { data: Match | undefined };

  const { writeContract: joinMatchWrite, isPending: isJoining, error: joinError } = useContractWrite();
  const { writeContract: cancelMatchWrite, isPending: isCancelling, error: cancelError } = useContractWrite();

  const joinMatch = (prediction: Prediction) => {
    return joinMatchWrite({
      address: contracts.matchManager.address,
      abi: contracts.matchManager.abi,
      functionName: 'joinMatch',
      args: [matchId, prediction],
    });
  };

  const cancelMatch = () => {
    return cancelMatchWrite({
      address: contracts.matchManager.address,
      abi: contracts.matchManager.abi,
      functionName: 'cancelMatch',
      args: [matchId],
    });
  };

  return {
    match,
    joinMatch,
    cancelMatch,
    isJoining,
    isCancelling,
    joinError,
    cancelError,
  };
};

// Note: For fetching multiple matches data, you'd need to use individual useContractRead hooks
// or implement a custom solution that doesn't violate the rules of hooks

// Hook for transaction status using wagmi v2 API
export const useTransactionStatus = (hash: `0x${string}` | undefined) => {
  const { data: receipt, isLoading, error } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    receipt,
    isLoading,
    error,
    isSuccess: !!receipt,
  };
};

// Hook for contract events
export const useContractEvents = () => {
  // This would be used with wagmi's useWatchContractEvent
  // For now, we'll return a placeholder
  return {
    onMatchCreated: () => {},
    onMatchJoined: () => {},
    onMatchSettled: () => {},
  };
};
