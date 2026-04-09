

## Plan : Mettre à jour les zones de sources d'eau sur la carte

### Problème

Les 6 zones actuelles (`waterSourceZones`) datent de l'époque où la carte ne comptait que 10 villes. Plusieurs villes ajoutées (Brest, Rennes, Rouen, Pau, Ajaccio, Limoges, Clermont-Ferrand...) tombent en dehors de toute zone. Les types de sources ne correspondent plus non plus (ex: "Sources volcaniques", "Barrages", "Sources pyrénéennes" n'ont aucune zone).

### Zones actuelles (6)
- Seine et Marne — couvre Paris/Orléans
- Sources montagne — couvre Lyon/Grenoble/Dijon
- Nappes phréatiques — couvre Bordeaux/Nantes/Angers
- Eaux souterraines — couvre Toulouse/Montpellier/Pau
- Nappes de craie — couvre Lille/Amiens/Reims
- Eaux de surface — couvre Strasbourg/Metz

### Nouvelles zones (11)
Remplacer les 6 zones par 11 zones plus précises et géographiquement correctes :

1. **Bassin parisien** (bleu) — Paris, Orléans, Rouen — eaux de surface + nappes calcaires
2. **Nappe rhénane** (vert) — Strasbourg, Metz — nappe phréatique rhénane
3. **Alpes & vallée du Rhône** (émeraude) — Lyon, Grenoble — nappes alluviales glaciaires
4. **Massif Central volcanique** (violet) — Clermont-Ferrand, Limoges — sources volcaniques et barrages
5. **Nappes de craie Nord** (cyan) — Lille, Amiens, Reims — nappes de craie
6. **Bretagne** (rose) — Rennes, Brest — eaux de surface, retenues
7. **Val de Loire** (ambre) — Nantes, Angers — Loire + nappes alluviales
8. **Aquitaine** (indigo) — Bordeaux, Pau — nappes profondes + sources pyrénéennes
9. **Garonne & Méditerranée Ouest** (mauve) — Toulouse, Montpellier — eaux souterraines
10. **Provence & Alpes du Sud** (bleu ciel) — Marseille, Nice, Toulon — Durance, sources karstiques
11. **Corse** (vert foncé) — Ajaccio — sources montagneuses

Chaque zone aura des coordonnées polygonales ajustées pour englober les villes concernées, avec un nom descriptif du type de captage.

Ajout de Dijon dans la zone Bourgogne (rattaché à Alpes/Rhône ou zone propre selon proximité).

### Fichier modifié
- `src/components/InteractiveMap.tsx` — remplacement du tableau `waterSourceZones`

### Ce qui ne change pas
Villes, popups, légende, logique d'affichage des zones — seules les données de `waterSourceZones` changent.

