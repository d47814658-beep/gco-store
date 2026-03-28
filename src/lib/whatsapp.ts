const PHONE = '22994523671';

export function getWhatsAppUrl(nom: string, prix: number): string {
  const formattedPrix = formatPrice(prix);
  const text = `Bonjour GCO Store, je suis intéressé(e) par le produit *${nom}* à *${formattedPrix} FCFA*. Est-il disponible ?`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppBase(): string {
  return `https://wa.me/${PHONE}`;
}

export function formatPrice(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix);
}
