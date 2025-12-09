import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Sparkles, RefreshCw, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Squad = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Fantasy Hub</h1>
              <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
            </div>
            <p className="text-muted-foreground">
              Preview of upcoming fantasy features inspired by Premier League Fantasy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Squad Selection
                </CardTitle>
                <CardDescription>
                  Build a 15-player squad (2 GK, 5 DEF, 5 MID, 3 FWD) within a 100.0M budget.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Feature in development</span>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Transfers
                </CardTitle>
                <CardDescription>
                  Make up to 1 free transfer per gameweek; extra transfers cost -4 points.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Feature in development</span>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Chips
                </CardTitle>
                <CardDescription>
                  Wildcard, Free Hit, Triple Captain, Bench Boost—boost a single gameweek.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Feature in development</span>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Mini-Leagues
                </CardTitle>
                <CardDescription>
                  Create invite-only leagues for friends, join via link/code, head-to-head or classic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Feature in development</span>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardContent className="py-6 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">What to expect</span>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Set starting XI, captain, and vice-captain each gameweek.</li>
                <li>Points for goals, assists, clean sheets, saves, bonus points, and more.</li>
                <li>Transfer budget management with price changes.</li>
                <li>Private leagues with invite codes/links for friend groups.</li>
              </ul>
              <div className="flex gap-3 flex-wrap pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/transfers">Transfers (Soon)</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/chips">Chips (Soon)</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/mini-leagues">Mini-Leagues (Soon)</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Squad;
