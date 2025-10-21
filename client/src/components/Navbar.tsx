import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Trophy } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

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

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
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
              to="/leaderboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/leaderboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Leaderboard
            </Link>
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
