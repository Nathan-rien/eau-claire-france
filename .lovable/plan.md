## Objectif
Remplacer le fallback dégradé bleu/vert par une vraie image d'illustration pour l'article à la une « Nestlé Waters sous le feu des perquisitions ».

## Étapes

1. **Générer l'image** (`src/assets/articles/nestle-perquisitions.jpg`, 1536×864, modèle `standard`) :
   - Ligne d'embouteillage industrielle de bouteilles d'eau minérale en plastique transparent
   - Ambiance reportage/enquête, éclairage neutre légèrement froid
   - Pas de logo de marque visible (pour éviter problèmes de droits)
   - Format 16:9 adapté au `BlogHeroCard`

2. **Mettre à jour la BDD** via migration SQL : `UPDATE blog_articles SET cover_image_url = '/src/assets/articles/nestle-perquisitions.jpg' WHERE slug = '<slug-nestle>'`.
   - Vérifier d'abord le slug exact de l'article à la une (le plus récent publié).
   - Note : l'image étant un asset Vite, on l'importera plutôt côté code OU on copie l'image dans `public/articles/` pour pouvoir la référencer par URL stable depuis la BDD.

## Décision technique
Option retenue : **copier l'image dans `public/articles/nestle-perquisitions.jpg`** et stocker l'URL `/articles/nestle-perquisitions.jpg` dans `cover_image_url`. C'est cohérent avec le fait que `cover_image_url` est une URL string stockée en BDD (le composant fait `<img src={article.cover_image_url} />` sans import Vite).

## Fichiers touchés
- `public/articles/nestle-perquisitions.jpg` (nouveau)
- Migration Supabase : update du champ `cover_image_url` pour l'article concerné

Aucun changement de composant nécessaire (`BlogHeroCard` gère déjà `cover_image_url`).