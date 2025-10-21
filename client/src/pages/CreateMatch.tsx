import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CreateMatchModal from '@/components/CreateMatchModal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Clock } from 'lucide-react';
import { Fixture, PredictionType } from '@/types/match';
import { toast } from 'sonner';

// Mock fixtures - replace with API-Football data
const mockFixtures: Fixture[] = [
  {
    id: 12345,
    date: '2025-10-22T19:00:00Z',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    homeTeamLogo: 'https://media.api-sports.io/football/teams/33.png',
    awayTeamLogo: 'https://media.api-sports.io/football/teams/40.png',
    status: 'upcoming',
    league: 'Premier League',
  },
  {
    id: 12346,
    date: '2025-10-23T20:00:00Z',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    homeTeamLogo: 'https://media.api-sports.io/football/teams/529.png',
    awayTeamLogo: 'https://media.api-sports.io/football/teams/541.png',
    status: 'upcoming',
    league: 'La Liga',
  },
  {
    id: 12347,
    date: '2025-10-24T18:45:00Z',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    homeTeamLogo: 'https://media.api-sports.io/football/teams/157.png',
    awayTeamLogo: 'https://media.api-sports.io/football/teams/165.png',
    status: 'upcoming',
    league: 'Bundesliga',
  },
  {
    id: 12348,
    date: '2025-10-25T21:00:00Z',
    homeTeam: 'Paris Saint-Germain',
    awayTeam: 'Marseille',
    homeTeamLogo: 'https://media.api-sports.io/football/teams/85.png',
    awayTeamLogo: 'https://media.api-sports.io/football/teams/81.png',
    status: 'upcoming',
    league: 'Ligue 1',
  },
];

const CreateMatch = () => {
  const navigate = useNavigate();
  const [fixtures] = useState<Fixture[]>(mockFixtures);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFixtureSelect = (fixture: Fixture) => {
    setSelectedFixture(fixture);
    setModalOpen(true);
  };

  const handleCreateMatch = async (stake: string, prediction: PredictionType) => {
    // TODO: Implement actual contract call
    toast.success('Match created successfully!', {
      description: 'Your match is now live and waiting for an opponent.',
    });
    
    setTimeout(() => {
      navigate('/my-matches');
    }, 1500);
  };

  const filteredFixtures = fixtures.filter(
    (fixture) =>
      fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fixture.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a Match</h1>
          <p className="text-muted-foreground">
            Select an upcoming fixture to create your challenge
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search fixtures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Fixtures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFixtures.map((fixture) => {
            const { date, time } = formatDate(fixture.date);
            
            return (
              <Card
                key={fixture.id}
                className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all hover:shadow-glow cursor-pointer group"
                onClick={() => handleFixtureSelect(fixture)}
              >
                <div className="p-6 space-y-4">
                  {/* League Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {fixture.league}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {date}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <img
                            src={fixture.homeTeamLogo}
                            alt={fixture.homeTeam}
                            className="w-6 h-6"
                          />
                        </div>
                        <span className="font-medium text-sm">{fixture.homeTeam}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-xs text-muted-foreground font-medium">VS</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <img
                            src={fixture.awayTeamLogo}
                            alt={fixture.awayTeam}
                            className="w-6 h-6"
                          />
                        </div>
                        <span className="font-medium text-sm">{fixture.awayTeam}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Time */}
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>

                  {/* Create Button */}
                  <Button className="w-full bg-gradient-to-r from-primary to-accent group-hover:opacity-90">
                    Create Match Challenge
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <CreateMatchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fixture={selectedFixture}
        onConfirm={handleCreateMatch}
      />
    </div>
  );
};

export default CreateMatch;
