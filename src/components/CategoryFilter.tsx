import { useEffect, useState } from 'react';
import { supabase, type Categorie } from '@/lib/supabase';

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
}

const CategoryFilter = ({ active, onChange }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Categorie[]>([]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('nom', { ascending: true })
      .then(({ data }) => setCategories(data || []));
  }, []);

  return (
    <div className="flex overflow-x-auto gap-3 w-full sm:flex-wrap sm:justify-center pb-2 px-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        onClick={() => onChange('Tous')}
        className={`shrink-0 snap-start px-5 py-2 rounded-full text-sm font-bold transition-all ${
          active === 'Tous'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        Tous
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.nom)}
          className={`shrink-0 snap-start px-5 py-2 rounded-full text-sm font-bold transition-all ${
            active === cat.nom
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          {cat.nom}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
