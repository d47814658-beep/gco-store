import { Link } from 'react-router-dom';
import { Monitor, ArrowRight, ShoppingCart } from 'lucide-react';
import type { Produit } from '@/lib/supabase';
import { formatPrice, getWhatsAppUrl } from '@/lib/whatsapp';
import { cleanText } from '@/lib/utils';
import { useCart } from '@/lib/cart';

interface ProductCardProps {
  product: Produit;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const mainImage = product.produit_images?.find((img) => img.ordre === 0) || product.produit_images?.[0];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getWhatsAppUrl(product.nom, product.prix), '_blank');
  };
  const { addItem } = useCart();

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group bg-card border border-smart-border sm:border-transparent sm:hover:border-border sm:hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all duration-300 block"
    >
      <div className="flex flex-row sm:flex-col items-stretch h-full">
        {/* Container Image (Carré à gauche sur mobile, rectangle en haut sur PC) */}
        <div className="w-[120px] min-w-[120px] sm:w-full h-[120px] sm:h-[220px] bg-secondary/30 overflow-hidden flex flex-shrink-0 items-center justify-center relative border-r sm:border-r-0 sm:border-b border-border/50">
          {mainImage ? (
            <img
              src={mainImage.image_url}
              alt={`${product.nom} ${product.marque}`}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <Monitor className="w-8 h-8 sm:w-16 sm:h-16 text-muted-foreground/30" />
          )}
        </div>

        {/* Container Infos */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {cleanText(product.marque)}
            </p>
            <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {cleanText(product.nom)}
            </h3>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-base sm:text-lg font-black text-primary">
              {formatPrice(product.prix)} <span className="text-[10px] sm:text-xs font-bold text-primary/80">FCFA</span>
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile icon */}
              <div className="sm:hidden w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <ArrowRight className="w-4 h-4" />
              </div>
              {/* Desktop buttons */}
              <div className="hidden sm:flex sm:flex-col sm:items-stretch gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleWhatsApp(e);
                  }}
                  className="flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground px-3 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Commander
                </button>
                <button
                  onClick={() => {
                    addItem(product);
                  }}
                  className="flex items-center justify-center text-xs font-bold bg-secondary text-primary-foreground px-3 py-2 rounded-full hover:bg-secondary/80 transition-colors"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
