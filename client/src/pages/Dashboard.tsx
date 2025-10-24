import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import JoinMatchModal from '@/components/JoinMatchModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp, Wallet } from 'lucide-react';
import { Match, PredictionType } from '@/types/match';
import { toast } from 'sonner';
import { useMatches, useToken, useMatch } from '@/hooks/useContracts';
import { Prediction, MatchStatus } from '@/lib/contracts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  // Smart contract hooks
  const { balance, allowance, approve, isApproving } = useToken();
  const { openMatches, activeMatches, completedMatches, userStats } = useMatches();
  const [selectedMatchId, setSelectedMatchId] = useState<number>(0);
  const match = useMatch(selectedMatchId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [blockchainMatches, setBlockchainMatches] = useState<Match[]>([]);

  // Fetch blockchain match data when openMatches changes
  useEffect(() => {
    if (openMatches && openMatches.length > 0) {
      // Create match data based on the match IDs from blockchain
      const matches: Match[] = openMatches.map((matchId, index) => ({
        id: matchId.toString(),
        creator: '0x0000000000000000000000000000000000000000',
        stake: '1000000000000000000', // 1 BLEAG token in wei
        fixtureId: matchId,
        fixture: {
          id: matchId,
          date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
          homeTeam: `Team ${index + 1}A`,
          awayTeam: `Team ${index + 1}B`,
          homeTeamLogo: '/api/placeholder/40/40',
          awayTeamLogo: '/api/placeholder/40/40',
          status: 'upcoming' as const,
          league: 'Premier League',
        },
        creatorPrediction: 'home' as const,
        settled: false,
        status: 'open' as const,
        createdAt: Date.now(),
      }));
      setBlockchainMatches(matches);
    } else {
      setBlockchainMatches([]);
    }
  }, [openMatches]);

  const handleJoinClick = (matchId: string) => {
    // Find the blockchain match
    const blockchainMatch = blockchainMatches.find((m) => m.id === matchId);
    if (blockchainMatch) {
      setSelectedMatch(blockchainMatch);
      setSelectedMatchId(parseInt(matchId));
      setJoinModalOpen(true);
    }
  };

  const handleJoinConfirm = async (matchId: string, prediction: PredictionType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Convert prediction type to contract enum
      const contractPrediction = prediction === 'home' ? Prediction.HOME : 
                               prediction === 'draw' ? Prediction.DRAW : 
                               Prediction.AWAY;

      // Join the match using smart contract
      await match.joinMatch(contractPrediction);
      
      toast.success('Match joined successfully!', {
        description: `You've joined the match with prediction: ${prediction.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Failed to join match:', error);
      toast.error('Failed to join match. Please try again.');
    }
  };

  // No sync needed - we're using blockchain data directly

  const handleApproveTokens = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Approve a large amount for convenience (1000 BLEAG tokens)
      const amount = BigInt(1000) * BigInt(10 ** 18);
      await approve(amount);
      toast.success('Tokens approved successfully!');
    } catch (error) {
      console.error('Failed to approve tokens:', error);
      toast.error('Failed to approve tokens. Please try again.');
    }
  };

  // Convert fixtures to matches format for the original UI
  // Filter blockchain matches based on search query
  const filteredMatches = blockchainMatches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // No error handling needed for blockchain data - it's handled by wagmi

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
            
            {/* Wallet Status */}
            {isConnected ? (
              <div className="mb-6 p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Wallet Connected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Balance:</span>
                    <span className="ml-2 text-white font-semibold">
                      {balance ? (Number(balance) / 10 ** 18).toFixed(2) : '0'} BLEAG
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">Allowance:</span>
                    <span className="ml-2 text-white font-semibold">
                      {allowance ? (Number(allowance) / 10 ** 18).toFixed(2) : '0'} BLEAG
                    </span>
                  </div>
                  {userStats && (
                    <div>
                      <span className="text-white/70">Win Rate:</span>
                      <span className="ml-2 text-white font-semibold">
                        {userStats.winRate.toString()}%
                      </span>
                    </div>
                  )}
                </div>
                {(!allowance || Number(allowance) === 0) && (
                  <div className="mt-3">
                    <Button
                      onClick={handleApproveTokens}
                      disabled={isApproving}
                      size="sm"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      {isApproving ? 'Approving...' : 'Approve Tokens'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
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

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                disabled={!isConnected}
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
              Open Matches {openMatches && `(${openMatches.length})`}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active Matches {activeMatches && `(${activeMatches.length})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed {completedMatches && `(${completedMatches.length})`}
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
            ) : !openMatches ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading blockchain matches...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No open matches available. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match) => (
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
            {filteredMatches.filter((m) => m.status === 'active').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active matches at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches
                  .filter((m) => m.status === 'active')
                  .map((match) => (
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
            {filteredMatches.filter((m) => m.status === 'completed').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No completed matches yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches
                  .filter((m) => m.status === 'completed')
                  .map((match) => (
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