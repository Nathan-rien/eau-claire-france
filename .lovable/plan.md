

## Page "Cours de l'eau" — Évolution historique des prix

### Résumé
Nouvelle page `/cours-eau` accessible depuis la navigation "Prix des eaux", affichant l'évolution des prix de l'eau en bouteille et du robinet sous forme de graphiques animés, avec des explications contextuelles sur les facteurs de variation.

### Structure de la page

```text
┌──────────────────────────────────────────┐
│  Hero animé (gradient + compteur animé)  │
│  "Cours de l'eau" + chiffre clé animé    │
├──────────────────────────────────────────┤
│  Onglets: [Eau en bouteille] [Eau robinet]│
├──────────────────────────────────────────┤
│  Graphique principal (Recharts AreaChart) │
│  Sélecteur période: 1an / 5ans / Max     │
│  Animation fade-in au scroll              │
├──────────────────────────────────────────┤
│  Cards animées "Pourquoi le prix change" │
│  - Matières premières (PET, énergie)     │
│  - Transport & logistique                │
│  - Réglementation & taxes                │
│  - Inflation générale                    │
├──────────────────────────────────────────┤
│  Section eau du robinet                  │
│  Graphique prix m³ historique            │
│  Facteurs: investissements réseaux,      │
│  normes, redevances agences de l'eau     │
├──────────────────────────────────────────┤
│  Statistiques clés animées (counters)    │
│  Prix moyen bouteille vs robinet x300    │
└──────────────────────────────────────────┘
```

### Fichiers à créer / modifier

1. **`src/pages/CoursEau.tsx`** — Page principale avec :
   - Hero avec animation de compteur (prix actuel animé)
   - Onglets bouteille / robinet via `Tabs`
   - Graphiques Recharts (`AreaChart` avec gradient fill, animations activées)
   - Données historiques statiques (prix moyens eau bouteille FR 2015-2025, prix m³ robinet 2010-2025 basés sur données publiques DGCCRF/INSEE)
   - Cards explicatives avec `animate-fade-in` au scroll via `IntersectionObserver`
   - Compteurs animés pour les chiffres clés

2. **`src/App.tsx`** — Ajouter lazy import + route `/cours-eau`

3. **`src/components/Navigation.tsx`** — Ajouter lien dans la section prix (sous `/prix-eaux`)

4. **`src/components/Header.tsx`** — Ajouter lien dans le menu mobile

5. **`src/utils/seoData.ts`** — Ajouter entrée SEO `coursEau`

6. **`src/data/waterPriceHistory.ts`** — Données historiques statiques :
   - Prix moyen bouteille €/L par an (2015-2025) basé sur indices INSEE
   - Prix moyen robinet €/m³ par an (2010-2025) basé sur rapports SISPEA
   - Événements marquants (canicules, COVID, inflation 2022-23)

### Animations prévues
- Compteurs numériques animés (hook `useCountUp`)
- Graphiques Recharts avec `animationDuration={1500}`
- Cards qui apparaissent en `animate-fade-in` au scroll
- Transitions entre onglets bouteille/robinet
- Gradient animé sur le hero

### Données historiques (statiques, sources publiques)
- Eau bouteille : ~0.20€/L (2015) → ~0.35€/L (2025), avec pics inflation
- Eau robinet : ~3.50€/m³ (2010) → ~4.30€/m³ (2025)
- Ratio bouteille/robinet : ~x100 à x300

