import { useState, useEffect } from 'react';
import { supabase, type Produit, type ProduitImage, type Categorie } from '@/lib/supabase';
import { uploadToCloudinary, extractPublicId, deleteFromCloudinary } from '@/lib/cloudinary';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  preview: string;
  url?: string;
}

interface ProductFormProps {
  product: Produit | null;
  onSave: () => void;
}

const ProductForm = ({ product, onSave }: ProductFormProps) => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nom, setNom] = useState(product?.nom || '');
  const [marque, setMarque] = useState(product?.marque || '');
  const [categorie, setCategorie] = useState(product?.categorie || '');
  const [description, setDescription] = useState(product?.description || '');
  const [prix, setPrix] = useState(product?.prix?.toString() || '');
  const [disponible, setDisponible] = useState(product?.disponible ?? true);
  const [saving, setSaving] = useState(false);

  // Images
  const [existingImages, setExistingImages] = useState<ProduitImage[]>([]);
  const [newImages, setNewImages] = useState<UploadingImage[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProduitImage | null>(null);

  // Fetch categories from Supabase
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('nom', { ascending: true })
      .then(({ data }) => {
        const cats = data || [];
        setCategories(cats);
        // Set default category if not already set
        if (!categorie && cats.length > 0) {
          setCategorie(cats[0].nom);
        }
      });
  }, []);

  useEffect(() => {
    if (product) {
      fetchExistingImages();
    }
  }, [product]);

  const fetchExistingImages = async () => {
    if (!product) return;
    const { data } = await supabase
      .from('produit_images')
      .select('*')
      .eq('produit_id', product.id)
      .order('ordre', { ascending: true });
    setExistingImages(data || []);
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const uploads: UploadingImage[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...uploads]);

    for (const upload of uploads) {
      try {
        const url = await uploadToCloudinary(upload.file, (progress) => {
          setNewImages((prev) =>
            prev.map((img) => (img.id === upload.id ? { ...img, progress } : img))
          );
        });
        setNewImages((prev) =>
          prev.map((img) => (img.id === upload.id ? { ...img, url, progress: 100 } : img))
        );
      } catch {
        toast({ title: 'Erreur', description: `Échec upload: ${upload.file.name}`, variant: 'destructive' });
        setNewImages((prev) => prev.filter((img) => img.id !== upload.id));
      }
    }

    e.target.value = '';
  };

  const removeNewImage = (id: string) => {
    setNewImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const confirmDeleteExisting = async () => {
    if (!deleteTarget) return;

    const publicId = extractPublicId(deleteTarget.image_url);
    
    // Delete from DB
    await supabase.from('produit_images').delete().eq('id', deleteTarget.id);

    // Try Cloudinary delete (non-blocking)
    if (publicId) {
      deleteFromCloudinary(publicId).catch(() => {});
    }

    // If deleted image was ordre 0, promote next image
    if (deleteTarget.ordre === 0) {
      const remaining = existingImages.filter((img) => img.id !== deleteTarget.id);
      if (remaining.length > 0) {
        await supabase
          .from('produit_images')
          .update({ ordre: 0 })
          .eq('id', remaining[0].id);
      }
    }

    setDeleteTarget(null);
    toast({ title: 'Image supprimée' });
    fetchExistingImages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const uploadedNewImages = newImages.filter((img) => img.url);
    
    setSaving(true);

    const produitData = {
      nom,
      marque,
      categorie,
      description: description || null,
      prix: parseFloat(prix),
      disponible,
    };

    try {
      let produitId: string;

      if (product) {
        await supabase.from('produits').update(produitData).eq('id', product.id);
        produitId = product.id;
      } else {
        const { data, error } = await supabase.from('produits').insert(produitData).select('id').single();
        if (error || !data) throw error;
        produitId = data.id;
      }

      // Insert new images
      if (uploadedNewImages.length > 0) {
        const startOrdre = product ? existingImages.length : 0;
        const imageRows = uploadedNewImages.map((img, i) => ({
          produit_id: produitId,
          image_url: img.url!,
          ordre: startOrdre + i,
        }));
        await supabase.from('produit_images').insert(imageRows);
      }

      // Cleanup previews
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
      
      setSaving(false);
      onSave();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le produit.', variant: 'destructive' });
      setSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
  const allUploaded = newImages.every((img) => img.url);

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <h2 className="text-xl font-bold text-foreground">
          {product ? 'Modifier le produit' : 'Ajouter un produit'}
        </h2>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Nom</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Marque</label>
          <input type="text" value={marque} onChange={(e) => setMarque(e.target.value)} required className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Catégorie</label>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={inputClasses} required>
            {categories.length === 0 && (
              <option value="" disabled>Chargement des catégories...</option>
            )}
            {categories.map((c) => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Prix en FCFA</label>
          <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} required min="0" className={inputClasses} />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={disponible} onCheckedChange={setDisponible} />
          <label className="text-sm text-muted-foreground">Disponible</label>
        </div>

        {/* Images section */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Images</label>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group w-24 h-24">
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  {img.ordre === 0 && (
                    <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(img)}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New image previews with progress */}
          {newImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {newImages.map((img, i) => (
                <div key={img.id} className="relative w-24">
                  <div className="relative w-24 h-24">
                    <img
                      src={img.preview}
                      alt=""
                      className={`w-full h-full object-cover rounded-lg border border-border ${!img.url ? 'opacity-50' : ''}`}
                    />
                    {!product && existingImages.length === 0 && i === 0 && img.url && (
                      <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                        Principal
                      </span>
                    )}
                    {img.url && (
                      <button
                        type="button"
                        onClick={() => removeNewImage(img.id)}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {!img.url && (
                    <Progress value={img.progress} className="mt-1 h-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sélectionner des images</span>
            <input type="file" accept="image/*" multiple onChange={handleFilesSelect} className="hidden" />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || !allUploaded || !categorie}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : product ? 'Mettre à jour' : 'Ajouter le produit'}
        </button>
      </form>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'image sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExisting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductForm;
