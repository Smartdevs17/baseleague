import { useMemo } from 'react';
import Navbar from '@/components/Navbar';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Trophy, Target, TrendingUp, Coins } from 'lucide-react';
import { Match } from '@/types/match';
import { useAccount } from 'wagmi';
import { useContractMatches } from '@/hooks/useContractMatches';
import { formatEther } from 'viem';

const MyMatches = () => {
  const { address, isConnected } = useAccount();
  const { openMatches, activeMatches, completedMatches, isLoading } = useContractMatches();

  // Filter matches where user is creator or joiner
  const userMatches = useMemo(() => {
    if (!isConnected || !address) return [];
    
    const allMatches = [...openMatches, ...activeMatches, ...completedMatches];
    return allMatches.filter(
      (match) =>
        match.creator.toLowerCase() === address.toLowerCase() ||
        (match.joiner && match.joiner.toLowerCase() === address.toLowerCase())
    );
  }, [openMatches, activeMatches, completedMatches, address, isConnected]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const completed = userMatches.filter((m) => m.status === 'completed');
    const active = userMatches.filter((m) => m.status === 'active');
    
    // Calculate wins (matches where user won)
    // For completed matches, check if user's bet won
    const wins = completed.filter((m) => {
      // Check if user is creator and won, or joiner and won
      const isCreator = m.creator.toLowerCase() === address?.toLowerCase();
      const isJoiner = m.joiner && m.joiner.toLowerCase() === address?.toLowerCase();
      
      // If match has a winner field, use it
      if (m.winner) {
        return m.winner.toLowerCase() === address?.toLowerCase();
      }
      
      // Otherwise, we can't determine winner without checking bet outcomes
      // For now, return false (would need to check actual bet isWinner status)
      return false;
    }).length;

    // Calculate total earnings (simplified - would need to track actual payouts)
    // For now, estimate based on wins and stake amounts
    const totalEarnings = completed.reduce((sum, match) => {
      if (match.winner?.toLowerCase() === address?.toLowerCase()) {
        // Winner gets 2x stake (simplified calculation)
        return sum + parseFloat(formatEther(BigInt(match.stake))) * 2;
      }
      return sum;
    }, 0);

    return {
      totalMatches: userMatches.length,
      wins,
      active: active.length,
      totalEarnings: totalEarnings.toFixed(3),
    };
  }, [userMatches, address]);

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
                <div className="text-xs text-muted-foreground">Total Earnings (ETH)</div>
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
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading your matches...
              </div>
            ) : userMatches.length === 0 ? (
              <Card className="p-12 text-center border-border">
                <div className="flex flex-col items-center gap-4">
                  <Target className="w-16 h-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
                    <p className="text-muted-foreground">
                      {!isConnected 
                        ? 'Connect your wallet to see your matches'
                        : 'You haven\'t participated in any matches yet. Join a match to get started!'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMatches.map((match) => (
                  <MatchCard key={match.id} match={match} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading active matches...
              </div>
            ) : userMatches.filter((m) => m.status === 'active').length === 0 ? (
              <Card className="p-12 text-center border-border">
                <div className="flex flex-col items-center gap-4">
                  <Target className="w-16 h-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Active Matches</h3>
                    <p className="text-muted-foreground">
                      You don't have any active matches at the moment.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMatches
                  .filter((m) => m.status === 'active')
                  .map((match) => (
                    <MatchCard key={match.id} match={match} showActions={false} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading completed matches...
              </div>
            ) : userMatches.filter((m) => m.status === 'completed').length === 0 ? (
              <Card className="p-12 text-center border-border">
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="w-16 h-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Completed Matches</h3>
                    <p className="text-muted-foreground">
                      Complete some matches to see your results here!
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMatches
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
