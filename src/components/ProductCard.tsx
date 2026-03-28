import { Monitor } from 'lucide-react';
import type { Produit } from '@/lib/supabase';
import { formatPrice, getWhatsAppUrl } from '@/lib/whatsapp';

interface ProductCardProps {
  product: Produit;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const mainImage = product.produit_images?.find((img) => img.ordre === 0) || product.produit_images?.[0];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getWhatsAppUrl(product.nom, product.prix), '_blank');
  };

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:border-l-2 hover:border-l-primary"
    >
      <div className="w-full h-[220px] bg-secondary/50 overflow-hidden flex items-center justify-center">
        {mainImage ? (
          <img
            src={mainImage.image_url}
            alt={`${product.nom} ${product.marque} - GCO Store Cotonou Bénin`}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <Monitor className="w-16 h-16 text-muted-foreground/30" />
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.marque}
        </p>
        <h3 className="mt-1 font-bold text-foreground truncate">{product.nom}</h3>
        <p className="mt-2 text-lg font-bold text-primary">
          {formatPrice(product.prix)} FCFA
        </p>
        <button
          onClick={handleWhatsApp}
          className="mt-3 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          Commander via WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
