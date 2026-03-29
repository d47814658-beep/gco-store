import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import logo from '@/assets/logo.png';

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const query = searchParams.get('q') || '';

  const handleSearch = (val: string) => {
    if (location.pathname !== '/') {
      navigate('/?q=' + val);
    } else {
      navigate('?q=' + val, { replace: true });
    }
  };

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setShowSearch(false)}>
          <img src={logo} alt="GCO Store" className="h-9" />
          <span className="text-xl font-bold tracking-tight text-foreground">STORE</span>
        </Link>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors relative"
          aria-label="Rechercher"
        >
          {showSearch ? <X className="w-5 h-5 text-primary" /> : <Search className="w-5 h-5" />}
        </button>
      </div>

      {/* Global Search Bar Dropdown */}
      {showSearch && (
        <div className="absolute top-16 left-0 w-full bg-background border-b border-border p-4 shadow-lg animate-fade-in origin-top">
          <div className="container mx-auto max-w-2xl relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Que recherchez-vous ? (ex: hp elitebook, souris...)"
              className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-full border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
