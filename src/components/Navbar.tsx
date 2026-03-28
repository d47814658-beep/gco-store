import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import logo from '@/assets/logo.png';

interface NavbarProps {
  onSearchToggle?: () => void;
  showSearch?: boolean;
}

const Navbar = ({ onSearchToggle }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="GCO Store" className="h-9" />
          <span className="text-xl font-bold tracking-tight text-foreground">STORE</span>
        </Link>
        <button
          onClick={onSearchToggle}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Rechercher"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
