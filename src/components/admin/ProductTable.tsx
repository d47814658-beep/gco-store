import { useState } from 'react';
import type { Produit } from '@/lib/supabase';
import { formatPrice } from '@/lib/whatsapp';
import { Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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

interface ProductTableProps {
  products: Produit[];
  onEdit: (product: Produit) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, disponible: boolean) => void;
}

const ProductTable = ({ products, onEdit, onDelete, onToggle }: ProductTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground py-12">Aucun produit pour le moment.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-3 px-3 font-medium text-muted-foreground">Image</th>
              <th className="py-3 px-3 font-medium text-muted-foreground">Nom</th>
              <th className="py-3 px-3 font-medium text-muted-foreground hidden md:table-cell">Marque</th>
              <th className="py-3 px-3 font-medium text-muted-foreground hidden md:table-cell">Catégorie</th>
              <th className="py-3 px-3 font-medium text-muted-foreground">Prix</th>
              <th className="py-3 px-3 font-medium text-muted-foreground">Dispo</th>
              <th className="py-3 px-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-3">
                {(() => {
                    const mainImg = p.produit_images?.find((img) => img.ordre === 0) || p.produit_images?.[0];
                    return mainImg ? (
                      <img src={mainImg.image_url} alt={p.nom} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded" />
                    );
                  })()}
                </td>
                <td className="py-3 px-3 font-medium text-foreground">{p.nom}</td>
                <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{p.marque}</td>
                <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{p.categorie}</td>
                <td className="py-3 px-3 text-primary font-semibold">{formatPrice(p.prix)} FCFA</td>
                <td className="py-3 px-3">
                  <Switch
                    checked={p.disponible}
                    onCheckedChange={(checked) => onToggle(p.id, checked)}
                  />
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductTable;
