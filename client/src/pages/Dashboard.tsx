import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import JoinMatchModal from '@/components/JoinMatchModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp, Wallet, Home } from 'lucide-react';
import { Match, PredictionType } from '@/types/match';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { useResultsConsumer } from '@/hooks/useContracts';
import { useEthBalance, usePredictionContract, useContractEvents } from '@/hooks/useContracts';
import { useContractMatches } from '@/hooks/useContractMatches';
import { Prediction } from '@/lib/contracts';
import { formatEther } from 'viem';
import { getExplorerUrl } from '@/utils/explorer';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  
  // Real contract hooks - using ETH instead of tokens
  const { balance, formatted: balanceFormatted, symbol } = useEthBalance();
  const { placeBet, settleMatch, isPending: isPlacingBet, isConfirming, isConfirmed, hash: betTxHash } = usePredictionContract();
  
  // Check if user is the ResultsConsumer owner (deployer)
  // Deployer check removed from UI; backend handles settlement automatically now
  const isDeployer = false;
  
  // Listen to contract events for new bets (triggers toasts)
  useContractEvents();
  
  // Fetch matches from contract
  const { 
    openMatches, 
    activeMatches, 
    completedMatches, 
    isLoading: matchesLoading, 
    error: matchesError,
    openMatchesCount,
    activeMatchesCount,
    completedMatchesCount
  } = useContractMatches();
  
  // Use real data instead of mock
  const openMatchesLoading = matchesLoading;
  const openMatchesError = matchesError;
  const activeMatchesLoading = matchesLoading;
  const activeMatchesError = matchesError;
  const completedMatchesLoading = matchesLoading;
  const completedMatchesError = matchesError;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [showMatchCreatedMessage, setShowMatchCreatedMessage] = useState(false);
  
  // Check if we just came from creating a match
  useEffect(() => {
    if (location.state?.fromCreateMatch) {
      setShowMatchCreatedMessage(true);
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowMatchCreatedMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  // Note: Contract events are handled by useContractEvents hook (toasts)
  // The useContractMatches hook will automatically refetch when bets change

  const handleJoinClick = (matchId: string) => {
    // Find the open match
    const openMatch = openMatches.find((m) => m.id === matchId);
    
    // Debug: Log the match being passed to modal
    if (openMatch) {
      console.log('🔍 [Dashboard] Passing match to JoinMatchModal:', {
        matchId: openMatch.id,
        creator: openMatch.creator,
        creatorPrediction: openMatch.creatorPrediction,
      });
    }
    
    if (!openMatch) {
      toast.error('Match not found');
      return;
    }

    // Prevent user from joining their own match
    if (address && openMatch.creator.toLowerCase() === address.toLowerCase()) {
      toast.error('Cannot join your own match', {
        description: 'You cannot join a match that you created. Please wait for another player to join.',
      });
      return;
    }

    setSelectedMatch(openMatch);
    setJoinModalOpen(true);
  };

  const handleJoinConfirm = async (matchId: string, prediction: PredictionType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if user has sufficient ETH balance
    if (balance === 0n) {
      toast.error('Insufficient ETH balance', {
        description: 'You need ETH to join a match. Please acquire some ETH first.'
      });
      return;
    }

    try {
      // Find the match to get stake amount
      console.log('🔍 [handleJoinConfirm] Looking for match:', {
        matchId,
        availableMatchIds: openMatches.map(m => m.id),
        openMatches: openMatches.map(m => ({
          id: m.id,
          gameweek: m.id.split('-')[0],
          matchId: m.id.split('-')[1],
          fixtureId: m.fixtureId,
        })),
      });
      
      const selectedMatch = openMatches.find(m => m.id === matchId);
      if (!selectedMatch) {
        console.error('❌ [handleJoinConfirm] Match not found!', {
          searchedMatchId: matchId,
          availableIds: openMatches.map(m => m.id),
        });
        toast.error('Match not found');
        return;
      }
      
      console.log('✅ [handleJoinConfirm] Match found:', {
        matchId: selectedMatch.id,
        fixtureId: selectedMatch.fixtureId,
        stake: selectedMatch.stake,
      });

      // Prevent user from joining their own match
      if (address && selectedMatch.creator.toLowerCase() === address.toLowerCase()) {
        toast.error('Cannot join your own match', {
          description: 'You cannot join a match that you created. Please wait for another player to join.',
        });
        return;
      }

      // Check if user has enough ETH for the stake amount
      const stakeAmount = BigInt(selectedMatch.stake);
      if (balance < stakeAmount) {
        toast.error('Insufficient ETH balance', {
          description: `You need at least ${parseFloat(formatEther(BigInt(selectedMatch.stake))).toFixed(3)} ETH to join this match.`
        });
        return;
      }

      // Convert prediction type to contract enum
      const contractPrediction: Prediction = prediction === 'home' ? Prediction.HOME_WIN : 
                               prediction === 'draw' ? Prediction.DRAW : 
                               Prediction.AWAY_WIN;

      // Extract gameweek and matchId from match ID (format: "gameweek-matchId")
      // Match ID format is: "gameweek-matchId" (e.g., "1-123")
      const matchIdParts = matchId.split('-');
      const gameweek = matchIdParts.length > 0 ? parseInt(matchIdParts[0]) || 1 : 1;
      const contractMatchId = matchIdParts.length > 1 ? parseInt(matchIdParts[1]) || parseInt(selectedMatch.fixtureId.toString()) || 1 : parseInt(selectedMatch.fixtureId.toString()) || 1;
      // Convert stake from wei to ETH string
      // Use 9 decimal places to avoid rounding to 0 for small amounts
      const stakeAmountWei = BigInt(selectedMatch.stake);
      const stakeAmountEth = formatEther(stakeAmountWei);
      const stakeAmountStr = parseFloat(stakeAmountEth).toFixed(9).replace(/\.?0+$/, ''); // Remove trailing zeros
      
      console.log('🔍 [handleJoinConfirm] Stake amount conversion:', {
        stakeWei: selectedMatch.stake,
        stakeAmountWei: stakeAmountWei.toString(),
        stakeAmountEth,
        stakeAmountStr,
        parseFloatResult: parseFloat(stakeAmountEth),
      });
      
      console.log('🔍 [handleJoinConfirm] Extracted match details:', {
        originalMatchId: matchId,
        matchIdParts,
        gameweek,
        contractMatchId,
        fixtureId: selectedMatch.fixtureId,
        stakeAmountStr,
      });

      // Place bet (sends ETH directly - no approval needed)
      console.log('🔍 [handleJoinConfirm] Placing bet...', {
        gameweek,
        contractMatchId,
        contractPrediction,
        stakeAmountStr,
        matchId,
        selectedMatchId: selectedMatch.id,
      });
      
      toast.info('Please confirm the transaction in MetaMask...', {
        id: 'join-tx',
        duration: 10000,
      });
      
      const txHash = await placeBet(gameweek, contractMatchId, contractPrediction, stakeAmountStr);
      
      console.log('✅ [handleJoinConfirm] Bet placed!', {
        txHash,
        gameweek,
        contractMatchId,
        contractPrediction,
        expectedMatchKey: `${gameweek}-${contractMatchId}`,
      });
      
      // Dismiss confirmation toast and show success
      toast.dismiss('join-tx');
      toast.success('Transaction submitted!', {
        description: `Your bet is being processed. The match will move to Active Matches once confirmed (usually 10-30 seconds).`,
        duration: 5000,
        action: txHash ? {
          label: 'View on Explorer',
          onClick: () => window.open(getExplorerUrl(txHash), '_blank'),
        } : undefined,
      });
      
      // Close modal
      setJoinModalOpen(false);
      
      // Log what to expect
      console.log('⏳ [handleJoinConfirm] Transaction submitted. Waiting for confirmation...');
      console.log('💡 The match should appear in Active Matches once:');
      console.log('   1. Transaction is confirmed on-chain');
      console.log('   2. nextBetId updates (refetches every 5 seconds)');
      console.log('   3. New bet is fetched and grouped with existing bet');
      console.log(`   4. Match key "${gameweek}-${contractMatchId}" should have 2 bets`);
    } catch (error) {
      console.error('Failed to join match:', error);
      
      // Dismiss any pending toasts
      toast.dismiss('join-tx');
      
      // Check if this is a user rejection
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'USER_REJECTED' || 
          errorMessage.includes('User rejected') || 
          errorMessage.includes('denied') || 
          errorMessage.includes('user rejected') ||
          errorMessage.includes('cancelled') ||
          errorMessage.includes('canceled')) {
        // User cancelled - don't show error, just close modal
        setJoinModalOpen(false);
        return;
      }
      
      // Real error - show error toast
      toast.error('Failed to join match. Please try again.', {
        description: errorMessage || 'An error occurred while joining the match.',
      });
    }
  };

  // Filter matches based on search query
  const filteredOpenMatches = openMatches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActiveMatches = activeMatches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedMatches = completedMatches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Removed verbose debug logging

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-accent to-primary p-8 mb-8 shadow-glow">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to BaseLeague
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              Compete head-to-head in fantasy football matches. Stake your ETH, predict match outcomes, and win big!
            </p>
            
            {/* Wallet connection status - simplified */}
            {!isConnected && (
              <div className="mb-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Wallet Not Connected</span>
                </div>
                <p className="text-sm text-red-300 mt-1">
                  Please connect your wallet to participate in matches
                </p>
              </div>
            )}

            {/* ETH balance warning */}
            {isConnected && balance === 0n && (
              <div className="mb-6 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">No ETH Balance</span>
                </div>
                <p className="text-sm text-yellow-300 mt-1">
                  You need ETH to create or join matches. Please acquire some ETH from a faucet.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                disabled={!isConnected || balance === 0n}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Match
              </Button>
              <Button
                onClick={() => navigate('/leaderboard')}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Leaderboard
              </Button>
              <Button
                onClick={() => navigate('/')}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        {/* Matches Tabs */}
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="open">
              Open Matches ({openMatchesCount})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active Matches ({activeMatchesCount})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedMatchesCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {/* Show message if match was just created */}
            {showMatchCreatedMessage && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-400">✅ Match Created Successfully!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your bet has been placed on-chain. The Dashboard currently shows mock data for demonstration. Your real match is confirmed and stored on the blockchain.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMatchCreatedMessage(false)}
                    className="text-muted-foreground hover:text-foreground text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            
            {!isConnected ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to view and join matches
                </p>
              </div>
            ) : openMatchesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading open matches...
              </div>
            ) : openMatchesError ? (
              <div className="text-center py-12 text-muted-foreground">
                Error loading open matches. Please try again.
                <br />
                <small className="text-xs">Debug: {JSON.stringify(openMatchesError)}</small>
              </div>
            ) : filteredOpenMatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No open matches available. Create one to get started!
                {showMatchCreatedMessage && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Your match was created successfully! It's stored on-chain and will appear here once we fetch from the contract.
                  </p>
                )}
              </div>
            ) : balance === 0n ? (
              <div className="text-center py-12">
                <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">No ETH Balance</span>
                  </div>
                  <p className="text-sm text-yellow-300">
                    You need ETH to join matches. Please acquire some ETH from a faucet.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                  {filteredOpenMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      showActions={false}
                      currentUserAddress={address}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOpenMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onJoin={handleJoinClick}
                      currentUserAddress={address}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeMatchesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading active matches...
              </div>
            ) : activeMatchesError ? (
              <div className="text-center py-12 text-muted-foreground">
                Error loading active matches. Please try again.
                <br />
                <small className="text-xs">Debug: {JSON.stringify(activeMatchesError)}</small>
              </div>
            ) : filteredActiveMatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active matches at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActiveMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onSettle={settleMatch}
                      showActions={true}
                      currentUserAddress={address}
                      isDeployer={isDeployer || false}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedMatchesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading completed matches...
              </div>
            ) : completedMatchesError ? (
              <div className="text-center py-12 text-muted-foreground">
                Error loading completed matches. Please try again.
                <br />
                <small className="text-xs">Debug: {JSON.stringify(completedMatchesError)}</small>
              </div>
            ) : filteredCompletedMatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No completed matches yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompletedMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      showActions={false}
                      currentUserAddress={address}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <JoinMatchModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        match={selectedMatch}
        onConfirm={handleJoinConfirm}
      />
    </div>
  );
};

export default Dashboard;