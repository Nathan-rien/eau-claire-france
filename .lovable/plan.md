

## Plan : Agrandir la hauteur de la carte sur /carte

### Problème
La carte Mapbox dans `InteractiveMap.tsx` utilise la classe Tailwind `h-96` (384px), ce qui est trop petit sur desktop. Le `MapLoader` dans `QualityMap.tsx` utilise `minHeight="60vh"` mais la carte interne reste limitée à 384px.

### Modification

**Fichier : `src/components/InteractiveMap.tsx` — ligne 274**

Remplacer `h-96` par `h-[70vh]` pour que la carte occupe 70% de la hauteur de l'écran, avec un minimum raisonnable sur mobile.

```
// Avant
<div ref={mapContainer} className="h-96 w-full rounded-lg" />

// Après
<div ref={mapContainer} className="h-[50vh] md:h-[70vh] w-full rounded-lg" />
```

**Fichier : `src/components/QualityMap.tsx` — ligne 320**

Aligner le `minHeight` du `MapLoader` sur la même valeur :

```
// Avant
<MapLoader loadOnInteraction={true} minHeight="60vh">

// Après
<MapLoader loadOnInteraction={true} minHeight="70vh">
```

### Résultat
- Mobile : carte à 50vh (~moitié de l'écran)
- Desktop : carte à 70vh (~deux tiers de l'écran, ~850px sur 1213px)

