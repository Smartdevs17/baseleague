import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
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

  const approveWrite = useContractWrite({
    address: contracts.bleagToken.address,
    abi: contracts.bleagToken.abi,
    functionName: 'approve',
  });

  const approve = (amount: bigint) => {
    return approveWrite.write({
      args: [contracts.matchManager.address, amount],
    });
  };

  return {
    balance,
    allowance,
    approve,
    isApproving: approveWrite.isPending,
    approveError: approveWrite.error,
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

// Hook for individual match operations
export const useMatch = (matchId: number) => {
  const { data: match } = useContractRead({
    ...contractHelpers.getMatch(matchId),
  }) as { data: Match | undefined };

  const createMatchWrite = useContractWrite({
    address: contracts.matchManager.address,
    abi: contracts.matchManager.abi,
    functionName: 'createMatch',
  });

  const joinMatchWrite = useContractWrite({
    address: contracts.matchManager.address,
    abi: contracts.matchManager.abi,
    functionName: 'joinMatch',
  });

  const cancelMatchWrite = useContractWrite({
    address: contracts.matchManager.address,
    abi: contracts.matchManager.abi,
    functionName: 'cancelMatch',
  });

  const createMatch = (fixtureId: string, prediction: Prediction, stakeAmount: bigint) => {
    return createMatchWrite.write({
      args: [fixtureId, prediction, stakeAmount],
    });
  };

  const joinMatch = (prediction: Prediction) => {
    return joinMatchWrite.write({
      args: [matchId, prediction],
    });
  };

  const cancelMatch = () => {
    return cancelMatchWrite.write({
      args: [matchId],
    });
  };

  return {
    match,
    createMatch,
    joinMatch,
    cancelMatch,
    isCreating: createMatchWrite.isPending,
    isJoining: joinMatchWrite.isPending,
    isCancelling: cancelMatchWrite.isPending,
    createError: createMatchWrite.error,
    joinError: joinMatchWrite.error,
    cancelError: cancelMatchWrite.error,
  };
};

// Hook for transaction status
export const useTransactionStatus = (hash: `0x${string}` | undefined) => {
  const { data: receipt, isLoading, error } = useWaitForTransaction({
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
