

## Corriger les problemes d'indexation Google Search Console

### Diagnostic des 4 problemes

**1. noindex sur `/en/`, `/en/prix-eaux`, `/en/carte`** : Aucune route `/en/*` n'existe dans App.tsx. Ces URLs tombent sur le catch-all `*` → NotFound.tsx qui pose `<meta name="robots" content="noindex, nofollow" />`. Le probleme vient du SEOHead qui genere par defaut des hreflang vers `/en/...`, incitant Google a explorer ces URLs inexistantes.

**2. Soft 404 sur `/bouteilles` et `/en/diagnostic`** : Le sitemap reference `/bouteilles` (ligne 40) mais la route reelle est `/comparatif-bouteilles`. `/en/diagnostic` n'existe pas non plus.

**3-4. Pages detectees/explorees non indexees** : `/alertes`, `/carte-polluants`, `/mentions-legales`, `/open-data`, `/rgpd`, `/sources`, `/accessibilite`, `/comparatif-bouteilles` — ces routes existent mais Google les juge insuffisantes. On peut ameliorer en mettant a jour les dates du sitemap et en s'assurant que chaque page a un SEOHead correct.

### Plan de correction

**Fichier 1 : `src/components/SEOHead.tsx`**
- Supprimer le hreflang par defaut qui genere des URLs `/en/...` inexistantes
- Changer la valeur par defaut de `hreflang` de `{ 'fr': ..., 'en': ... }` a `{}` (vide)
- Les pages qui ont reellement une version EN pourront le passer explicitement

**Fichier 2 : `public/sitemap.xml`**
- Corriger `/bouteilles` → `/comparatif-bouteilles` (corrige le soft 404)
- Supprimer tous les `xhtml:link hreflang="en"` qui pointent vers des routes `/en/*` inexistantes
- Ajouter les pages manquantes : `/carte-parcours-eau`, `/carte-parcours-robinet`
- Mettre a jour toutes les dates `lastmod` a `2026-04-07`

**Fichier 3 : `src/App.tsx`**
- Ajouter une route `/bouteilles` qui redirige vers `/comparatif-bouteilles` via `<Navigate to="/comparatif-bouteilles" replace />` pour eviter le soft 404 sur les anciens liens

### Recapitulatif

| Probleme GSC | Cause | Correction |
|---|---|---|
| noindex `/en/*` | Pas de routes EN → NotFound + noindex | Supprimer hreflang EN par defaut dans SEOHead + sitemap |
| Soft 404 `/bouteilles` | URL dans sitemap mais route inexistante | Corriger sitemap + ajouter redirect dans App.tsx |
| Soft 404 `/en/diagnostic` | URL hreflang dans sitemap, route inexistante | Supprimer hreflang EN du sitemap |
| Pages non indexees | Dates obsoletes, sitemap incomplet | MAJ dates, ajout pages manquantes |

### Fichiers modifies

| Fichier | Changement |
|---|---|
| `src/components/SEOHead.tsx` | Supprimer hreflang EN par defaut |
| `public/sitemap.xml` | Corriger `/bouteilles`, supprimer hreflang EN, ajouter pages manquantes, MAJ dates |
| `src/App.tsx` | Ajouter redirect `/bouteilles` → `/comparatif-bouteilles` |

