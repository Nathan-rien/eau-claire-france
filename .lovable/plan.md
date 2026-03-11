

## Problème

Le composant `RegionSwitcher` (bouton 🇫🇷 France / 🇪🇺 Europe) a été ajouté dans `Navigation.tsx`, mais le `Layout.tsx` utilise `Header.tsx` pour l'en-tête. `Navigation.tsx` n'est importé nulle part dans le rendu — le switcher est donc invisible.

## Solution

Ajouter le `RegionSwitcher` dans `Header.tsx`, à côté du sélecteur de langue, à la fois dans la navigation desktop et dans le menu mobile.

### Modifications

**`src/components/Header.tsx`** :
- Importer `RegionSwitcher` et `useRegion`
- Rendre les liens de navigation dynamiques selon la région (comme dans `Navigation.tsx`) : afficher les routes EU quand `isEurope`, les routes FR sinon
- Placer le `RegionSwitcher` dans la barre desktop (à gauche du sélecteur de langue) et dans le menu mobile (Sheet)
- Mettre à jour `mapsItems` et `navigationItems` pour qu'ils changent selon la région active

