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
