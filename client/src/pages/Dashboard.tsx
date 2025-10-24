import { useState, useEffect } from 'react';
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
import { useFixtures, useFilteredFixtures, useSyncFixtures } from '@/hooks/useFixtures';
import { useTeamLogos } from '@/hooks/useTeamLogos';
import { preloadTeamLogos } from '@/utils/logoPreloader';
import { ApiFixture } from '@/store/fixtures';

const Dashboard = () => {
  const navigate = useNavigate();
  const { fixtures, loading, error, refetch } = useFixtures();
  const { fixtures: filteredFixtures, updateFilters } = useFilteredFixtures();
  const syncFixturesMutation = useSyncFixtures();
  const { getTeamLogo } = useTeamLogos();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Handle search
  useEffect(() => {
    updateFilters({ searchQuery });
  }, [searchQuery, updateFilters]);

  // Preload team logos when fixtures are loaded
  useEffect(() => {
    if (fixtures.length > 0) {
      preloadTeamLogos(fixtures);
    }
  }, [fixtures]);

  const handleJoinClick = (matchId: string) => {
    // Convert fixture to match format for the modal
    const fixture = fixtures.find((f) => f.id === matchId);
    if (fixture) {
      const match: Match = {
        id: fixture.id,
        creator: '0x0000000000000000000000000000000000000000',
        stake: '0',
        fixtureId: parseInt(fixture.externalId),
        fixture: {
          id: parseInt(fixture.externalId),
          date: fixture.kickoffTime,
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeTeamLogo: '',
          awayTeamLogo: '',
          status: fixture.status === 'pending' ? 'upcoming' : fixture.status as 'upcoming' | 'live' | 'finished',
          league: 'Premier League',
        },
        creatorPrediction: 'home',
        settled: false,
        status: fixture.status === 'pending' ? 'open' : 'active',
        createdAt: Date.now(),
      };
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

  const handleSyncFixtures = async () => {
    try {
      await syncFixturesMutation.mutateAsync();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Convert fixtures to matches format for the original UI
  const matches: Match[] = fixtures.map(fixture => ({
    id: fixture.id,
    creator: '0x0000000000000000000000000000000000000000',
    stake: fixture.totalPoolSize.toString(),
    fixtureId: parseInt(fixture.externalId),
    fixture: {
      id: parseInt(fixture.externalId),
      date: fixture.kickoffTime,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeTeamLogo: getTeamLogo(fixture.homeTeamId, fixture.homeTeam),
      awayTeamLogo: getTeamLogo(fixture.awayTeamId, fixture.awayTeam),
      status: fixture.status === 'pending' ? 'upcoming' : fixture.status as 'upcoming' | 'live' | 'finished',
      league: 'Premier League',
    },
    creatorPrediction: 'home',
    settled: fixture.status === 'finished',
    status: fixture.status === 'pending' ? 'open' : fixture.status === 'live' ? 'active' : 'completed',
    createdAt: new Date(fixture.createdAt).getTime(),
  }));

  const filteredMatches = matches.filter(
    (match) =>
      match.fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load fixtures</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <Button
                onClick={handleSyncFixtures}
                disabled={syncFixturesMutation.isPending}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {syncFixturesMutation.isPending ? 'Syncing...' : 'Sync Fixtures'}
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
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading fixtures...
              </div>
            ) : filteredMatches.filter((m) => m.status === 'open').length === 0 ? (
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