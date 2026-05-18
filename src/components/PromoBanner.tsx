import { useState, useEffect } from 'react';
import { supabase, type Promotion } from '@/lib/supabase';
import { Megaphone, X } from 'lucide-react';

const PromoBanner = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchActivePromotions = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('actif', true)
        .lte('date_debut', now)
        .gte('date_fin', now)
        .order('created_at', { ascending: false });
      setPromotions(data || []);
    };
    fetchActivePromotions();
  }, []);

  // Auto-rotate promotions every 5 seconds
  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (dismissed || promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
      <div className="container mx-auto px-6 py-3 flex items-center justify-center gap-3 relative">
        <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
        <p
          key={currentPromo.id}
          className="text-sm font-medium text-center animate-fade-in"
        >
          {currentPromo.texte}
        </p>
        {promotions.length > 1 && (
          <div className="flex gap-1 ml-3 flex-shrink-0">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-primary-foreground scale-125' : 'bg-primary-foreground/40'
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
