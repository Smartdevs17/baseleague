import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 border-border">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>
                SoccerLeague is a decentralized application built on blockchain technology. We do not collect, store, or process personal information. All transactions are conducted directly through your Web3 wallet on the blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Blockchain Data</h2>
              <p>
                All betting activities, match results, and transactions are recorded on the blockchain and are publicly visible. This includes wallet addresses and transaction amounts, which are inherent to blockchain technology.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Wallet Information</h2>
              <p>
                When you connect your wallet to SoccerLeague, we do not have access to your private keys or wallet contents. Wallet connections are handled securely through your wallet provider (MetaMask, WalletConnect, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Cookies and Tracking</h2>
              <p>
                We may use cookies to improve your experience on our platform. These cookies do not contain personal information and are used solely for functionality purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
              <p>
                SoccerLeague integrates with third-party services including wallet providers and blockchain networks. Please review their privacy policies for information on how they handle your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Security</h2>
              <p>
                As a decentralized application, SoccerLeague leverages blockchain security. However, you are responsible for securing your wallet and private keys. We are not responsible for any loss of funds due to compromised wallets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to Privacy Policy</h2>
              <p>
                We reserve the right to update this privacy policy at any time. Changes will be posted on this page with an updated revision date.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;

