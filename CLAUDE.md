# GCO Store — Règles projet (CLAUDE.md)

Ce fichier est chargé à **chaque conversation**. Il définit les règles permanentes du projet.

---

## Skill disponible : `/gco-store`

Avant de toucher à n'importe quel fichier de ce projet, utilise le skill `gco-store` :

```
/gco-store
```

Ce skill contient :
- La carte complète de tous les fichiers et leur rôle
- Le design system complet (couleurs, typo, animations, tokens CSS)
- Le schéma de la base de données Supabase
- Les règles strictes de ce qu'il faut faire et ne pas faire
- Le numéro WhatsApp et le format des messages
- La philosophie du projet

**Invocation automatique** : Si l'utilisateur demande une modification du site (composants, pages, styles, logique produit, admin, WhatsApp), charge automatiquement le skill `gco-store` avant d'agir.

---

## Skill disponible : `/seo-local-geo`

Pour tout travail SEO, référencement local, GEO (IA engines), structured data, ou optimisation pour Google :

```
/seo-local-geo
```

Ce skill contient :
- Les 5 couches du référencement ultime 2026
- La stratégie locale Cotonou / Bénin complète
- Tous les schémas JSON-LD à implémenter
- La checklist d'audit SEO
- Les mots-clés cibles par intention
- Les règles GEO pour les moteurs IA (ChatGPT, Perplexity, Gemini)

**Invocation automatique** : Si l'utilisateur demande d'améliorer le SEO, le référencement, la visibilité Google, les balises meta, ou les données structurées, charge automatiquement ce skill.

---

## Stack technique (résumé rapide)

| Élément | Technologie |
|---|---|
| Framework | Vite + React + TypeScript |
| Style | TailwindCSS v3 + tokens HSL dans `src/index.css` |
| UI | shadcn/ui (`src/components/ui/`) |
| Backend | Supabase (DB + Auth) |
| Images | Cloudinary |
| Router | React Router v6 |
| Data fetching | Supabase client direct (pas de React Query pour les produits) |

---

## Règles permanentes (toujours respectées, sans exception)

1. **Lire avant d'écrire** — Toujours lire le fichier cible avant de le modifier.
2. **Design system sacré** — Ne jamais hardcoder des couleurs. Utiliser uniquement les classes Tailwind (`bg-primary`, `text-muted-foreground`, etc.).
3. **Pas de panier** — Ce site n'a pas de système de panier. Toute commande passe par WhatsApp.
4. **shadcn/ui intouchable** — Ne jamais modifier manuellement les fichiers dans `src/components/ui/`.
5. **Prix en FCFA** — Toujours formater avec `formatPrice()` de `src/lib/whatsapp.ts`.
6. **WhatsApp obligatoire** — Tous les CTA produit doivent pointer vers `getWhatsAppUrl()`.
7. **Auth admin** — La route `/admin` est protégée par Supabase Auth. Ne pas la rendre accessible publiquement.
8. **Variables d'env** — Ne jamais afficher ni hardcoder les clés Supabase/Cloudinary.

---

## Dev server

```bash
npm run dev    # Démarre sur http://localhost:8080
```
