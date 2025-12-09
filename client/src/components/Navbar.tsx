import { Link, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const location = useLocation();
  const { isConnected } = useAccount();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow transition-transform group-hover:scale-110">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              BaseLeague
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/app"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/app') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Matches
            </Link>
            <Link
              to="/create"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/create') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Create Match
            </Link>
            <Link
              to="/my-matches"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/my-matches') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Matches
            </Link>
            <Link
              to="/squad"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                isActive('/squad') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Fantasy
              <Badge variant="secondary" className="text-xs px-1.5 py-0">Soon</Badge>
            </Link>
            <Link
              to="/leaderboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/leaderboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
