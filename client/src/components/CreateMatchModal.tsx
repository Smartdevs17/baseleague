import { useState, useEffect } from 'react';
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

  // Reset prediction when modal opens
  useEffect(() => {
    if (open) {
      setPrediction('home');
      setStake('50');
      console.log('🔍 [CreateMatchModal] Modal opened, reset prediction to:', 'home');
    }
  }, [open]);

  const handleCreate = async () => {
    // Validate stake amount - must be greater than 0
    const stakeNum = parseFloat(stake);
    if (!stake || isNaN(stakeNum) || stakeNum <= 0) {
      return;
    }
    
    // Debug: Log the prediction value before submitting
    console.log('🔍 [CreateMatchModal] Submitting with prediction:', {
      prediction,
      fixture: fixture ? {
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
      } : null,
    });
    
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
            <Label htmlFor="stake">Stake Amount (ETH)</Label>
            <Input
              id="stake"
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter stake amount (e.g., 0.00001)"
              min="0.000000000000000001"
              step="any"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 0.000000000000000001 ETH (1 wei). Winner receives {parseFloat(stake || '0') * 2} ETH (minus platform fee)
            </p>
          </div>

          {/* Prediction */}
          <div className="space-y-3">
            <Label>Your Prediction</Label>
            <RadioGroup value={prediction} onValueChange={(v) => {
              console.log('🔍 [CreateMatchModal] Prediction changed:', {
                newValue: v,
                previousValue: prediction,
                fixture: fixture ? {
                  homeTeam: fixture.homeTeam,
                  awayTeam: fixture.awayTeam,
                } : null,
              });
              setPrediction(v as PredictionType);
            }}>
              <div 
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                  prediction === 'home' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                }`}
                onClick={() => {
                  console.log('🔍 [CreateMatchModal] Clicked on home option');
                  setPrediction('home');
                }}
              >
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="flex-1 cursor-pointer">
                  {fixture.homeTeam} Wins
                </Label>
              </div>
              <div 
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                  prediction === 'draw' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                }`}
                onClick={() => {
                  console.log('🔍 [CreateMatchModal] Clicked on draw option');
                  setPrediction('draw');
                }}
              >
                <RadioGroupItem value="draw" id="draw" />
                <Label htmlFor="draw" className="flex-1 cursor-pointer">
                  Draw
                </Label>
              </div>
              <div 
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                  prediction === 'away' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                }`}
                onClick={() => {
                  console.log('🔍 [CreateMatchModal] Clicked on away option');
                  setPrediction('away');
                }}
              >
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
              disabled={isCreating || !stake || isNaN(parseFloat(stake)) || parseFloat(stake) <= 0}
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
