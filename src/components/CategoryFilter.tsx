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
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onChange('Tous')}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
          active === 'Tous'
            ? 'bg-primary text-primary-foreground'
            : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
        }`}
      >
        Tous
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.nom)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            active === cat.nom
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
          }`}
        >
          {cat.nom}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
