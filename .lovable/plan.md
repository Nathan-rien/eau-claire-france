

## Modifications de la page d'accueil

### 1. Hero : retrait SearchBar + ajout lien Diagnostic

- Supprimer le composant `SearchBar`, son import, le state `selectedCity`, et tout le bloc de resultat de recherche (lignes 42-62)
- Remplacer par un bouton CTA "Lancer un diagnostic" renvoyant vers `/diagnostic`

### 2. Section "Quelle eau boire ?" : ajout fond image eau

- Ajouter une image de fond thematique eau (via URL Unsplash ou image generee CSS) sur la section (ligne 91)
- Utiliser un overlay semi-transparent pour garder la lisibilite du texte (`bg-cover bg-center` + div overlay `bg-white/85`)
- Image : photo d'eau claire/source naturelle en fond

### Fichier modifie

- `src/pages/Index.tsx` — seul fichier modifie

### Detail technique

**Hero** : remplacer lignes 42-62 par un simple `<Link to="/diagnostic"><Button size="lg">Lancer un diagnostic →</Button></Link>`. Supprimer l'import de `SearchBar` et le state `selectedCity`.

**Section Quelle eau boire** : wrapper le contenu dans un conteneur avec `style={{ backgroundImage }}` utilisant une image Unsplash d'eau (ex: `https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200&q=80`) et ajouter un overlay `absolute inset-0 bg-white/80 backdrop-blur-sm` pour la lisibilite.

