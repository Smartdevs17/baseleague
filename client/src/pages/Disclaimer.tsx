import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const Disclaimer = () => {
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
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Disclaimer</h1>
          </div>
          
          <div className="space-y-6 text-muted-foreground">
            <section className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h2 className="text-xl font-semibold text-foreground mb-3">Important Notice</h2>
              <p>
                SoccerLeague is a decentralized betting platform built on blockchain technology. Please read this disclaimer carefully before using our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. No Financial Advice</h2>
              <p>
                SoccerLeague does not provide financial, investment, or legal advice. All betting decisions are made at your own discretion and risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Risk of Loss</h2>
              <p>
                Betting involves substantial risk of loss. You may lose all funds placed as bets. Only bet with funds you can afford to lose. Past performance does not guarantee future results.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Regulatory Compliance</h2>
              <p>
                It is your responsibility to ensure that your use of SoccerLeague complies with all applicable laws and regulations in your jurisdiction. Some jurisdictions may prohibit or restrict online betting.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Blockchain Risks</h2>
              <p>
                SoccerLeague operates on blockchain networks which are subject to various risks including but not limited to: network congestion, smart contract vulnerabilities, and potential loss of funds due to technical issues.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. No Guarantees</h2>
              <p>
                SoccerLeague makes no guarantees regarding the accuracy of match results, availability of the platform, or the outcome of any bets. All results are determined by external data sources and smart contract logic.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Wallet Security</h2>
              <p>
                You are solely responsible for the security of your wallet and private keys. SoccerLeague is not responsible for any loss of funds due to compromised wallets, lost private keys, or unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Age Restrictions</h2>
              <p>
                You must be of legal age in your jurisdiction to use SoccerLeague. By using this platform, you represent that you meet all age and legal requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, SoccerLeague and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
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

export default Disclaimer;

