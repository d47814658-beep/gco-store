import { Link } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import type { Produit } from '@/lib/supabase';
import { formatPrice, getWhatsAppUrl } from '@/lib/whatsapp';
import { cleanText } from '@/lib/utils';

interface ProductCardProps {
  product: Produit;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const mainImage = product.produit_images?.find((img) => img.ordre === 0) || product.produit_images?.[0];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getWhatsAppUrl(product.nom, product.prix), '_blank');
  };

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:border-l-2 hover:border-l-primary block"
    >
      <div className="w-full h-48 sm:h-[220px] bg-secondary/50 overflow-hidden flex items-center justify-center">
        {mainImage ? (
          <img
            src={mainImage.image_url}
            alt={`${product.nom} ${product.marque} - GCO Store Cotonou Bénin`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <Monitor className="w-16 h-16 text-muted-foreground/30" />
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {cleanText(product.marque)}
        </p>
        <h3 className="mt-1 font-bold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {cleanText(product.nom)}
        </h3>
        <p className="mt-2 text-base sm:text-lg font-bold text-primary">
          {formatPrice(product.prix)} FCFA
        </p>
        <button
          onClick={(e) => {
            e.preventDefault(); 
            handleWhatsApp(e);
          }}
          className="hidden sm:block mt-3 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          Commander via WhatsApp
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
