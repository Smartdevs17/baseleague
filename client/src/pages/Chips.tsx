import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Sparkles } from 'lucide-react';

const Chips = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Chips</h1>
              <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
            </div>
            <p className="text-muted-foreground">
              Use special chips to boost your gameweek performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Wildcard
                </CardTitle>
                <CardDescription>
                  Unlimited free transfers for one gameweek
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Available twice per season (first half and second half)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Free Hit
                </CardTitle>
                <CardDescription>
                  Make unlimited transfers for one gameweek only
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Squad returns to original after gameweek
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Triple Captain
                </CardTitle>
                <CardDescription>
                  Captain points tripled instead of doubled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Use once per season
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Bench Boost
                </CardTitle>
                <CardDescription>
                  Points from all bench players count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Use once per season
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border mt-6">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Chips feature in development</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chips;

