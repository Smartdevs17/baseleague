import { useState } from 'react';
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
import { useOpenMatchesWithFixtures } from '@/hooks/useOpenMatchesWithFixtures';
import { Prediction } from '@/lib/contracts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  // Smart contract hooks
  const { balance, allowance, approve, isApproving } = useToken();
  const { activeMatches, completedMatches, userStats } = useMatches();
  const { matches: blockchainMatches, isLoading: matchesLoading, error: matchesError, openMatchesCount } = useOpenMatchesWithFixtures();
  const [selectedMatchId, setSelectedMatchId] = useState<number>(0);
  const match = useMatch(selectedMatchId);

  console.log('blockchainMatches from custom hook:', blockchainMatches);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

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

  // Filter blockchain matches based on search query
  const filteredMatches = blockchainMatches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('filteredMatches:', filteredMatches);

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
              Open Matches ({openMatchesCount})
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
            ) : matchesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading blockchain matches...
              </div>
            ) : matchesError ? (
              <div className="text-center py-12 text-muted-foreground">
                Error loading matches. Please try again.
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