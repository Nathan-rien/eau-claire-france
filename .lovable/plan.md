

## Étapes du parcours intégrées comme marqueurs Mapbox cliquables

### Concept

Ajouter sur la carte Mapbox des marqueurs représentant les étapes intermédiaires du parcours de l'eau en bouteille (analyse, traitement, embouteillage, stockage, transport). Actuellement la carte ne montre que **source** (bleu) et **commune/magasin** (vert). On va ajouter des marqueurs d'étapes positionnés le long de l'arc entre source et destination, chacun cliquable avec un popup détaillant l'étape, sa durée et sa description.

### Étapes ajoutées (5 marqueurs par route, positionnés sur l'arc)

Pour chaque source affichée, on place 5 marqueurs intermédiaires le long d'un arc fictif partant de la source :

1. **Analyse & contrôle** — Icône flacon — "Analyses bactériologiques et physico-chimiques" — 24-72h
2. **Traitement & filtration** — Icône filtre — "Filtration, ozonation, UV" — 2-6h  
3. **Embouteillage** — Icône bouteille/package — "Remplissage, bouchage, étiquetage" — ~0.5s/bouteille
4. **Stockage** — Icône entrepôt — "Palettisation, contrôle lot" — 1-3 jours
5. **Transport** — Icône camion — "Acheminement vers magasins" — 1-5 jours

### Positionnement

Les marqueurs d'étapes sont placés à des fractions régulières le long de l'arc (à 10%, 25%, 40%, 60%, 80% de la courbe) pour chaque source unique. Ils restent proches de la source car ce sont des étapes **avant** la distribution. On les affiche une seule fois par source (pas par commune).

### Modifications techniques

**Fichier : `src/components/WaterJourneyMap.tsx`**

- Définir un tableau constant `JOURNEY_STEPS` avec nom, description, durée, couleur, icône SVG inline pour chaque étape
- Dans `renderRoutes()`, pour chaque source unique, calculer 5 points intermédiaires sur un arc court partant de la source (direction nord-est par défaut) et y placer des marqueurs avec popups
- Chaque marqueur a un style distinct (cercle coloré avec icône, taille 28px) et un popup HTML montrant le nom, la description et la durée
- Stocker ces marqueurs dans un nouveau ref `stepMarkersRef` pour le nettoyage
- Ajouter une entrée dans la légende pour les étapes du parcours
- Les marqueurs d'étapes sont toujours visibles (pas derrière le toggle communes)

**Fichier : `src/pages/CarteParcoursEau.tsx`** — Aucune modification nécessaire.

### Design des marqueurs

- Taille 28px, cercles colorés avec bordure blanche
- Couleur progressive : bleu clair → bleu → violet → orange → vert
- Popup au clic avec titre en gras, description, et badge de durée coloré
- Les marqueurs source existants (bleu foncé 32px) restent dominants visuellement

