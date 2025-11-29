import React, { useState } from 'react';
import { useAccount, useToken, useMatches, useMatch } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ContractExample = () => {
  const { address, isConnected } = useAccount();
  const { balance, allowance, approve, isApproving } = useToken();
  const { openMatches, activeMatches, userMatches, userStats } = useMatches();
  const [selectedMatchId, setSelectedMatchId] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>('0.005');
  const [prediction, setPrediction] = useState<number>(0); // 0 = home, 1 = draw, 2 = away

  const match = useMatch(selectedMatchId);

  const handleApprove = async () => {
    try {
      const amount = BigInt(stakeAmount) * BigInt(10 ** 18); // Convert to wei
      await approve(amount);
      toast.success('Token approval successful');
    } catch (error) {
      toast.error('Token approval failed');
    }
  };

  const handleCreateMatch = async () => {
    try {
      toast.success('Match creation is handled in the CreateMatch page');
    } catch (error) {
      toast.error('Failed to create match');
    }
  };

  const handleJoinMatch = async () => {
    try {
      await match.joinMatch(prediction);
      toast.success('Joined match successfully');
    } catch (error) {
      toast.error('Failed to join match');
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please connect your wallet to interact with contracts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Information */}
      <Card>
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Balance</Label>
            <p className="text-lg font-semibold">
              {balance ? (Number(balance) / 10 ** 18).toFixed(2) : '0'} BLEAG
            </p>
          </div>
          <div>
            <Label>Allowance</Label>
            <p className="text-lg font-semibold">
              {allowance ? (Number(allowance) / 10 ** 18).toFixed(2) : '0'} BLEAG
            </p>
          </div>
          <Button onClick={handleApprove} disabled={isApproving}>
            {isApproving ? 'Approving...' : 'Approve Tokens'}
          </Button>
        </CardContent>
      </Card>

      {/* User Stats */}
      {userStats && (
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Matches</Label>
              <p className="text-lg font-semibold">{userStats.totalMatches.toString()}</p>
            </div>
            <div>
              <Label>Wins</Label>
              <p className="text-lg font-semibold text-green-600">{userStats.wins.toString()}</p>
            </div>
            <div>
              <Label>Losses</Label>
              <p className="text-lg font-semibold text-red-600">{userStats.losses.toString()}</p>
            </div>
            <div>
              <Label>Win Rate</Label>
              <p className="text-lg font-semibold">
                {userStats.winRate.toString()}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Information */}
      <Card>
        <CardHeader>
          <CardTitle>Match Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Open Matches</Label>
              <p className="text-lg font-semibold">{openMatches?.length || 0}</p>
            </div>
            <div>
              <Label>Active Matches</Label>
              <p className="text-lg font-semibold">{activeMatches?.length || 0}</p>
            </div>
            <div>
              <Label>Your Matches</Label>
              <p className="text-lg font-semibold">{userMatches?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Match */}
      <Card>
        <CardHeader>
          <CardTitle>Create Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stake">Stake Amount (BLEAG)</Label>
            <Input
              id="stake"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="prediction">Prediction</Label>
            <select
              id="prediction"
              value={prediction}
              onChange={(e) => setPrediction(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value={0}>Home Win</option>
              <option value={1}>Draw</option>
              <option value={2}>Away Win</option>
            </select>
          </div>
          <Button onClick={handleCreateMatch} disabled={match.isCreating}>
            {match.isCreating ? 'Creating...' : 'Create Match'}
          </Button>
        </CardContent>
      </Card>

      {/* Join Match */}
      <Card>
        <CardHeader>
          <CardTitle>Join Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="matchId">Match ID</Label>
            <Input
              id="matchId"
              type="number"
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(Number(e.target.value))}
              placeholder="0"
            />
          </div>
          {match.match && (
            <div className="p-4 border rounded-md">
              <h4 className="font-semibold">Match Details</h4>
              <p>Creator: {match.match.creator}</p>
              <p>Stake: {(Number(match.match.stakeAmount) / 10 ** 18).toFixed(2)} BLEAG</p>
              <p>Fixture: {match.match.fixtureId}</p>
              <p>Status: {match.match.status}</p>
            </div>
          )}
          <Button onClick={handleJoinMatch} disabled={match.isJoining}>
            {match.isJoining ? 'Joining...' : 'Join Match'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractExample;
