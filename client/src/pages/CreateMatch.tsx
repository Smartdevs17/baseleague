import React, { useState, useEffect } from 'react';
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
import { useUpcomingFixturesQuery, useFilteredFixtures } from '@/hooks/useFixtures';
import { useTeamLogos } from '@/hooks/useTeamLogos';
import { preloadTeamLogos } from '@/utils/logoPreloader';
import { ApiFixture } from '@/store/fixtures';

const CreateMatch = () => {
  const navigate = useNavigate();
  const { fixtures, loading, error } = useUpcomingFixturesQuery();
  const { updateFilters } = useFilteredFixtures();
  const { getTeamLogo } = useTeamLogos();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFixture, setSelectedFixture] = useState<ApiFixture | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter to show only upcoming fixtures
  useEffect(() => {
    updateFilters({ status: 'pending' });
  }, [updateFilters]);

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

  const handleFixtureSelect = (fixture: ApiFixture) => {
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

  // Convert ApiFixture to Fixture for the modal
  const convertApiFixtureToFixture = (apiFixture: ApiFixture): Fixture => {
    return {
      id: parseInt(apiFixture.externalId),
      date: apiFixture.kickoffTime,
      homeTeam: apiFixture.homeTeam,
      awayTeam: apiFixture.awayTeam,
      homeTeamLogo: getTeamLogo(apiFixture.homeTeamId, apiFixture.homeTeam),
      awayTeamLogo: getTeamLogo(apiFixture.awayTeamId, apiFixture.awayTeam),
      status: apiFixture.status === 'pending' ? 'upcoming' : 
              apiFixture.status === 'cancelled' ? 'finished' : 
              apiFixture.status as 'upcoming' | 'live' | 'finished',
      league: 'Premier League', // Default since not in API response
    };
  };

  const filteredFixtures = fixtures.filter(
    (fixture) =>
      fixture.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fixture.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      'Premier League'.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load fixtures</h3>
            <p className="text-muted-foreground">{error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

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
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading fixtures...
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No upcoming fixtures available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFixtures.map((fixture) => {
              const { date, time } = formatDate(fixture.kickoffTime);
              
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
                        Premier League
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
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <img
                              src={getTeamLogo(fixture.homeTeamId, fixture.homeTeam)}
                              alt={fixture.homeTeam}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/32x32/1f2937/ffffff?text=?';
                              }}
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
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <img
                              src={getTeamLogo(fixture.awayTeamId, fixture.awayTeam)}
                              alt={fixture.awayTeam}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/32x32/1f2937/ffffff?text=?';
                              }}
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
        )}
      </main>

      <CreateMatchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fixture={selectedFixture ? convertApiFixtureToFixture(selectedFixture) : null}
        onConfirm={handleCreateMatch}
      />
    </div>
  );
};

export default CreateMatch;