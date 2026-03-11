

## Corrections : images cassées et hero gris

### Problèmes identifiés

1. **Images Unsplash cassées** : les URLs actuelles retournent des erreurs (images supprimées ou IDs invalides). Le screenshot montre le texte alt à la place des images.
2. **Hero gris** : comme l'image hero ne charge pas, le gradient overlay `from-black/60 via-black/40 to-black/70` s'affiche sur du vide, donnant un fond gris terne.

### Corrections

**Fichier : `src/pages/ParcoursEauV2.tsx`** — Remplacer le bloc `IMAGES` (lignes 25-33) avec des URLs Unsplash vérifiées et stables :

- `hero` : photo de nature/eau de montagne (photo populaire, URL stable)
- `captage` : paysage lac/aquifère
- `pompage` : infrastructure hydraulique
- `traitement` : eau en mouvement / traitement
- `stockage` : château d'eau / réservoir
- `distribution` : tuyaux / canalisations
- `robinet` : eau coulant d'un robinet

Utiliser le format `https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=900&q=80` avec des IDs de photos Unsplash très populaires et stables (millions de vues).

Renforcer aussi le hero avec un gradient plus vibrant (bleu profond) en fallback CSS pour que même si l'image met du temps à charger, le fond reste esthétique :
- Changer le conteneur hero pour avoir `bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950` en fond de base
- L'image se superpose quand elle charge

