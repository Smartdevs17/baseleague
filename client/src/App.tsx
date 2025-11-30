import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { RecoilRoot } from 'recoil';
import { wagmiConfig } from './lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateMatch from "./pages/CreateMatch";
import MyMatches from "./pages/MyMatches";
import Leaderboard from "./pages/Leaderboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";

// Create a query client for React Query
const queryClient = new QueryClient();

const App = () => (
	<RecoilRoot>
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					<TooltipProvider>
						<Toaster />
						<Sonner />
						<BrowserRouter>
							<Routes>
								<Route path="/" element={<Landing />} />
								<Route path="/app" element={<Dashboard />} />
								<Route path="/create" element={<CreateMatch />} />
								<Route path="/my-matches" element={<MyMatches />} />
								<Route path="/leaderboard" element={<Leaderboard />} />
								<Route path="/terms" element={<Terms />} />
								<Route path="/privacy" element={<Privacy />} />
								<Route path="/disclaimer" element={<Disclaimer />} />
								{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
								<Route path="*" element={<NotFound />} />
							</Routes>
						</BrowserRouter>
					</TooltipProvider>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	</RecoilRoot>
);

export default App;
