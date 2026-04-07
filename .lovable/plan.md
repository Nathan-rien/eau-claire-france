

## Ajout image de fond sur l'encart "Classement des eaux en bouteille"

### Modification

**Fichier : `src/pages/Index.tsx` (lignes 134-135)**

Remplacer le fond gradient (`bg-gradient-to-r from-primary/10 via-blue-50 to-green-50`) par une image de fond thematique eau (photo Unsplash de bouteilles d'eau ou eau claire) avec overlay semi-transparent pour la lisibilite.

- Ajouter `style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560023907-5f339617ea55?w=1200&q=80)' }}` sur le conteneur interieur (photo de bouteilles d'eau)
- Classes : `bg-cover bg-center relative`
- Overlay : div absolu `bg-white/80 backdrop-blur-sm` pour garder le texte lisible
- Contenu en `relative z-10`

### Fichier modifie
- `src/pages/Index.tsx` uniquement

