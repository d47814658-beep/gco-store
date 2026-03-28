import { useState } from 'react';
import { X, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Produit, ProduitImage } from '@/lib/supabase';
import { formatPrice, getWhatsAppUrl } from '@/lib/whatsapp';

interface ProductModalProps {
  product: Produit;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const images = product.produit_images?.sort((a, b) => a.ordre - b.ordre) || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = images.length > 1;
  const activeImage = images[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main image */}
        <div className="relative aspect-square bg-secondary/50 flex items-center justify-center p-12 rounded-t-xl">
          {activeImage ? (
            <img
              src={activeImage.image_url}
              alt={`${product.nom} ${product.marque} - Disponible chez GCO Store Cotonou`}
              className="w-full h-full object-contain"
            />
          ) : (
            <Monitor className="w-24 h-24 text-muted-foreground/30" />
          )}

          {hasMultiple && (
            <>
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={`w-14 h-14 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-colors ${
                  i === activeIndex ? 'border-primary' : 'border-border'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.marque}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{product.nom}</h2>
          <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(product.prix)} FCFA</p>

          {product.description && (
            <p className="mt-4 text-muted-foreground font-light leading-relaxed">
              {product.description}
            </p>
          )}

          <a
            href={getWhatsAppUrl(product.nom, product.prix)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Commander via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
