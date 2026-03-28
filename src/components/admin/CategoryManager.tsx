import { useState, useEffect } from 'react';
import { supabase, type Categorie } from '@/lib/supabase';
import { Plus, Trash2, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CategoryManager = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Categorie | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('nom', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const nom = newCat.trim();
    if (!nom) return;

    setAdding(true);
    const { error } = await supabase.from('categories').insert({ nom });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Catégorie existante', description: `"${nom}" existe déjà.`, variant: 'destructive' });
      } else {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter la catégorie.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Catégorie ajoutée', description: `"${nom}" a été créée.` });
      setNewCat('');
      fetchCategories();
    }
    setAdding(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer cette catégorie.', variant: 'destructive' });
    } else {
      toast({ title: 'Catégorie supprimée' });
      fetchCategories();
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Catégories</h2>
        <span className="ml-2 text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {categories.length}
        </span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8 max-w-md">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Nouvelle catégorie..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
        <button
          type="submit"
          disabled={adding || !newCat.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </form>

      {/* Categories list */}
      {loading ? (
        <div className="space-y-2 max-w-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Aucune catégorie. Crée-en une ci-dessus.
        </p>
      ) : (
        <ul className="space-y-2 max-w-md">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card group"
            >
              <span className="text-sm font-medium text-foreground">{cat.nom}</span>
              <button
                onClick={() => setDeleteTarget(cat)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Supprimer ${cat.nom}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {deleteTarget?.nom} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les produits déjà assignés à cette catégorie ne seront pas supprimés, mais ils n'apparaîtront plus dans le filtre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager;
