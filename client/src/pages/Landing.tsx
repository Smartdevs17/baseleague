import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@/hooks/useMockData';
import { useTeamLogos } from '@/hooks/useTeamLogos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Trophy, 
  Users, 
  Globe, 
  Wallet,
  TrendingUp,
  Star,
  CheckCircle,
  Play,
  BarChart3,
  Target,
  Lock
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { getTeamLogo } = useTeamLogos();
  
  // Arsenal and Chelsea team IDs from API-Football
  const arsenalLogo = getTeamLogo('42', 'Arsenal');
  const chelseaLogo = getTeamLogo('49', 'Chelsea');

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Blockchain Security",
      description: "Your bets are secured by Base smart contracts with transparent, immutable records."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Payouts",
      description: "Win or lose, get your rewards instantly through automated smart contracts."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Head-to-Head Competition",
      description: "Challenge other users directly in head-to-head matches for maximum excitement."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Features",
      description: "Track your performance, climb leaderboards, and compete with friends."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Access",
      description: "No geographic restrictions. Bet from anywhere in the world with Web3 technology."
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Wallet Integration",
      description: "Connect with MetaMask, WalletConnect, or any Web3 wallet. No passwords required."
    }
  ];

  const stats = [
    { label: "Active Users", value: "2,847" },
    { label: "Matches Played", value: "12,394" },
    { label: "Total Volume", value: "1,247 ETH" },
    { label: "Avg Win Rate", value: "68%" }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Football Enthusiast",
      content: "BaseLeague revolutionized how I bet on football. The head-to-head format is incredibly engaging!",
      rating: 5
    },
    {
      name: "Sarah Martinez",
      role: "Web3 Investor",
      content: "Finally, a betting platform that combines the excitement of sports with the security of blockchain.",
      rating: 5
    },
    {
      name: "Mike Johnson",
      role: "Crypto Trader",
      content: "The instant payouts and transparent odds make this the future of sports betting.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">BaseLeague</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/leaderboard')}
                className="hidden md:flex"
              >
                Leaderboard
              </Button>
              <Button
                onClick={() => navigate('/app')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isConnected ? 'Enter App' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🚀 Next-Generation Web3 Betting
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  The Future of
                  <span className="text-primary"> Football Betting</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Experience decentralized sports betting with blockchain security, 
                  instant payouts, and head-to-head competition. No KYC, no restrictions, 
                  just pure football excitement.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/app')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Betting Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/leaderboard')}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-card border border-border rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Live Match</h3>
                    <Badge variant="destructive">LIVE</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          <img
                            src={arsenalLogo}
                            alt="Arsenal"
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (!target.parentElement?.querySelector('.fallback')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'fallback w-8 h-8 flex items-center justify-center text-xs font-bold text-primary';
                                fallback.textContent = 'A';
                                target.parentElement?.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                        <span className="font-medium">Arsenal</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">2</div>
                        <div className="text-xs text-muted-foreground">vs</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">Chelsea</span>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          <img
                            src={chelseaLogo}
                            alt="Chelsea"
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (!target.parentElement?.querySelector('.fallback')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'fallback w-8 h-8 flex items-center justify-center text-xs font-bold text-primary';
                                fallback.textContent = 'C';
                                target.parentElement?.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Home Win</span>
                        <span className="font-medium">2.1x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Draw</span>
                        <span className="font-medium">3.2x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Away Win</span>
                        <span className="font-medium">2.8x</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/app')}
                    >
                      {isConnected ? 'Place Bet' : 'Get Started to Bet'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Why Choose BaseLeague?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of sports betting with cutting-edge Web3 technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">1. Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Web3 wallet (MetaMask, WalletConnect, etc.) with one click
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">2. Choose Match</h3>
              <p className="text-muted-foreground">
                Browse live Premier League matches and select your prediction
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">3. Win Rewards</h3>
              <p className="text-muted-foreground">
                Get instant payouts when you win, all secured by blockchain technology
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of satisfied users who have discovered the future of sports betting
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary via-accent to-primary rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Betting?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join the revolution in sports betting. Connect your wallet and start competing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/app')}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Play className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/leaderboard')}
                className="border-white text-white hover:bg-white/10"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">BaseLeague</span>
              </div>
              <p className="text-muted-foreground">
                The future of decentralized sports betting
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => navigate('/app')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/create')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  Create Match
                </button>
                <button 
                  onClick={() => navigate('/my-matches')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  My Matches
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Community</h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  Leaderboard
                </button>
                <div className="text-muted-foreground">Tournaments</div>
                <div className="text-muted-foreground">Support</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => navigate('/terms')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => navigate('/privacy')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigate('/disclaimer')}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left w-fit"
                >
                  Disclaimer
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 BaseLeague. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
