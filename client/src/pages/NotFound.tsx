import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Trophy, 
  TrendingUp, 
  ArrowLeft,
  AlertTriangle,
  Target,
  Users,
  Zap
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickActions = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Home",
      description: "Go back to the main page",
      action: () => navigate('/')
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Matches",
      description: "View available matches",
      action: () => navigate('/app')
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Leaderboard",
      description: "Check the rankings",
      action: () => navigate('/leaderboard')
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "My Matches",
      description: "View your matches",
      action: () => navigate('/my-matches')
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
              <span className="text-2xl font-bold text-foreground">SoccerLeague</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 404 Header */}
          <div className="text-center mb-16">
            <div className="relative mb-8">
              <div className="text-9xl font-bold text-primary/20 select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-24 h-24 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, let's get you back on track!
            </p>
            
            <Badge variant="secondary" className="mb-8">
              <Search className="w-4 h-4 mr-2" />
              Route: {location.pathname}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Where would you like to go?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-border"
                  onClick={action.action}
                >
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                      {action.icon}
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {action.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <Card className="bg-muted/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-primary" />
                Need Help?
              </CardTitle>
              <CardDescription>
                If you're having trouble finding what you're looking for, here are some common pages:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Popular Pages</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <button onClick={() => navigate('/')} className="hover:text-primary">Home</button> - Main landing page</li>
                    <li>• <button onClick={() => navigate('/app')} className="hover:text-primary">Matches</button> - View and join matches</li>
                    <li>• <button onClick={() => navigate('/create')} className="hover:text-primary">Create Match</button> - Start a new match</li>
                    <li>• <button onClick={() => navigate('/leaderboard')} className="hover:text-primary">Leaderboard</button> - See rankings</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Quick Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Make sure you're connected to the right network</li>
                    <li>• Check your wallet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• Contact support if the issue persists</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-border hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 SoccerLeague. The future of decentralized sports betting.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
