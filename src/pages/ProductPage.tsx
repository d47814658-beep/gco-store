import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase, type Produit } from '@/lib/supabase';
import { formatPrice, getWhatsAppUrl } from '@/lib/whatsapp';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { Monitor, ArrowLeft, Loader2 } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('produits')
        .select('*, produit_images(*)')
        .eq('id', id)
        .single();
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Produit introuvable.</p>
        <Link to="/" className="text-primary hover:underline text-sm">← Retour au catalogue</Link>
      </div>
    );
  }

  const mainImage =
    product.produit_images?.find((img) => img.ordre === 0) ||
    product.produit_images?.[0];
  const images = product.produit_images || [];
  const displayImage = images[activeImage]?.image_url || mainImage?.image_url;

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://gcoclaude.shop/produit/${product.id}`,
    name: product.nom,
    brand: { '@type': 'Brand', name: product.marque },
    description:
      product.description ||
      `Achetez ${product.nom} ${product.marque} au meilleur prix chez GCO Store à Cotonou, Bénin.`,
    image: displayImage || 'https://gcoclaude.shop/og-banner.png',
    category: product.categorie,
    url: `https://gcoclaude.shop/produit/${product.id}`,
    offers: {
      '@type': 'Offer',
      price: product.prix,
      priceCurrency: 'XOF',
      priceValidUntil,
      availability: product.disponible
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'GCO STORE', url: 'https://gcoclaude.shop' },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{product.nom} - {product.marque} | GCO Store Cotonou</title>
        <meta
          name="description"
          content={`${product.nom} ${product.marque} à ${formatPrice(product.prix)} FCFA. Disponible chez GCO Store Cotonou. Commandez via WhatsApp, livraison rapide au Bénin.`}
        />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.nom} - ${product.marque} | GCO Store`} />
        <meta
          property="og:description"
          content={`${product.nom} ${product.marque} à ${formatPrice(product.prix)} FCFA chez GCO Store Cotonou.`}
        />
        <meta property="og:image" content={displayImage || 'https://gcoclaude.shop/og-banner.png'} />
        <meta property="og:url" content={`https://gcoclaude.shop/produit/${product.id}`} />
        <link rel="canonical" href={`https://gcoclaude.shop/produit/${product.id}`} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <Navbar onSearchToggle={() => {}} showSearch={false} />

      <main className="flex-1 container mx-auto max-w-4xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="w-full h-80 bg-secondary/50 rounded-xl overflow-hidden">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={`${product.nom} ${product.marque}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Monitor className="w-20 h-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.marque}</p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{product.nom}</h1>
            {product.categorie && (
              <span className="text-xs bg-secondary text-muted-foreground px-3 py-1 rounded-full w-fit">
                {product.categorie}
              </span>
            )}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            )}
            <p className="text-3xl font-bold text-primary mt-2">
              {formatPrice(product.prix)} <span className="text-base font-medium">FCFA</span>
            </p>
            <button
              onClick={() => window.open(getWhatsAppUrl(product.nom, product.prix), '_blank')}
              className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1eb859] transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Commander via WhatsApp
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Livraison à Cotonou & Abomey-Calavi • Réponse en moins d'1h
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default ProductPage;
