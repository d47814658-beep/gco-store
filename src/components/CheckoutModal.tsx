import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getWhatsAppUrlWithMessage, formatPrice } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { CheckCircle2, ClipboardEdit } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: { produit: any; quantity: number }[];
  totalPrice: number;
}

export const CheckoutModal = ({ open, onOpenChange, cartItems, totalPrice }: CheckoutModalProps) => {
  const [tabValue, setTabValue] = useState<string>('formulaire');
  const [customerInfo, setCustomerInfo] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { clearCart } = useCart();

  const generateOrderMessage = () => {
    const lines = cartItems.map(item =>
      `- ${item.produit.nom} x${item.quantity} ${formatPrice(item.produit.prix * item.quantity)} FCFA`
    );
    const produitsList = lines.join('\n');
    return `Bonjour GCO Store,\n\nJe souhaite passer la commande suivante :\n\n${produitsList}\n\nTotal : ${formatPrice(totalPrice)} FCFA\n\nMerci de confirmer la disponibilité et les modalités de paiement.\n\nCordialement,`;
  };

  const saveOrder = async (canal: 'whatsapp' | 'formulaire') => {
    // Insert order into orders table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerInfo.nom || 'Client WhatsApp',
        customer_phone: customerInfo.telephone || '',
        customer_address: customerInfo.adresse || '',
        client_email: customerInfo.email || null,
        canal,
        total_amount: totalPrice,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.produit.id,
      quantity: item.quantity,
      unit_price: item.produit.prix
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  };

  const trackPurchase = () => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (pixelId && pixelId !== 'YOUR_PIXEL_ID_HERE') {
      import('react-facebook-pixel').then((module) => {
        const ReactPixel = module.default;
        ReactPixel.track('Purchase', {
          value: totalPrice,
          currency: 'XOF',
          contents: cartItems.map(item => ({
            id: item.produit.id,
            quantity: item.quantity,
          })),
          content_type: 'product',
        });
      });
    }
  };

  const handleWhatsAppOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveOrder('whatsapp');
      const url = getWhatsAppUrlWithMessage(generateOrderMessage());
      window.open(url, '_blank');
      trackPurchase();
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      // Still open WhatsApp even if DB save fails
      const url = getWhatsAppUrlWithMessage(generateOrderMessage());
      window.open(url, '_blank');
      trackPurchase();
      console.error('Failed to save WhatsApp order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async () => {
    if (!customerInfo.nom || !customerInfo.telephone) {
      setError('Le nom et le téléphone sont obligatoires.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await saveOrder('formulaire');
      trackPurchase();
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (success) {
      setSuccess(false);
      setCustomerInfo({ nom: '', telephone: '', email: '', adresse: '' });
      setError(null);
    }
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Passer la commande</DialogTitle>
          <DialogDescription>
            Choisissez votre méthode de confirmation de commande.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Commande envoyée !</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Votre commande a été enregistrée avec succès. Nous vous contacterons bientôt pour confirmer.
            </p>
            <Button onClick={handleClose} className="mt-2">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="formulaire" className="flex-1 gap-2">
                  <ClipboardEdit className="w-4 h-4" />
                  Formulaire
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex-1 gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </TabsTrigger>
              </TabsList>

              <TabsContent value="whatsapp" className="mt-4">
                <div className="space-y-4">
                  <textarea
                    value={generateOrderMessage()}
                    readOnly
                    className="w-full h-40 border border-input bg-secondary/30 rounded-lg p-3 text-sm font-mono text-muted-foreground resize-none"
                  />
                  <Button
                    onClick={handleWhatsAppOrder}
                    disabled={isSubmitting}
                    className="w-full bg-[#25D366] hover:bg-[#1eb859] text-white"
                  >
                    {isSubmitting ? 'Envoi...' : 'Commander via WhatsApp'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="formulaire" className="mt-4">
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
                  <div>
                    <Label htmlFor="checkout-nom">Nom *</Label>
                    <Input
                      id="checkout-nom"
                      value={customerInfo.nom}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, nom: e.target.value}))}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout-telephone">Téléphone *</Label>
                    <Input
                      id="checkout-telephone"
                      value={customerInfo.telephone}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, telephone: e.target.value}))}
                      placeholder="+229 XX XX XX XX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout-email">Email (optionnel)</Label>
                    <Input
                      id="checkout-email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout-adresse">Adresse (optionnel)</Label>
                    <Input
                      id="checkout-adresse"
                      value={customerInfo.adresse}
                      onChange={(e) => setCustomerInfo(prev => ({...prev, adresse: e.target.value}))}
                      placeholder="Votre adresse de livraison"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                  </Button>
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                      {error}
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Annuler
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;