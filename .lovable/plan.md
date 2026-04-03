

## Enrichir massivement les communes satellites du parcours eau du robinet

### Etat actuel

- 35 routes couvrant 35 villes principales
- ~85 communes satellites au total (moyenne ~2.5 par route)
- Certaines grandes agglos n'ont que 2-3 communes alors que leur intercommunalité en dessert 20+

### Objectif

Porter à **~300 communes satellites** en enrichissant chaque route existante avec davantage de communes de l'agglomération/intercommunalité. Cible : 8-12 communes par grande métropole, 5-8 pour les villes moyennes.

### Modifications

**`src/data/tapWaterSources.ts`** — Seul fichier modifié

Enrichir le champ `communes` de chaque route :

- **Paris** : passer de 5 à ~15 (ajouter Argenteuil, Colombes, Courbevoie, Vitry, Ivry, Aubervilliers, Pantin, Asnières, Rueil-Malmaison, Clichy...)
- **Paris Est** : passer de 2 à ~8 (Fontenay, Le Perreux, Champigny, Saint-Maur, Charenton...)
- **Lyon** : passer de 4 à ~12 (Bron, Écully, Oullins, Meyzieu, Rillieux, Décines, Saint-Priest, Tassin...)
- **Marseille** : passer de 3 à ~10 (Aix-en-Provence, Vitrolles, Salon, Istres, Cassis, Allauch, Plan-de-Cuques...)
- **Bordeaux** : enrichir à ~10 (Mérignac, Pessac, Talence, Bègles, Villenave, Cenon, Lormont, Le Bouscat, Bruges...)
- **Lille** : enrichir à ~10 (Roubaix, Tourcoing, Villeneuve-d'Ascq, Wattrelos, Marcq-en-Barœul, Lambersart, Croix, Hem...)
- **Toulouse** : enrichir à ~10 (Colomiers, Tournefeuille, Blagnac, Balma, L'Union, Ramonville, Cugnaux, Muret...)
- **Nantes** : enrichir à ~8 (Saint-Herblain, Rezé, Orvault, Vertou, Carquefou, Couëron, Bouguenais...)
- **Strasbourg** : enrichir à ~8 (Illkirch, Schiltigheim, Lingolsheim, Bischheim, Hoenheim, Ostwald...)
- **Nice** : enrichir à ~8 (Antibes, Cagnes, Saint-Laurent-du-Var, Vence, Villeneuve-Loubet, La Trinité...)
- **Rennes, Montpellier, Grenoble, Dijon, Clermont-Ferrand** : enrichir à ~6-8 chacune
- **Villes moyennes** (Rouen, Caen, Le Havre, Tours, etc.) : enrichir à ~5-6 chacune

Aucun changement de structure ni de composant — uniquement de la donnée ajoutée dans les tableaux `communes` existants.

### Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/data/tapWaterSources.ts` | Enrichir les `communes[]` de chaque route (~85 → ~300 communes satellites) |

