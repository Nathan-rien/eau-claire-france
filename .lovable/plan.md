

## Regrouper "Parcours de l'eau" en dropdown

Transformer les deux liens navigation "Parcours de l'eau" et "Parcours bouteille" en un **menu déroulant** identique au pattern existant "Cartes" (hover avec délai de fermeture).

### Modifications — `src/components/Header.tsx`

**1. Créer un tableau `parcoursItems`** (comme `mapsItems`) :
- `{ href: '/parcours-eau', label: t('nav.journey') }` — Eau du robinet
- `{ href: '/parcours-eau-bouteille', label: t('nav.journeyBottle') }` — Eau en bouteille

**2. Retirer ces 2 entrées de `navigationItems`** (lignes 40-41 et 50-51).

**3. Ajouter un second dropdown dans le desktop nav** après le dropdown Cartes, réutilisant le même pattern hover (bouton avec `ChevronDown`, menu absolu, `onMouseEnter`/`onMouseLeave` avec timeout). Label du bouton : `t('nav.journey')` ("Parcours de l'eau").

Il faudra un second jeu de refs pour le état ouvert/fermé (`parcoursMenuOpen` + `parcoursTimeoutRef`).

**4. Mobile : ajouter une section "Parcours" dans le Sheet**, identique à la section "Cartes" existante, avec un titre de section et les 2 liens indentés.

### Fichier modifié

- `src/components/Header.tsx`

