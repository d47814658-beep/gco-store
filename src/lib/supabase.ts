import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ooazjrakaovmaqobadga.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYXpqcmFrYW92bWFxb2JhZGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODY4MDYsImV4cCI6MjA4OTc2MjgwNn0.I02VFmAC18i_pbLyS_d-C4kuGTRUm1Z-aRJMSQCewtM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Categorie = {
  id: string;
  nom: string;
  created_at: string;
};

export type ProduitImage = {
  id: string;
  produit_id: string;
  image_url: string;
  ordre: number;
  created_at: string;
};

export type Produit = {
  id: string;
  nom: string;
  marque: string;
  categorie: string;
  description: string | null;
  prix: number;
  disponible: boolean;
  created_at: string;
  produit_images?: ProduitImage[];
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  client_email?: string;
  canal: 'whatsapp' | 'formulaire';
  total_amount: number;
  status: string;
  created_at: string;
  order_items?: (OrderItem & { produits?: Produit })[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  produits?: Produit;
};

export type Promotion = {
  id: string;
  texte: string;
  actif: boolean;
  date_debut: string;
  date_fin: string;
  created_at: string;
};
