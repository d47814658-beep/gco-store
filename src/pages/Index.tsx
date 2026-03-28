import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase, type Produit } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Footer from '@/components/Footer';
import { PackageOpen } from 'lucide-react';
import { useLocalBusinessSchema, useFAQSchema, useBreadcrumbSchema } from '@/hooks/use-seo';
import { formatPrice } from '@/lib/whatsapp';

const Index = () => {
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Tous');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useLocalBusinessSchema();
  useFAQSchema();
  useBreadcrumbSchema();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('produits')
      .select('*, produit_images(*)')
      .neq('disponible', false)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
    setProducts(data || []);
    setLoading(false);
  };

  const filtered = products.filter((p) => {
    const matchCat = category === 'Tous' || p.categorie === category;
    const matchSearch =
      !search ||
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.marque.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const metaTitle = 'GCO Store – Matériel Informatique à Cotonou, Bénin';
  const metaDescription = 'Achetez PC portables, accessoires et périphériques informatiques à Cotonou. Commande rapide via WhatsApp. GCO Store Bénin.';
  const metaImage = 'https://gcoclaude.shop/og-banner.png';

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gcoclaude.shop" />
        <link rel="canonical" href="https://gcoclaude.shop" />
      </Helmet>
      <Navbar onSearchToggle={() => setShowSearch(!showSearch)} showSearch={showSearch} />
      <Hero />

      <section id="products" className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {showSearch && (
            <div className="mb-8 animate-fade-in">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          )}

          <div className="mb-10">
            <CategoryFilter active={category} onChange={setCategory} />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-secondary/50 rounded-lg aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <PackageOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">Aucun produit trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
