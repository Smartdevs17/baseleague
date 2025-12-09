import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Sparkles } from 'lucide-react';

const MiniLeagues = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Mini-Leagues</h1>
              <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
            </div>
            <p className="text-muted-foreground">
              Create or join private leagues to compete with friends; share an invite link or code so your group can play together.
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Private Leagues
              </CardTitle>
              <CardDescription>
                Compete with friends in custom leagues with unique scoring rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Mini-Leagues Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Create private leagues, invite friends via code, and compete in head-to-head
                  or classic league formats. Set custom rules and prizes.
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

export default MiniLeagues;

