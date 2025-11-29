import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, TrendingUp, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
// import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';

interface LeaderboardEntry {
  rank: number;
  address: string;
  wins: number;
  totalMatches: number;
  earnings: string;
  winRate: number;
}

// Mock data - using dummy data for demo purposes with realistic Ethereum addresses
const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    wins: 15,
    totalMatches: 18,
    earnings: '1250',
    winRate: 83.3,
  },
  {
    rank: 2,
    address: '0x8ba1f109551bD432803012645ac136c22C929E0',
    wins: 12,
    totalMatches: 15,
    earnings: '980',
    winRate: 80.0,
  },
  {
    rank: 3,
    address: '0x9f8A7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
    wins: 10,
    totalMatches: 14,
    earnings: '750',
    winRate: 71.4,
  },
  {
    rank: 4,
    address: '0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6',
    wins: 8,
    totalMatches: 12,
    earnings: '620',
    winRate: 66.7,
  },
  {
    rank: 5,
    address: '0x3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4',
    wins: 7,
    totalMatches: 11,
    earnings: '540',
    winRate: 63.6,
  },
];

const Leaderboard = () => {
  // Live implementation (commented out for demo)
  // const { address, isConnected } = useAccount();
  // const { leaderboard, isLoading } = useLeaderboard();
  
  const { isConnected } = useAccount();
  
  // Simulate loading state for realistic demo experience
  const [isLoading, setIsLoading] = useState(true);
  const leaderboard = mockLeaderboard;

  // Show loader for 3-5 seconds to simulate real data fetching
  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }
    
    // Random delay between 3-5 seconds for more realistic feel
    const delay = Math.random() * 2000 + 3000; // 3000-5000ms
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [isConnected]);
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  // Format address for display (for mock data)
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top performers on BaseLeague
          </p>
        </div>

        {/* Wallet Not Connected State */}
        {!isConnected && (
          <Card className="p-12 text-center border-border">
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  Please connect your wallet to view the leaderboard and see top performers.
                </p>
                <ConnectButton />
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isConnected && isLoading && (
          <Card className="p-8 text-center border-border">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </Card>
        )}

        {/* Top 3 Podium */}
        {isConnected && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <Card
              key={entry.address}
              className={`p-6 border-border bg-gradient-to-br ${
                index === 0
                  ? 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/30'
                  : index === 1
                  ? 'from-gray-400/10 to-gray-500/5 border-gray-400/30'
                  : 'from-orange-600/10 to-orange-700/5 border-orange-600/30'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <div className="font-mono text-sm mb-1">
                    {formatAddress(entry.address)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Rank #{entry.rank}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-success">{entry.wins}</div>
                    <div className="text-xs text-muted-foreground">Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{entry.winRate.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xl font-bold text-primary">{entry.earnings} ETH</div>
                  <div className="text-xs text-muted-foreground">Total Earnings</div>
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}

        {/* Full Leaderboard Table */}
        {isConnected && !isLoading && (
          <Card className="border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Rank
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Player
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Wins
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Matches
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Win Rate
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.address}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 ? (
                          getRankIcon(entry.rank)
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm">
                        {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-semibold text-success">{entry.wins}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm">{entry.totalMatches}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold">{entry.winRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-primary">{entry.earnings} ETH</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        )}

        {/* Live Implementation (Commented Out)
        To enable live data from contract, uncomment the following:
        
        1. Uncomment imports at top:
           import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
           import { useAccount } from 'wagmi';
        
        2. Replace mockLeaderboard with:
           const { address, isConnected } = useAccount();
           const { leaderboard, isLoading } = useLeaderboard();
        
        3. Add loading/empty states as needed
        */}
      </main>
    </div>
  );
};

export default Leaderboard;
