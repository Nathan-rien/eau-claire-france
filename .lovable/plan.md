

## Uniformiser l'alignement du header de navigation

### Problème
Les éléments de navigation (bouton "Les cartes" et liens) n'ont pas tous les mêmes propriétés de hauteur et d'alignement vertical, ce qui crée un décalage visuel.

### Corrections dans `src/components/Header.tsx`

1. **Bouton "Les cartes"** : Ajouter `h-9 items-center` pour une hauteur fixe cohérente
2. **Liens de navigation** : Ajouter `h-9 inline-flex items-center` pour aligner verticalement avec le bouton
3. **Conteneur nav** : S'assurer que `items-center` est bien appliqué (déjà le cas)

Résultat : tous les éléments cliquables partagent la même hauteur (`h-9` = 36px) et le même centrage vertical, comme visible sur la capture de référence.

