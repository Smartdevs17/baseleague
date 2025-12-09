import { Match } from '@/types/match';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, CheckCircle2, Gavel } from 'lucide-react';
import { formatEther } from 'viem';
import { formatEthDisplay } from '@/utils/formatEth';

interface MatchCardProps {
  match: Match;
  onJoin?: (matchId: string) => void;
  onView?: (matchId: string) => void;
  onSettle?: (gameweek: number, matchId: number) => void;
  showActions?: boolean;
  currentUserAddress?: string; // Optional: current user's address to check if they're the creator
  isDeployer?: boolean; // Whether current user is the contract deployer/owner
}

const MatchCard = ({ match, onJoin, onView, onSettle, showActions = true, currentUserAddress, isDeployer = false }: MatchCardProps) => {
  // Check if current user is the creator
  const isCreator = currentUserAddress && match.creator.toLowerCase() === currentUserAddress.toLowerCase();
  const getStatusBadge = () => {
    if (match.awaitingSettlement) {
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Awaiting Settlement</Badge>;
    }
    switch (match.status) {
      case 'open':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Open</Badge>;
      case 'active':
        return <Badge className="bg-accent/20 text-accent border-accent/30">Active</Badge>;
      case 'completed':
        return <Badge className="bg-success/20 text-success border-success/30">Completed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all hover:shadow-glow">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {match.fixture.league}
              </span>
            </div>
            {getStatusBadge()}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatEthDisplay(BigInt(match.stake) * 2n)}
            </div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {match.fixture.homeTeamLogo ? (
                <img
                  src={match.fixture.homeTeamLogo}
                  alt={match.fixture.homeTeam}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to team name initial if logo fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (!target.parentElement?.querySelector('.fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback w-8 h-8 flex items-center justify-center text-xs font-bold text-primary';
                      fallback.textContent = match.fixture.homeTeam.charAt(0).toUpperCase();
                      target.parentElement?.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-primary">
                  {match.fixture.homeTeam.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-center">{match.fixture.homeTeam}</span>
          </div>

          <div className="flex flex-col items-center gap-2 px-4">
            <div className="text-xs text-muted-foreground">VS</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDate(match.fixture.date)}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {match.fixture.awayTeamLogo ? (
                <img
                  src={match.fixture.awayTeamLogo}
                  alt={match.fixture.awayTeam}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to team name initial if logo fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (!target.parentElement?.querySelector('.fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback w-8 h-8 flex items-center justify-center text-xs font-bold text-primary';
                      fallback.textContent = match.fixture.awayTeam.charAt(0).toUpperCase();
                      target.parentElement?.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-primary">
                  {match.fixture.awayTeam.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-center">{match.fixture.awayTeam}</span>
          </div>
        </div>

        {/* Predictions */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Creator</div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium truncate">
                {match.creator.slice(0, 6)}...{match.creator.slice(-4)}
              </div>
              <Badge variant="outline" className="text-xs">
                {match.creatorPrediction.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Opponent</div>
            {match.joiner ? (
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium truncate">
                  {match.joiner.slice(0, 6)}...{match.joiner.slice(-4)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {match.joinerPrediction?.toUpperCase()}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Waiting...
              </div>
            )}
          </div>
        </div>

        {/* Winner Display */}
        {(match.settled && match.winner) && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">
              Winner: {match.winner.slice(0, 6)}...{match.winner.slice(-4)}
            </span>
          </div>
        )}
        {!match.settled && match.awaitingSettlement && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600">
              Result fetched — settlement required to pay out.
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {match.status === 'open' && onJoin && (
              <>
                {isCreator ? (
                  <Button
                    disabled
                    className="flex-1 bg-muted text-muted-foreground cursor-not-allowed"
                    title="You cannot join your own match"
                  >
                    Your Match (Waiting for opponent...)
                  </Button>
                ) : (
                  <Button
                    onClick={() => onJoin(match.id)}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Join Match ({formatEther(BigInt(match.stake))} ETH)
                  </Button>
                )}
              </>
            )}
            {(match.status === 'active' || match.awaitingSettlement) && isDeployer && onSettle && (
              <Button
                onClick={() => {
                  // Extract gameweek and matchId from match.id (format: "gameweek-matchId")
                  const [gameweek, matchId] = match.id.split('-').map(Number)
                  if (gameweek && matchId) {
                    onSettle(gameweek, matchId)
                  }
                }}
                variant="outline"
                className="flex-1 border-warning text-warning hover:bg-warning/10"
              >
                <Gavel className="w-4 h-4 mr-2" />
                Settle Match
              </Button>
            )}
            {onView && (
              <Button
                onClick={() => onView(match.id)}
                variant="outline"
                className="flex-1"
              >
                View Details
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchCard;
