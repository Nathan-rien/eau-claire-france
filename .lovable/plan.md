

## Enrichissement massif des communes satellites — analyse des limites

### État actuel
- **35 routes**, **244 communes satellites** (moy. 7/route)
- Fichier : **42 Ko / 833 lignes** — relativement léger

### Limites techniques

Le fichier TypeScript est compilé côté client. La contrainte principale est la **taille du bundle** et la **performance de rendu Mapbox** (nombre d'arcs animés en mode détail).

- **Taille fichier** : on peut aller jusqu'à ~150-200 Ko sans impact notable sur le chargement (~3-5x la taille actuelle)
- **Rendu Mapbox** : en mode détail, on affiche les arcs d'une seule route → même avec 30 communes par métropole, ça reste ~30 arcs animés, très gérable
- **Limite pratique réaliste** : **~600-800 communes satellites** (moy. 15-20 par route)

### Plan d'enrichissement : passer de 244 à ~600 communes

**`src/data/tapWaterSources.ts`** — seul fichier modifié

Cibles par catégorie :

| Catégorie | Routes | Cible/route | Total ajouté |
|-----------|--------|-------------|-------------|
| Grandes métropoles (Paris, Lyon, Marseille, Lille, Toulouse, Bordeaux) | 7 | 20-25 | ~140 |
| Métropoles régionales (Nantes, Strasbourg, Nice, Rennes, Montpellier, Grenoble, Rouen, Toulon) | 8 | 12-15 | ~100 |
| Villes moyennes (les 20 restantes) | 20 | 8-10 | ~120 |

Soit un passage de **244 → ~600 communes**, couvrant la quasi-totalité des intercommunalités françaises majeures.

Exemples d'ajouts :
- **Paris** : Suresnes, Puteaux, Levallois, Gennevilliers, Malakoff, Issy, Clamart, Meudon, Châtillon, Le Kremlin-Bicêtre, Gentilly, Cachan, Arcueil...
- **Lyon** : Champagne-au-Mont-d'Or, Pierre-Bénite, Francheville, La Mulatière, Saint-Fons, Corbas, Mions, Feyzin, Givors, Grigny...
- **Marseille** : Aubagne, La Ciotat, Gardanne, Septèmes, Les Pennes-Mirabeau, Gémenos, Roquevaire, Carnoux...

### Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/data/tapWaterSources.ts` | Enrichir communes[] de 244 → ~600 entrées |

