import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Match, PredictionType } from '@/types/match';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatEther } from 'viem';

interface JoinMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match | null;
  onConfirm: (matchId: string, prediction: PredictionType) => Promise<void>;
}

const JoinMatchModal = ({ open, onOpenChange, match, onConfirm }: JoinMatchModalProps) => {
  const [prediction, setPrediction] = useState<PredictionType>('home');
  const [isJoining, setIsJoining] = useState(false);

  console.log('prediction', prediction);


  const handleJoin = async () => {
    if (!match) return;
    
    setIsJoining(true);
    try {
      await onConfirm(match.id, prediction);
      onOpenChange(false);
      setPrediction('home');
    } finally {
      setIsJoining(false);
    }
  };

  if (!match) return null;

  const unavailablePrediction = match.creatorPrediction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Join Match</DialogTitle>
          <DialogDescription>
            Choose your prediction and stake {formatEther(BigInt(match.stake))} $BLEAG
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img src={match.fixture.homeTeamLogo} alt={match.fixture.homeTeam} className="w-6 h-6" />
                <span className="text-sm font-medium">{match.fixture.homeTeam}</span>
              </div>
              <span className="text-xs text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{match.fixture.awayTeam}</span>
                <img src={match.fixture.awayTeamLogo} alt={match.fixture.awayTeam} className="w-6 h-6" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center mb-2">
              {new Date(match.fixture.date).toLocaleString()}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Creator's Prediction:</span>
              <span className="text-xs font-semibold text-primary uppercase">
                {match.creatorPrediction}
              </span>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              You cannot select the same prediction as the creator. Choose a different outcome to compete.
            </p>
          </div>

          {/* Prediction */}
          <div className="space-y-3">
            <Label>Your Prediction</Label>
            <RadioGroup value={prediction} onValueChange={(v) => setPrediction(v as PredictionType)}>
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  unavailablePrediction === 'home'
                    ? 'border-border/50 opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary transition-colors cursor-pointer'
                }`}
              >
                <RadioGroupItem value="home" id="home" disabled={unavailablePrediction === 'home'} />
                <Label
                  htmlFor="home"
                  className={`flex-1 ${unavailablePrediction === 'home' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {match.fixture.homeTeam} Wins
                  {unavailablePrediction === 'home' && (
                    <span className="ml-2 text-xs text-muted-foreground">(Taken)</span>
                  )}
                </Label>
              </div>
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  unavailablePrediction === 'draw'
                    ? 'border-border/50 opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary transition-colors cursor-pointer'
                }`}
              >
                <RadioGroupItem value="draw" id="draw" disabled={unavailablePrediction === 'draw'} />
                <Label
                  htmlFor="draw"
                  className={`flex-1 ${unavailablePrediction === 'draw' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  Draw
                  {unavailablePrediction === 'draw' && (
                    <span className="ml-2 text-xs text-muted-foreground">(Taken)</span>
                  )}
                </Label>
              </div>
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  unavailablePrediction === 'away'
                    ? 'border-border/50 opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary transition-colors cursor-pointer'
                }`}
              >
                <RadioGroupItem value="away" id="away" disabled={unavailablePrediction === 'away'} />
                <Label
                  htmlFor="away"
                  className={`flex-1 ${unavailablePrediction === 'away' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {match.fixture.awayTeam} Wins
                  {unavailablePrediction === 'away' && (
                    <span className="ml-2 text-xs text-muted-foreground">(Taken)</span>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Prize Info */}
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
            <div className="text-sm font-medium text-success text-center">
              Win {formatEther(BigInt(match.stake) * 2n)} $BLEAG
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              disabled={isJoining || prediction === unavailablePrediction}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                `Join Match`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinMatchModal;
