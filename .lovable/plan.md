

## Plan : Enrichir les données des cartes régionales sur `/carte`

### Constat
Les 6 cartes régionales affichent actuellement 4 champs basiques (qualité A-E, source d'eau, communes, alertes). L'utilisateur souhaite plus de richesse informative, comme sur la version Europe, sans modifier les fonctionnalités existantes.

### Modifications

**Fichier unique : `src/components/QualityMap.tsx`**

1. **Enrichir les données mock des régions** — Ajouter à chaque objet région :
   - `complianceRate` (%) — taux de conformité
   - `population` (millions) — population desservie
   - `waterSupplyZones` — nombre de zones d'approvisionnement
   - `mainPollutants` — tableau des polluants principaux avec `{ name, avgValue, unit, limitValue, exceedanceRate }`
   - Couvrir les **13 régions métropolitaines** (au lieu de 6)

2. **Enrichir les cartes régionales** — Dans chaque card, ajouter sous les champs existants :
   - Ligne "Taux de conformité" avec la valeur en %
   - Ligne "Population desservie" en millions
   - Ligne "Zones d'approvisionnement"
   - Section dépliable (Collapsible) "Polluants détectés" avec un mini-tableau : Polluant | Moy. | Limite | Dépassement %
   - Badge de risque coloré (Faible/Modéré/Élevé) basé sur le taux de conformité

3. **Enrichir la légende** — Ajouter sous la légende A-E existante une sous-section expliquant les 3 niveaux de risque (Faible ≥98%, Modéré 96-98%, Élevé <96%) avec pastilles colorées vert/orange/rouge.

### Ce qui ne change pas
- La carte interactive Mapbox et le toggle sources d'eau
- Le système de grades A-E
- Les liens vers /alertes
- La structure de la page Carte.tsx

### Données ajoutées (exemples)
Les 13 régions avec des ordres de grandeur réalistes basés sur les rapports ARS/Hub'Eau : Île-de-France (98.2%), Auvergne-Rhône-Alpes (99.1%), Bretagne (96.8%), Occitanie (97.5%), etc. Chaque région aura 5-7 polluants (Nitrates, Pesticides, Plomb, PFAS, THM, Chlore, Bactéries).

### Résultat
Les cartes régionales passent de 4 lignes d'info à ~8 lignes + un tableau de polluants dépliable, alignant le niveau de détail sur la version Europe tout en conservant l'UX existante.

