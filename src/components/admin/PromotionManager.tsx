import { useState, useEffect } from 'react';
import { supabase, type Promotion } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Pencil, X } from 'lucide-react';

const PromotionManager = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    texte: '',
    date_debut: '',
    date_fin: '',
    actif: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    setPromotions(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ texte: '', date_debut: '', date_fin: '', actif: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (promo: Promotion) => {
    setEditing(promo);
    setForm({
      texte: promo.texte,
      date_debut: promo.date_debut.slice(0, 16),
      date_fin: promo.date_fin.slice(0, 16),
      actif: promo.actif,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.texte || !form.date_debut || !form.date_fin) return;

    const payload = {
      texte: form.texte,
      date_debut: new Date(form.date_debut).toISOString(),
      date_fin: new Date(form.date_fin).toISOString(),
      actif: form.actif,
    };

    if (editing) {
      await supabase.from('promotions').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('promotions').insert(payload);
    }

    resetForm();
    fetchPromotions();
  };

  const handleToggle = async (id: string, actif: boolean) => {
    await supabase.from('promotions').update({ actif }).eq('id', id);
    fetchPromotions();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('promotions').delete().eq('id', id);
    fetchPromotions();
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isActive = (promo: Promotion) => {
    const now = new Date();
    return promo.actif && new Date(promo.date_debut) <= now && new Date(promo.date_fin) >= now;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Promotions</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editing ? 'Modifier la promotion' : 'Nouvelle promotion'}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="promo-texte">Texte de la promotion</Label>
              <Input
                id="promo-texte"
                value={form.texte}
                onChange={(e) => setForm((f) => ({ ...f, texte: e.target.value }))}
                placeholder="Ex: -20% sur tous les PC portables !"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-debut">Date de début</Label>
                <Input
                  id="promo-debut"
                  type="datetime-local"
                  value={form.date_debut}
                  onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="promo-fin">Date de fin</Label>
                <Input
                  id="promo-fin"
                  type="datetime-local"
                  value={form.date_fin}
                  onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.actif}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, actif: checked }))}
              />
              <Label>Activer immédiatement</Label>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              {editing ? 'Enregistrer les modifications' : 'Créer la promotion'}
            </Button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucune promotion créée.</p>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`p-4 rounded-xl border transition-colors ${
                isActive(promo)
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isActive(promo) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        En cours
                      </span>
                    )}
                    {!promo.actif && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                        Désactivée
                      </span>
                    )}
                    {promo.actif && !isActive(promo) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700">
                        Planifiée
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-foreground truncate">{promo.texte}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Du {formatDate(promo.date_debut)} au {formatDate(promo.date_fin)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={promo.actif}
                    onCheckedChange={(checked) => handleToggle(promo.id, checked)}
                  />
                  <button
                    onClick={() => handleEdit(promo)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionManager;
