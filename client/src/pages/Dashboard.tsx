import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import JoinMatchModal from '@/components/JoinMatchModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp, Wallet, Home } from 'lucide-react';
import { Match, PredictionType } from '@/types/match';
import { toast } from 'sonner';
import { useMatches, useToken, useMatch } from '@/hooks/useContracts';
import { useOpenMatchesWithFixtures } from '@/hooks/useOpenMatchesWithFixtures';
import { useActiveMatchesWithFixtures } from '@/hooks/useActiveMatchesWithFixtures';
import { useCompletedMatchesWithFixtures } from '@/hooks/useCompletedMatchesWithFixtures';
import { Prediction } from '@/lib/contracts';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  
  // Smart contract hooks
  const { balance, allowance, approve, isApproving } = useToken();
  const { userStats } = useMatches();
  
  // Custom hooks for matches with fixtures
  const { matches: openMatches, isLoading: openMatchesLoading, error: openMatchesError, openMatchesCount } = useOpenMatchesWithFixtures();
  const { matches: activeMatches, isLoading: activeMatchesLoading, error: activeMatchesError, activeMatchesCount } = useActiveMatchesWithFixtures();
  const { matches: completedMatches, isLoading: completedMatchesLoading, error: completedMatchesError, completedMatchesCount } = useCompletedMatchesWithFixtures();
  
  const [selectedMatchId, setSelectedMatchId] = useState<number>(0);
  const match = useMatch(selectedMatchId);

  console.log('Dashboard debug:', {
    openMatches: openMatches?.length,
    openMatchesLoading,
    openMatchesError,
    activeMatches: activeMatches?.length,
    completedMatches: completedMatches?.length,
    isConnected
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Trigger data refresh when navigating to dashboard
  useEffect(() => {
    // Check if we're coming from create match page
    const state = location.state as { fromCreateMatch?: boolean } | null;
    if (state?.fromCreateMatch) {
      // Check if we've already refreshed in this session
      const hasRefreshedThisSession = sessionStorage.getItem('dashboardRefreshed');
      const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
      const now = Date.now();
      
      // Only refresh if we haven't refreshed in the last 10 seconds
      const shouldRefresh = !hasRefreshedThisSession || 
        (lastRefreshTime && (now - parseInt(lastRefreshTime)) > 10000);
      
      if (shouldRefresh) {
        // Mark that we've refreshed in this session
        sessionStorage.setItem('dashboardRefreshed', 'true');
        sessionStorage.setItem('lastRefreshTime', now.toString());
        
        // Add a small delay to ensure the blockchain transaction is processed
        const timer = setTimeout(() => {
          console.log('🔄 Auto-refreshing dashboard data after match creation...');
          toast.info('Refreshing matches...', {
            description: 'Loading your newly created match'
          });
          // Force a page refresh to get the latest data
          window.location.reload();
        }, 3000);

        return () => clearTimeout(timer);
      }
    }

    // Cleanup function to clear the refresh flag when component unmounts
    return () => {
      // Clear the refresh flag when navigating away from dashboard
      sessionStorage.removeItem('dashboardRefreshed');
    };
  }, [location.state]);

  const handleJoinClick = (matchId: string) => {
    // Find the open match
    const openMatch = openMatches.find((m) => m.id === matchId);
    if (openMatch) {
      setSelectedMatch(openMatch);
      setSelectedMatchId(parseInt(matchId));
      setJoinModalOpen(true);
    }
  };

  const handleJoinConfirm = async (matchId: string, prediction: PredictionType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if user has sufficient token balance
    if (!balance || BigInt(balance.toString()) === 0n) {
      toast.error('Insufficient $BLEAG token balance', {
        description: 'You need $BLEAG tokens to join a match. Please acquire some tokens first.'
      });
      return;
    }

    try {
      // Find the match to get stake amount
      const selectedMatch = openMatches.find(m => m.id === matchId);
      if (!selectedMatch) {
        toast.error('Match not found');
        return;
      }

      // Check if user has enough tokens for the stake amount
      const stakeAmount = BigInt(selectedMatch.stake);
      if (BigInt(balance.toString()) < stakeAmount) {
        toast.error('Insufficient token balance', {
          description: `You need at least ${selectedMatch.stake} $BLEAG tokens to join this match.`
        });
        return;
      }

      // Convert prediction type to contract enum
      const contractPrediction = prediction === 'home' ? Prediction.HOME : 
                               prediction === 'draw' ? Prediction.DRAW : 
                               Prediction.AWAY;

      // Convert stake to wei (already calculated above)
      
      // Step 1: Check current allowance
      const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n;
      
      // Step 2: If allowance is insufficient, approve first
      if (currentAllowance < stakeAmount) {
        toast.info('Approving tokens for match joining...');
        
        try {
          await approve(stakeAmount);
          toast.success('Tokens approved successfully!');
          
          // Wait a moment for the approval transaction to be mined
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (approveError) {
          console.error('Failed to approve tokens:', approveError);
          toast.error('Failed to approve tokens. Please try again.');
          return;
        }
      }

      // Step 3: Join the match
      toast.info('Joining match...');
      await match.joinMatch(contractPrediction);
      
      toast.success('Match joined successfully!', {
        description: `You've joined the match with prediction: ${prediction.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Failed to join match:', error);
      
      // More specific error messages
      if (error.message?.includes('dropped') || error.message?.includes('replaced')) {
        toast.error('Transaction was dropped. Please try again with higher gas or wait for network congestion to clear.');
      } else if (error.message?.includes('insufficient')) {
        toast.error('Insufficient funds or gas. Please check your balance and try again.');
      } else {
        toast.error('Failed to join match. Please try again.');
      }
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

  console.log('filteredOpenMatches:', filteredOpenMatches);
  console.log('filteredActiveMatches:', filteredActiveMatches);
  console.log('filteredCompletedMatches:', filteredCompletedMatches);

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
              Compete head-to-head in fantasy football matches. Stake your $BLEAG tokens, predict match outcomes, and win big!
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

            {/* Token balance warning */}
            {isConnected && balance && BigInt(balance.toString()) === 0n && (
              <div className="mb-6 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">No $BLEAG Tokens</span>
                </div>
                <p className="text-sm text-yellow-300 mt-1">
                  You need $BLEAG tokens to create or join matches. Please acquire some tokens first.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                disabled={!isConnected || (balance && BigInt(balance.toString()) === 0n)}
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
              </div>
            ) : balance && BigInt(balance.toString()) === 0n ? (
              <div className="text-center py-12">
                <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">No $BLEAG Tokens</span>
                  </div>
                  <p className="text-sm text-yellow-300">
                    You need $BLEAG tokens to join matches. Please acquire some tokens first.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                  {filteredOpenMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      showActions={false}
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
                      showActions={false}
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