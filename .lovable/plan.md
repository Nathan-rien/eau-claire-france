

## Intégrer les données de composition dans les pages Europe existantes

Les données `getEUWaterComposition()` sont prêtes. Il faut maintenant les injecter dans 3 pages existantes sans casser leur structure actuelle.

### Pages concernées

**1. DiagnosticEurope (`/diagnostic-europe`)** — Ajout d'une carte "Composition de l'eau"

Quand un pays est sélectionné, ajouter une nouvelle Card sous les violations affichant les 11 paramètres physico-chimiques en grille. Chaque paramètre dans un mini-bloc avec icône, valeur moyenne et unité. Charger via `getEUWaterComposition(selectedCountry)`.

**2. ClassementEurope (`/classement-europe`)** — Enrichir la ligne dépliable

Dans la zone expandable de chaque pays (après les polluants détectés), ajouter une section "Composition physico-chimique" avec un tableau compact : Paramètre | Moyenne | Min | Max | Unité. Charger les données au montage avec `getEUWaterComposition()`.

**3. PolluantsEurope (`/polluants-europe`)** — Ajouter les paramètres de composition comme contexte

En haut de page, ajouter un encart résumé optionnel quand un pays est filtré, montrant les principaux paramètres physico-chimiques du pays sélectionné (pH, dureté, conductivité) pour contextualiser les dépassements.

### Détails techniques

- **Service** : `getEUWaterComposition()` existe déjà dans `europeWaterApi.ts` avec fallback CSV
- **Import** : ajouter `getEUWaterComposition, type EUWaterComposition` dans les imports de chaque page
- **State** : `useState<EUWaterComposition[]>([])` + chargement dans le `useEffect` existant
- **Labels français** : mapping `parameter → label` (ex: "Total hardness" → "Dureté totale", "Calcium" → "Calcium", "pH" → "pH", etc.)
- **Aucune nouvelle page** créée, aucune route ajoutée
- **Aucune modification** du service ou des données CSV

### Fichiers modifiés

1. `src/pages/DiagnosticEurope.tsx` — nouvelle Card composition
2. `src/pages/ClassementEurope.tsx` — section composition dans l'expandable
3. `src/pages/PolluantsEurope.tsx` — encart contextuel par pays

