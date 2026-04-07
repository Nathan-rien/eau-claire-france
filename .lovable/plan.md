

## Plan: Encart "Prix par marque" + lien regroupé dans "Prix des eaux"

### 1. Regrouper les liens prix dans un sous-menu "Prix des eaux"

Actuellement, `/prix-eaux` et `/cours-eau` sont deux liens séparés dans la navigation. Il faut les regrouper dans un dropdown "Prix des eaux" (similaire au dropdown "Les cartes").

**Fichiers modifiés** : `Header.tsx`, `Navigation.tsx`

- Retirer `/prix-eaux` et `/cours-eau` de `navigationItems` / `directNavigationItems`
- Creer un nouveau tableau `pricesItems` avec :
  - `{ href: '/prix-eaux', label: 'Comparateur de prix' }`
  - `{ href: '/cours-eau', label: "Cours de l'eau" }`
- Ajouter un dropdown "Prix des eaux" avec hover (Header desktop) et section accordéon (Header mobile), identique au pattern existant pour "Les cartes"
- Même pattern dans Navigation.tsx

### 2. Nouvel encart "Évolution du prix par marque" sur `/cours-eau`

Ajouter une section entre les graphiques généraux et la timeline, affichant un graphique par marque avec le prix moyen (toutes enseignes confondues).

**Fichiers modifiés** : `CoursEau.tsx`

- Importer `useBrands` et `getBrandStats` depuis les hooks/services existants
- Ajouter un `Select` pour choisir une marque (Evian, Cristaline, Vittel, etc.)
- Afficher un `BarChart` (Recharts) montrant le prix moyen par enseigne pour la marque sélectionnée, basé sur `BrandPriceStats.retailer_prices`
- Afficher les stats globales (`overall_stats`) : min, max, moyenne, médiane
- Inclure un état de chargement (Skeleton) et un fallback si pas de données
- Animation fade-in au scroll comme les autres sections

**Nouveau composant** : `BrandPriceChart` (inline dans CoursEau.tsx ou composant séparé)

```text
┌─────────────────────────────────────┐
│ 📊 Prix par marque                  │
│ [Select: Evian ▼]                   │
│                                     │
│ BarChart horizontal                 │
│  Carrefour  ████████ 0.42€/L        │
│  Leclerc    ██████   0.38€/L        │
│  Auchan     ███████  0.40€/L        │
│                                     │
│ Min: 0.35€  Moy: 0.40€  Max: 0.48€ │
└─────────────────────────────────────┘
```

### Détails techniques

- Le hook `useBrands()` charge la liste des marques depuis Supabase (`prices.brand`)
- `getBrandStats(brand)` retourne les prix moyens par enseigne sur les 30 derniers jours
- Le graphique utilise `BarChart` de Recharts avec des barres horizontales, une couleur par enseigne
- Les stats globales (min/max/moy/médiane) sont affichées dans des mini-cards sous le graphique
- Gestion d'erreur : message "Aucune donnée disponible" si la requête échoue ou retourne vide

