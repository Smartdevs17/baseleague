import { Match } from '@/types/match';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, CheckCircle2 } from 'lucide-react';
import { formatEther } from 'viem';

interface MatchCardProps {
  match: Match;
  onJoin?: (matchId: string) => void;
  onView?: (matchId: string) => void;
  showActions?: boolean;
}

const MatchCard = ({ match, onJoin, onView, showActions = true }: MatchCardProps) => {
  const getStatusBadge = () => {
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
              {formatEther(BigInt(match.stake) * 2n)} $BLEAG
            </div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <img
                src={match.fixture.homeTeamLogo}
                alt={match.fixture.homeTeam}
                className="w-8 h-8"
              />
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
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <img
                src={match.fixture.awayTeamLogo}
                alt={match.fixture.awayTeam}
                className="w-8 h-8"
              />
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
        {match.settled && match.winner && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">
              Winner: {match.winner.slice(0, 6)}...{match.winner.slice(-4)}
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {match.status === 'open' && onJoin && (
              <Button
                onClick={() => onJoin(match.id)}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Join Match ({formatEther(BigInt(match.stake))} $BLEAG)
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
