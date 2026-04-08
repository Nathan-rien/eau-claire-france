

## Plan : Toggle des étapes industrielles sur la carte avec positions réelles

### Concept

Ajouter un bouton toggle "Étapes industrielles" dans les contrôles de la carte. Quand activé, il affiche pour chaque source les 5 marqueurs d'étapes (Analyse, Traitement, Embouteillage, Stockage, Plateforme logistique) à leurs positions réelles en France.

**Réalité géographique** : pour les eaux minérales naturelles, la réglementation impose l'embouteillage à la source. Les étapes Analyse/Traitement/Embouteillage/Stockage sont donc proches de la source (souvent sur le même site industriel). Seule la plateforme logistique est géographiquement distincte (entrepôt régional du distributeur).

### Modifications

**1. `src/data/waterDistributors.ts` — Ajouter les coordonnées des sites industriels**

Ajouter une structure `INDUSTRIAL_SITES` indexée par source, contenant pour chaque source les coordonnées réelles ou estimées des 5 étapes :
- **Analyse** : laboratoire sur site ou laboratoire agréé le plus proche (ex: Laboratoire départemental)
- **Traitement/Filtration** : usine de traitement, généralement sur site source
- **Embouteillage** : usine d'embouteillage (toujours à la source pour EMN)
- **Stockage** : entrepôt/plateforme de palettisation (sur site ou zone industrielle voisine)
- **Plateforme logistique** : entrepôt régional du distributeur (position distincte, ex: plateforme Leclerc de Clermont pour Laqueuille)

Environ 15-20 sources × 5 étapes = ~75-100 points avec coordonnées GPS réalistes basées sur les localisations connues des usines d'embouteillage et plateformes logistiques des distributeurs.

**2. `src/data/waterDistributors.ts` — Exporter une fonction `getIndustrialSteps()`**

```ts
interface IndustrialStep {
  type: 'analyse' | 'traitement' | 'embouteillage' | 'stockage' | 'logistique';
  name: string;
  coordinates: [number, number];
  description: string;
}

function getIndustrialSteps(sourceName: string, retailer?: string): IndustrialStep[]
```

**3. `src/components/WaterJourneyMap.tsx` — Ajouter le toggle et le rendu des marqueurs**

- Nouveau state `showIndustrial` + toggle Switch dans la barre de contrôles (à côté du toggle Communes)
- Quand activé : pour chaque source visible, placer les 5 marqueurs industriels avec les icônes correspondantes (FlaskConical, Filter, Package, Warehouse, Truck) et les couleurs de la timeline
- Les marqueurs sont des cercles colorés (pas carrés) avec l'icône SVG, plus petits que les sources (w-6 h-6)
- Au clic sur un marqueur industriel : popup avec nom du site, description, et lien vers la source associée
- Des lignes fines relient source → analyse → traitement → embouteillage → stockage → plateforme logistique pour visualiser le parcours réel
- Ajouter l'entrée dans la légende

**4. Interaction avec la timeline**

Quand l'utilisateur survole une étape de la timeline ET que le toggle industriel est actif :
- Mettre en surbrillance tous les marqueurs de ce type sur la carte (ex: tous les sites d'embouteillage)
- Atténuer les autres marqueurs industriels

### Fichiers modifiés
- `src/data/waterDistributors.ts` — données des sites industriels + export
- `src/components/WaterJourneyMap.tsx` — toggle, marqueurs, lignes de liaison, interaction timeline

### Résultat attendu
- Toggle désactivé par défaut → carte épurée (sources + communes)
- Toggle activé → apparition des étapes industrielles avec positions réalistes, reliées entre elles, et synchronisées avec la timeline

