import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CreateMatchModal from '@/components/CreateMatchModal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Clock, Wallet } from 'lucide-react';
import { Fixture, PredictionType } from '@/types/match';
import { toast } from 'sonner';
import { useUpcomingFixtures } from '@/hooks/useFixtures';
import { useTeamLogos } from '@/hooks/useTeamLogos';
import { preloadTeamLogos } from '@/utils/logoPreloader';
import { useAccount } from 'wagmi';
import { useEthBalance, usePredictionContract } from '@/hooks/useContracts';
import { Prediction } from '@/lib/contracts';
import { formatEther, parseEther } from 'viem';
import { ApiFixture } from '@/store/fixtures';
import { getExplorerUrl } from '@/utils/explorer';

const CreateMatch = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  // Fetch fixtures from API with actual match times
  const { fixtures, loading, error } = useUpcomingFixtures();
  const { getTeamLogo } = useTeamLogos();
  
  // Real contract hooks - using ETH instead of tokens
  const { balance, formatted: balanceFormatted, symbol } = useEthBalance();
  const { placeBet, isPending: isPlacingBet, isConfirming, isConfirmed, hash: txHash } = usePredictionContract();
  
  // Use ref to track isConfirmed since it's a closure
  const isConfirmedRef = useRef(isConfirmed);
  useEffect(() => {
    isConfirmedRef.current = isConfirmed;
  }, [isConfirmed]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFixture, setSelectedFixture] = useState<ApiFixture | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('All Leagues');

  // Preload team logos when fixtures are loaded
  useEffect(() => {
    if (fixtures.length > 0) {
      preloadTeamLogos(fixtures);
    }
  }, [fixtures]);

  const handleFixtureSelect = (fixture: ApiFixture) => {
    // Check if user has tokens before allowing fixture selection
    if (balance === 0n) {
      toast.error('Insufficient ETH balance', {
        description: 'You need ETH to create a match. Please acquire some ETH first.'
      });
      return;
    }
    
    setSelectedFixture(fixture);
    setModalOpen(true);
  };

  const handleCreateMatch = async (stake: string, prediction: PredictionType) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedFixture) {
      toast.error('Please select a fixture first');
      return;
    }

    // Check if user has sufficient ETH balance
    if (balance === 0n) {
      toast.error('Insufficient ETH balance', {
        description: 'You need ETH to create a match. Please acquire some ETH first.'
      });
      return;
    }

    // Check if stake amount is greater than available balance
    const stakeAmountWei = parseEther(stake);
    if (balance < stakeAmountWei) {
      toast.error('Insufficient ETH balance', {
        description: `You need at least ${stake} ETH to create this match.`
      });
      return;
    }

    // Debug: Log the prediction value received
    console.log('🔍 [CreateMatch] Received prediction from modal:', {
      prediction,
      selectedFixture: selectedFixture ? {
        homeTeam: selectedFixture.homeTeam,
        awayTeam: selectedFixture.awayTeam,
      } : null,
    });

    try {
      // Convert prediction type to contract enum
      const contractPrediction: Prediction = prediction === 'home' ? Prediction.HOME_WIN : 
                               prediction === 'draw' ? Prediction.DRAW : 
                               Prediction.AWAY_WIN;
      
      console.log('🔍 [CreateMatch] Converted to contract prediction:', {
        original: prediction,
        contractValue: contractPrediction,
        contractEnum: contractPrediction === Prediction.HOME_WIN ? 'HOME_WIN' : 
                     contractPrediction === Prediction.DRAW ? 'DRAW' : 'AWAY_WIN',
      });

      // Extract gameweek and matchId from fixture
      // For now, we'll use fixture externalId as matchId and gameweek 1
      // TODO: Map fixture to actual gameweek/matchId from contract
      const gameweek = 1;
      const matchId = parseInt(selectedFixture.externalId.toString()) || 1;

      // Place bet (sends ETH directly - no approval needed)
      console.log('🔍 [CreateMatch] Before placeBet call');
      console.log('  txHash from hook:', txHash);
      console.log('  isPending:', isPlacingBet);
      
      let hash: `0x${string}` | undefined;
      try {
        // Show toast only once - placeBet will handle MetaMask confirmation
        toast.info('Please confirm the transaction in MetaMask...', {
          id: 'confirm-tx', // Use ID to prevent duplicates
          duration: 10000,
        });
        
        hash = await placeBet(gameweek, matchId, contractPrediction, stake);
        console.log('🔍 [CreateMatch] After placeBet call');
        console.log('  Hash received:', hash);
      } catch (err: unknown) {
        console.error('❌ [CreateMatch] placeBet error:', err);
        // If placeBet throws, it might be user rejection or other error
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('User rejected') || errorMessage.includes('denied') || errorMessage.includes('user rejected') || errorMessage.includes('rejected')) {
          throw new Error('Transaction cancelled by user');
        }
        throw err; // Re-throw other errors
      }
      
      // If hash is still not available, try to get it from the hook state
      if (!hash && txHash) {
        console.log('✅ [CreateMatch] Using hash from hook state:', txHash);
        hash = txHash;
      }
      
      // If still no hash, wait a bit for it to be set (user might have just confirmed)
      if (!hash) {
        console.log('⚠️ [CreateMatch] No hash yet, waiting 2 seconds...');
        // Wait a moment for the hash to be set in the hook state
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (txHash) {
          console.log('✅ [CreateMatch] Hash appeared after wait:', txHash);
          hash = txHash;
        }
      }
      
      // Final check - if still no hash, it's an error
      if (!hash) {
        console.error('❌ [CreateMatch] Final check - no hash available');
        console.error('  txHash:', txHash);
        console.error('  isPending:', isPlacingBet);
        console.error('  isConfirming:', isConfirming);
        throw new Error('Transaction hash not received. The transaction may have been rejected or failed. Please check the browser console for details.');
      }
      
      console.log('✅ [CreateMatch] Hash confirmed:', hash);

      // Close modal first
      setModalOpen(false);
      setSelectedFixture(null);

      // Dismiss previous toast and show new one
      toast.dismiss('confirm-tx');
      toast.info('Transaction submitted. Waiting for confirmation...', {
        id: 'waiting-tx',
        duration: 20000,
        action: hash ? {
          label: 'View on Explorer',
          onClick: () => window.open(getExplorerUrl(hash), '_blank'),
        } : undefined,
      });

      // Wait for transaction confirmation using ref (since isConfirmed is a closure)
      const maxWait = 60000; // 60 seconds
      const interval = 1000; // Check every second
      let elapsed = 0;
      let confirmationInterval: NodeJS.Timeout | null = null;
      
      confirmationInterval = setInterval(() => {
        elapsed += interval;
        
        // Check if confirmed using ref
        if (isConfirmedRef.current) {
          if (confirmationInterval) {
            clearInterval(confirmationInterval);
          }
          
          console.log('✅ [CreateMatch] Transaction confirmed!');
          toast.dismiss('waiting-tx');
          toast.success('Match created successfully!', {
            description: 'Your bet has been placed. Check your matches in the dashboard.',
            duration: 3000,
            action: hash ? {
              label: 'View on Explorer',
              onClick: () => window.open(getExplorerUrl(hash), '_blank'),
            } : undefined,
          });
          
          // Navigate to dashboard after showing success
          setTimeout(() => {
            navigate('/app', { state: { fromCreateMatch: true, refresh: true } });
          }, 1500);
          return;
        }
        
        // Timeout check
        if (elapsed >= maxWait) {
          if (confirmationInterval) {
            clearInterval(confirmationInterval);
          }
          toast.dismiss('waiting-tx');
          toast.warning('Transaction is taking longer than expected', {
            description: 'Your transaction may still be processing. Please check your wallet.',
          });
        }
      }, interval);
      
    } catch (error: unknown) {
      console.error('Failed to create match:', error);
      
      // Type guard for error
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // More specific error messages
      if (errorMessage.includes('User rejected') || errorMessage.includes('denied') || errorMessage.includes('user rejected')) {
        toast.error('Transaction cancelled', {
          description: 'You cancelled the transaction in MetaMask.',
        });
      } else if (errorMessage.includes('dropped') || errorMessage.includes('replaced')) {
        toast.error('Transaction was dropped', {
          description: 'Please try again with higher gas or wait for network congestion to clear.',
        });
      } else if (errorMessage.includes('insufficient')) {
        toast.error('Insufficient funds', {
          description: 'Please check your balance and try again.',
        });
      } else {
        toast.error('Failed to create match', {
          description: errorMessage || 'Please try again.',
        });
      }
    }
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
      league: apiFixture.league || 'Premier League',
    };
  };

  // Get unique leagues for filters
  const uniqueLeagues = ['All Leagues', ...new Set(fixtures.map(f => f.league).filter(Boolean))].sort()

  const filteredFixtures = fixtures.filter((fixture) => {
    // League filter
    if (selectedLeague !== 'All Leagues' && fixture.league !== selectedLeague) {
      return false
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        fixture.homeTeam.toLowerCase().includes(query) ||
        fixture.awayTeam.toLowerCase().includes(query) ||
        (fixture.league || '').toLowerCase().includes(query)
      )
    }

    return true
  })

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
          
          {/* Wallet Status */}
          {isConnected ? (
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Wallet Connected</span>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ETH Balance:</span>
                  <span className="ml-2 text-foreground font-semibold">
                    {balanceFormatted} {symbol}
                  </span>
                </div>
              </div>
              
              {/* Zero balance warning */}
              {balance === 0n && (
                <div className="mt-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">No ETH Balance</span>
                  </div>
                  <p className="text-sm text-yellow-300 mt-1">
                    You need ETH to create matches. Get testnet ETH from a faucet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Wallet Not Connected</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                Please connect your wallet to create matches
              </p>
            </div>
          )}
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
              
              // Debug: Log first fixture to verify team names
              if (filteredFixtures.indexOf(fixture) === 0) {
                console.log('🔍 [CreateMatch] First fixture data:', {
                  id: fixture.id,
                  homeTeam: fixture.homeTeam,
                  awayTeam: fixture.awayTeam,
                  homeTeamId: fixture.homeTeamId,
                  awayTeamId: fixture.awayTeamId,
                  league: fixture.league,
                })
              }
              
              return (
                <Card
                  key={fixture.id}
                  className={`overflow-hidden border-border bg-card transition-all group ${
                    balance === 0n 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-primary/50 hover:shadow-glow cursor-pointer'
                  }`}
                  onClick={() => handleFixtureSelect(fixture)}
                >
                  <div className="p-6 space-y-4">
                    {/* League Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs w-fit">
                          {fixture.league || 'Premier League'}
                        </Badge>
                      </div>
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