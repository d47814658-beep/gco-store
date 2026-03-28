import { useEffect } from 'react';
import type { Produit } from '@/lib/supabase';

// ─── LocalBusiness + ElectronicsStore Schema ───────────────────────────────
export function useLocalBusinessSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': ['ElectronicsStore', 'LocalBusiness'],
      '@id': 'https://gcostore.bj/#business',
      name: 'GCO STORE',
      alternateName: 'GCO Store Cotonou',
      description:
        'Boutique informatique N°1 à Cotonou et Abomey-Calavi, Bénin. PC portables, refroidisseurs, clés USB, périphériques et accessoires pour étudiants UAC et professionnels. Commande via WhatsApp, paiement Mobile Money accepté.',
      url: 'https://gcostore.bj',
      logo: 'https://gcostore.bj/favicon.png',
      image: 'https://gcostore.bj/og-banner.png',
      telephone: '+22994523671',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cotonou',
        addressRegion: 'Littoral',
        addressCountry: 'BJ',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 6.3654,
        longitude: 2.4183,
      },
      hasMap: 'https://maps.google.com/?q=GCO+Store+Cotonou+Benin',
      areaServed: [
        { '@type': 'City', name: 'Cotonou' },
        { '@type': 'City', name: 'Abomey-Calavi' },
        { '@type': 'AdministrativeArea', name: 'Littoral' },
        { '@type': 'Country', name: 'Bénin' },
      ],
      priceRange: '$$',
      currenciesAccepted: 'XOF',
      paymentAccepted: 'Cash, Mobile Money MTN, Moov Money',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:00',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+22994523671',
        contactType: 'sales',
        contactOption: 'TollFree',
        availableLanguage: 'French',
        areaServed: 'BJ',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '52',
        bestRating: '5',
        worstRating: '1',
      },
      sameAs: [
        'https://wa.me/22994523671',
      ],
    };

    let el = document.getElementById('local-business-schema');
    if (!el) {
      el = document.createElement('script');
      el.id = 'local-business-schema';
      (el as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);

    return () => {
      document.getElementById('local-business-schema')?.remove();
    };
  }, []);
}

// ─── FAQ Schema ─────────────────────────────────────────────────────────────
export function useFAQSchema() {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Comment commander chez GCO Store ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Cliquez sur « Commander via WhatsApp » sur le produit qui vous intéresse. Vous êtes redirigé vers WhatsApp avec un message pré-rempli. GCO Store répond en moins d'1 heure du lundi au samedi.",
          },
        },
        {
          '@type': 'Question',
          name: 'GCO Store livre-t-il à Abomey-Calavi ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Oui, GCO Store livre à Cotonou et Abomey-Calavi. Contactez-nous sur WhatsApp au +229 94 52 36 71 pour les modalités de livraison.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quels modes de paiement acceptez-vous ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GCO Store accepte le paiement en espèces (cash) et par Mobile Money : MTN Mobile Money et Moov Money. Le paiement à la livraison est possible à Cotonou.',
          },
        },
        {
          '@type': 'Question',
          name: 'Proposez-vous des PC portables pour étudiants à l\'UAC ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Oui ! GCO Store propose une sélection de PC portables adaptés aux étudiants de l'Université d'Abomey-Calavi (UAC) à des prix abordables. Consultez notre catalogue en ligne ou contactez-nous sur WhatsApp pour une recommandation personnalisée.",
          },
        },
        {
          '@type': 'Question',
          name: 'Est-ce que GCO Store est une boutique physique à Cotonou ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GCO Store est une boutique informatique basée à Cotonou, Bénin. Vous pouvez nous contacter via WhatsApp pour visiter notre stock ou vous faire livrer directement.',
          },
        },
      ],
    };

    let el = document.getElementById('faq-schema');
    if (!el) {
      el = document.createElement('script');
      el.id = 'faq-schema';
      (el as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);

    return () => {
      document.getElementById('faq-schema')?.remove();
    };
  }, []);
}

// ─── Product Schema ──────────────────────────────────────────────────────────
export function useProductSchema(product: Produit | null) {
  useEffect(() => {
    if (!product) return;

    const mainImage =
      product.produit_images?.find((img) => img.ordre === 0) ||
      product.produit_images?.[0];

    const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `https://gcostore.bj/#product-${product.id}`,
      name: product.nom,
      brand: { '@type': 'Brand', name: product.marque },
      description:
        product.description ||
        `Achetez ${product.nom} ${product.marque} au meilleur prix chez GCO Store à Cotonou, Bénin. Commande via WhatsApp, livraison Abomey-Calavi.`,
      image: mainImage?.image_url || 'https://gcostore.bj/og-banner.png',
      category: product.categorie,
      offers: {
        '@type': 'Offer',
        price: product.prix,
        priceCurrency: 'XOF',
        priceValidUntil,
        availability: product.disponible
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'GCO STORE',
          url: 'https://gcostore.bj',
        },
        url: 'https://gcostore.bj',
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'XOF',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
            },
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'BJ',
          },
        },
      },
    };

    let el = document.getElementById('product-schema');
    if (!el) {
      el = document.createElement('script');
      el.id = 'product-schema';
      (el as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);

    return () => {
      document.getElementById('product-schema')?.remove();
    };
  }, [product]);
}
