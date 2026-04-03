

## Carte animee du parcours de l'eau : source → commune

### Concept

Nouvelle page `/carte-parcours-eau` affichant une carte Mapbox de la France avec animation du trajet de l'eau depuis une source de captage jusqu'aux communes desservies. Un filtre par distributeur d'eau permet de visualiser les reseaux de distribution specifiques. Le lien sera ajoute dans le menu "Les cartes" de la navigation.

### Donnees disponibles

- **Sources d'eau** : `public/data/water_sources_coordinates.csv` (58 sources avec coordonnees GPS)
- **Distributeurs MDD** : `public/data/eaux_MDD_par_distributeur_et_source_FR_v3.csv` (11 distributeurs lies a des sources)
- **Villes francaises** : `src/data/frenchCities.ts` (50+ villes avec coordonnees)
- **Sources detaillees** : `src/data/waterSources.ts` (WaterSource avec composition minerale)
- **Mapbox** : token et service de securite deja configures (`MapboxSecurityService`)

### Architecture

```text
src/pages/CarteParcoursEau.tsx          ← Page avec SEO, layout, breadcrumb
src/components/WaterJourneyMap.tsx       ← Composant carte Mapbox principal
src/data/waterDistributors.ts           ← Donnees distributeurs + liaisons source→communes
```

### Fonctionnalites

1. **Carte Mapbox centree sur la France** avec le style existant
2. **Marqueurs sources** (icone montagne/goutte) aux coordonnees GPS reelles
3. **Marqueurs communes** desservies par chaque source/distributeur
4. **Animation de trajet** : ligne courbe animee (arc GeoJSON ou `line-dasharray` anime) reliant source → commune(s), avec une goutte d'eau qui se deplace le long du trajet
5. **Filtre distributeur** : dropdown/select listant les distributeurs (Carrefour, Leclerc, Auchan, Lidl, etc.) — la selection filtre les sources et communes affichees, puis lance l'animation
6. **Popup au clic** sur une source : nom, marque MDD, categorie d'eau
7. **Popup au clic** sur une commune : nom, distributeur, source d'approvisionnement

### Detail technique

**Donnees distributeurs** (`waterDistributors.ts`) :
- Parsing statique du CSV MDD pour creer un mapping `distributeur → [{source, coordonnees, communes}]`
- Association source→communes via les villes de `frenchCities.ts` (attribution regionale simplifiee puisque les donnees exactes commune→source n'existent pas — on utilisera des villes representantes par region)

**Animation Mapbox** :
- Utiliser une source GeoJSON `LineString` pour chaque trajet source→commune
- Animer avec `line-dasharray` progressif (technique Mapbox standard) pour simuler le flux d'eau
- Point anime (marker deplace via `requestAnimationFrame` le long de la ligne)
- Couleur du trajet : gradient bleu clair → bleu fonce

**Filtre** :
- Composant `Select` (shadcn) au-dessus de la carte
- Option "Tous les distributeurs" par defaut
- Au changement : filtrer les features GeoJSON, relancer l'animation

### Integration navigation

Ajouter dans `Navigation.tsx` → `mapsItems` (mode France) :
```
{ href: '/carte-parcours-eau', label: t('nav.maps.journey') }
```

Ajouter route dans `App.tsx`, cle i18n dans `translations.ts`.

### Fichiers modifies/crees

| Fichier | Action |
|---------|--------|
| `src/data/waterDistributors.ts` | Creer — donnees distributeurs + liaisons |
| `src/components/WaterJourneyMap.tsx` | Creer — carte Mapbox avec animations |
| `src/pages/CarteParcoursEau.tsx` | Creer — page avec layout/SEO |
| `src/App.tsx` | Ajouter lazy import + route |
| `src/components/Navigation.tsx` | Ajouter lien dans mapsItems |
| `src/i18n/translations.ts` | Ajouter cles nav + page |

