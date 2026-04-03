

## Ajouter les pages parcours aux cartes + corriger le scroll mobile

### 1. Ajouter les parcours dans le dropdown "Les cartes" (`src/components/Header.tsx`)

Les traductions `nav.maps.bottleJourney` et `nav.maps.tapJourney` existent deja. Il suffit d'ajouter 2 entrees dans `mapsItems` (branche France) :

```
{ href: '/carte-parcours-eau', label: t('nav.maps.bottleJourney') },
{ href: '/carte-parcours-robinet', label: t('nav.maps.tapJourney') },
```

Ajouter egalement ces 2 liens dans la section "Cartes" du menu mobile (le bloc `mapsItems.map` dans le `SheetContent`).

Mettre a jour `isActiveMapsSection` pour inclure ces nouvelles routes, et retirer la section "Parcours" separee (dropdown desktop + section mobile) puisque ces items sont desormais sous "Les cartes".

### 2. Corriger le scroll du menu mobile (`src/components/Header.tsx`)

Le `SheetContent` ne permet pas le scroll car son contenu depasse la hauteur ecran sans `overflow-y-auto`. Deux corrections :

- Ajouter `overflow-y-auto` au `SheetContent` : changer la classe en `"w-72 sm:w-80 overflow-y-auto"`
- Wraper le contenu interne dans un conteneur avec `flex flex-col h-full overflow-y-auto` pour que le scroll fonctionne meme avec le header fixe du Sheet

### 3. Nettoyage

- Supprimer le dropdown "Parcours" du desktop (le `div` avec `parcoursMenuOpen`) et les states/refs associes (`parcoursMenuOpen`, `parcoursTimeoutRef`, handlers `handleParcoursMouseEnter/Leave`)
- Supprimer la section "Parcours" du menu mobile
- Garder `parcoursItems` fusionne dans `mapsItems`

### Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `src/components/Header.tsx` | Fusion parcours dans mapsItems, suppression dropdown Parcours, ajout overflow-y-auto sur SheetContent mobile |

