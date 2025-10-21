import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Fixture, PredictionType } from '@/types/match';
import { Loader2 } from 'lucide-react';

interface CreateMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixture: Fixture | null;
  onConfirm: (stake: string, prediction: PredictionType) => Promise<void>;
}

const CreateMatchModal = ({ open, onOpenChange, fixture, onConfirm }: CreateMatchModalProps) => {
  const [stake, setStake] = useState('50');
  const [prediction, setPrediction] = useState<PredictionType>('home');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!stake || parseFloat(stake) <= 0) return;
    
    setIsCreating(true);
    try {
      await onConfirm(stake, prediction);
      onOpenChange(false);
      setStake('50');
      setPrediction('home');
    } finally {
      setIsCreating(false);
    }
  };

  if (!fixture) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Match Challenge</DialogTitle>
          <DialogDescription>
            Set your stake and prediction for this match
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src={fixture.homeTeamLogo} alt={fixture.homeTeam} className="w-6 h-6" />
                <span className="text-sm font-medium">{fixture.homeTeam}</span>
              </div>
              <span className="text-xs text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{fixture.awayTeam}</span>
                <img src={fixture.awayTeamLogo} alt={fixture.awayTeam} className="w-6 h-6" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {new Date(fixture.date).toLocaleString()}
            </div>
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stake">Stake Amount ($BLEAG)</Label>
            <Input
              id="stake"
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter stake amount"
              min="1"
              step="1"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">
              Winner receives {parseFloat(stake) * 2} $BLEAG (minus platform fee)
            </p>
          </div>

          {/* Prediction */}
          <div className="space-y-3">
            <Label>Your Prediction</Label>
            <RadioGroup value={prediction} onValueChange={(v) => setPrediction(v as PredictionType)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="flex-1 cursor-pointer">
                  {fixture.homeTeam} Wins
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="draw" id="draw" />
                <Label htmlFor="draw" className="flex-1 cursor-pointer">
                  Draw
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="away" id="away" />
                <Label htmlFor="away" className="flex-1 cursor-pointer">
                  {fixture.awayTeam} Wins
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              disabled={isCreating || !stake || parseFloat(stake) <= 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create Match`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMatchModal;
