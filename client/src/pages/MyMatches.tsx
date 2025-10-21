import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Trophy, Target, TrendingUp, Coins } from 'lucide-react';
import { Match } from '@/types/match';

// Mock data - replace with actual contract calls
const mockUserMatches: Match[] = [
  {
    id: '3',
    creator: '0xYOUR_WALLET_ADDRESS',
    joiner: '0x9876543210987654321098765432109876543210',
    stake: '50000000000000000000',
    fixtureId: 12349,
    fixture: {
      id: 12349,
      date: '2025-10-21T17:00:00Z',
      homeTeam: 'Chelsea',
      awayTeam: 'Arsenal',
      homeTeamLogo: 'https://media.api-sports.io/football/teams/49.png',
      awayTeamLogo: 'https://media.api-sports.io/football/teams/42.png',
      status: 'finished',
      score: { home: 2, away: 1 },
      league: 'Premier League',
    },
    creatorPrediction: 'home',
    joinerPrediction: 'away',
    settled: true,
    winner: '0xYOUR_WALLET_ADDRESS',
    status: 'completed',
    createdAt: Date.now() - 86400000,
  },
];

const MyMatches = () => {
  const [matches] = useState<Match[]>(mockUserMatches);

  const stats = {
    totalMatches: matches.length,
    wins: matches.filter((m) => m.winner === '0xYOUR_WALLET_ADDRESS').length,
    active: matches.filter((m) => m.status === 'active').length,
    totalEarnings: '150', // Mock value
  };

  const winRate = stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Matches</h1>
          <p className="text-muted-foreground">
            Track your active matches and performance stats
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalMatches}</div>
                <div className="text-xs text-muted-foreground">Total Matches</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{stats.wins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{winRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalEarnings}</div>
                <div className="text-xs text-muted-foreground">Total Earnings ($BLEAG)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Matches Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">All Matches</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You haven't participated in any matches yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {matches.filter((m) => m.status === 'active').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active matches.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches
                  .filter((m) => m.status === 'active')
                  .map((match) => (
                    <MatchCard key={match.id} match={match} showActions={false} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {matches.filter((m) => m.status === 'completed').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No completed matches yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches
                  .filter((m) => m.status === 'completed')
                  .map((match) => (
                    <MatchCard key={match.id} match={match} showActions={false} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyMatches;
