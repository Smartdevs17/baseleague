import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, Sparkles } from 'lucide-react';

const Transfers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Transfers</h1>
              <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
            </div>
            <p className="text-muted-foreground">
              Make transfers to optimize your squad
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Transfer Market
              </CardTitle>
              <CardDescription>
                Swap players in and out of your squad (1 free transfer per gameweek)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transfer System Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Make up to 1 free transfer per gameweek. Additional transfers cost -4 points each.
                  Build your transfer value over time with unused free transfers (max 2).
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Feature in development</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Transfers;

