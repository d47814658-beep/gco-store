import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Produit } from '@/lib/supabase';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import logo from '@/assets/logo.png';
import { Plus, LogOut, Package, Tag } from 'lucide-react';

type Tab = 'produits' | 'categories';

const Admin = () => {
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('produits');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setAuthChecked(true);
      fetchProducts();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*, produit_images(*)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSave = () => {
    setShowForm(false);
    setEditing(null);
    fetchProducts();
  };

  const handleEdit = (product: Produit) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('produits').delete().eq('id', id);
    fetchProducts();
  };

  const handleToggle = async (id: string, disponible: boolean) => {
    await supabase.from('produits').update({ disponible }).eq('id', id);
    fetchProducts();
  };

  if (!authChecked) return null;

  const tabClass = (tab: Tab) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="GCO Store" className="h-8" />
            <h1 className="text-lg font-bold text-foreground">Admin</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Tabs */}
        {!showForm && (
          <div className="flex items-center gap-2 mb-8">
            <button className={tabClass('produits')} onClick={() => setActiveTab('produits')}>
              <Package className="w-4 h-4" />
              Produits
            </button>
            <button className={tabClass('categories')} onClick={() => setActiveTab('categories')}>
              <Tag className="w-4 h-4" />
              Catégories
            </button>
          </div>
        )}

        {/* Produits tab */}
        {activeTab === 'produits' && (
          showForm ? (
            <div>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Retour à la liste
              </button>
              <ProductForm product={editing} onSave={handleSave} />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Produits</h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <ProductTable
                  products={products}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              )}
            </>
          )
        )}

        {/* Catégories tab */}
        {activeTab === 'categories' && <CategoryManager />}
      </main>
    </div>
  );
};

export default Admin;
