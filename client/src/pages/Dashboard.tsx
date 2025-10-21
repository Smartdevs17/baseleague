import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import JoinMatchModal from '@/components/JoinMatchModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { Match, PredictionType } from '@/types/match';
import { toast } from 'sonner';

// Mock data - replace with actual contract calls
const mockMatches: Match[] = [
  {
    id: '1',
    creator: '0x1234567890123456789012345678901234567890',
    stake: '50000000000000000000',
    fixtureId: 12345,
    fixture: {
      id: 12345,
      date: '2025-10-22T19:00:00Z',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      homeTeamLogo: 'https://media.api-sports.io/football/teams/33.png',
      awayTeamLogo: 'https://media.api-sports.io/football/teams/40.png',
      status: 'upcoming',
      league: 'Premier League',
    },
    creatorPrediction: 'home',
    settled: false,
    status: 'open',
    createdAt: Date.now(),
  },
  {
    id: '2',
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    joiner: '0x9876543210987654321098765432109876543210',
    stake: '100000000000000000000',
    fixtureId: 12346,
    fixture: {
      id: 12346,
      date: '2025-10-23T20:00:00Z',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      homeTeamLogo: 'https://media.api-sports.io/football/teams/529.png',
      awayTeamLogo: 'https://media.api-sports.io/football/teams/541.png',
      status: 'upcoming',
      league: 'La Liga',
    },
    creatorPrediction: 'home',
    joinerPrediction: 'away',
    settled: false,
    status: 'active',
    createdAt: Date.now() - 3600000,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [matches] = useState<Match[]>(mockMatches);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleJoinClick = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setJoinModalOpen(true);
    }
  };

  const handleJoinConfirm = async (matchId: string, prediction: PredictionType) => {
    // TODO: Implement actual contract call
    toast.success('Match joined successfully!', {
      description: `You've joined the match with prediction: ${prediction.toUpperCase()}`,
    });
  };

  const filteredMatches = matches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
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
            <TabsTrigger value="open">Open Matches</TabsTrigger>
            <TabsTrigger value="active">Active Matches</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {filteredMatches.filter((m) => m.status === 'open').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No open matches available. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches
                  .filter((m) => m.status === 'open')
                  .map((match) => (
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
