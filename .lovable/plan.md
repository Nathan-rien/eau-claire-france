

## Deux cartes distinctes : eau en bouteille vs eau du robinet

### Constat

La carte actuelle `/carte-parcours-eau` montre le trajet **source → magasin** pour les eaux MDD (Leclerc, Carrefour, etc.). C'est bien un parcours d'eau **en bouteille**, pas d'eau du robinet. Il faut donc :

1. **Renommer/clarifier** la carte existante comme "Parcours de l'eau en bouteille"
2. **Creer** une nouvelle carte dediee au parcours de l'eau du robinet

### Carte existante — Eau en bouteille (clarification)

- Renommer le titre, les labels nav, le SEO pour expliciter "eau en bouteille"
- Route inchangee : `/carte-parcours-eau` (ou renommer `/carte-parcours-bouteille`)
- Icones et legende : source → usine d'embouteillage → magasin

### Nouvelle carte — Eau du robinet

**Route** : `/carte-parcours-robinet`

**Concept** : Visualiser le trajet de l'eau potable en France — captage (nappes, rivieres) → station de traitement → chateau d'eau/reservoir → reseau de distribution → robinet de la commune.

**Donnees** : Creer `src/data/tapWaterSources.ts` avec les principales sources d'eau potable par grande agglomeration francaise :
- Paris : eau de Seine + Marne (usines de Joinville, Orly, Ivry)
- Lyon : nappes alluviales du Rhone
- Marseille : Canal de Marseille (Durance/Verdon)
- Bordeaux : nappes profondes de l'Oligocene
- Lille : nappes de la craie
- Etc. (~15-20 agglomerations)

**Filtre** : Par type de source (nappe souterraine, riviere/fleuve, lac/retenue) ou par region

**Animation** : Meme style d'arcs animes que la carte bouteille, avec des etapes intermediaires (station de traitement marquee par une icone usine)

**Composants** :
- `src/pages/CarteParcoursRobinet.tsx` — page avec SEO/layout
- `src/components/TapWaterJourneyMap.tsx` — carte Mapbox
- `src/data/tapWaterSources.ts` — donnees captage → commune

### Navigation

Dans `mapsItems` (mode France), ajouter :
```
{ href: '/carte-parcours-robinet', label: t('nav.maps.tapJourney') }
```

Et renommer l'existant :
```
{ href: '/carte-parcours-eau', label: t('nav.maps.bottleJourney') }
```

### Fichiers

| Fichier | Action |
|---------|--------|
| `src/data/tapWaterSources.ts` | Creer — donnees captage eau potable par agglomeration |
| `src/components/TapWaterJourneyMap.tsx` | Creer — carte Mapbox animee robinet |
| `src/pages/CarteParcoursRobinet.tsx` | Creer — page avec SEO |
| `src/App.tsx` | Ajouter route `/carte-parcours-robinet` |
| `src/components/Navigation.tsx` | Renommer label existant + ajouter nouveau lien |
| `src/i18n/translations.ts` | Ajouter cles `tapJourney.*` + renommer `waterJourney` → `bottleJourney` |
| `src/pages/CarteParcoursEau.tsx` | Mettre a jour titre/SEO pour clarifier "eau en bouteille" |
| `src/components/WaterJourneyMap.tsx` | Ajuster legende (source → magasin, pas robinet) |

