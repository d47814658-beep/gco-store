import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le fichier .env en local s'il existe (pour npm run dev)
// Sur Vercel, les variables d'environnement sont injectées directement.
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Enlever les guillemets si présents
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = 'https://gcoclaude.shop';

if (!supabaseUrl || !supabaseKey) {
  console.error("VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être fournis.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('Générateur Sitemap : Récupération des produits depuis Supabase...');
  
  const { data: products, error } = await supabase
    .from('produits')
    .select('id, created_at')
    .neq('disponible', false); // Les dispo et ceux avec null s'afficheront

  if (error) {
    console.error('Erreur lors de la récupération des produits :', error.message);
    process.exit(1);
  }

  const currentDate = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Ajouter l'accueil
  sitemap += `  <url>\n`;
  sitemap += `    <loc>${siteUrl}/</loc>\n`;
  sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
  sitemap += `    <changefreq>daily</changefreq>\n`;
  sitemap += `    <priority>1.0</priority>\n`;
  sitemap += `  </url>\n`;

  // Ajouter chaque produit dynamique
  if (products && products.length > 0) {
    products.forEach(product => {
      // Utiliser la date de création si présente, sinon la date du build
      const lastmod = product.created_at ? new Date(product.created_at).toISOString() : currentDate;
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${siteUrl}/produit/${product.id}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });
  }

  sitemap += `</urlset>\n`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const sitemapPath = path.resolve(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');

  console.log(`✅ Sitemap généré avec succès à l'emplacement ${sitemapPath}`);
  console.log(`   Nombre de produits indexés : ${products?.length || 0}`);
}

generateSitemap();
