import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmi';
import { validateConfig } from './lib/config';
import Dashboard from "./pages/Dashboard";
import CreateMatch from "./pages/CreateMatch";
import MyMatches from "./pages/MyMatches";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import '@rainbow-me/rainbowkit/styles.css';

// Validate configuration on app startup
if (!validateConfig()) {
  console.error('App configuration is invalid. Please check your environment variables.');
}

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={darkTheme({
        accentColor: '#0052FF',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      })}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateMatch />} />
              <Route path="/my-matches" element={<MyMatches />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
