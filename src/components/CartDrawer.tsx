import { useCart } from '@/lib/cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useState } from 'react';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/whatsapp';

const CartDrawer = ({ onClose }: { onClose: () => void }) => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      <Sheet open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Mon panier
              {totalItems > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {totalItems} article{totalItems > 1 ? 's' : ''}
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Votre panier d'achat
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-center">
                Votre panier est vide.
              </p>
              <Button variant="outline" onClick={onClose}>
                Continuer mes achats
              </Button>
            </div>
          ) : (
            <>
              {/* Scrollable items list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => {
                  const mainImage = item.produit.produit_images?.find(img => img.ordre === 0) || item.produit.produit_images?.[0];
                  return (
                    <div key={item.produit.id} className="flex gap-3 p-3 rounded-xl bg-secondary/20 border border-border/50">
                      {/* Image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary/50">
                        {mainImage ? (
                          <img
                            src={mainImage.image_url}
                            alt={item.produit.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-2">
                          {item.produit.nom}
                        </h3>
                        <p className="text-primary font-bold text-sm mt-1">
                          {formatPrice(item.produit.prix)} <span className="text-xs font-normal">FCFA</span>
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.produit.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.produit.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.produit.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-6 py-4 space-y-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total ({totalItems} article{totalItems > 1 ? 's' : ''})
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(totalPrice)} <span className="text-sm font-medium text-muted-foreground">FCFA</span>
                  </span>
                </div>
                <Button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  Passer à la caisse
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => clearCart()}
                  className="w-full text-muted-foreground hover:text-destructive"
                  size="sm"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Vider le panier
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartItems={items}
        totalPrice={totalPrice}
      />
    </>
  );
};

export default CartDrawer;