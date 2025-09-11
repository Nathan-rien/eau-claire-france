# Phase 2 - Checklist de Validation

## ✅ Commandes prêtes

### Smoke test standard (3 enseignes)
```bash
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1
```

### Test élargi (6 enseignes)  
```bash
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2
```

### Test debug
```bash
pnpm scrape --retailers carrefour --brands evian --formats "1 l" --maxPages 1 --headful
```

### Test simulation
```bash
pnpm scrape --retailers carrefour,auchan --brands evian --formats "1,5 l" --maxPages 1 --dry-run
```

## 🔍 Tests de validation manuelle

### 1. Smoke test (résultats attendus)

**Commande :**
```bash
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1
```

**Vérifications :**
- [ ] `/admin/runs` → 3 runs créés avec status "success" 
- [ ] `error_rate < 0.3` pour chaque run
- [ ] `items_saved > 0` pour chaque run
- [ ] `quality_score > 0.7` pour chaque run
- [ ] `/admin/quality` → anomalies listées si présentes
- [ ] `/prix-eaux` → données visibles, tri par €/L croissant
- [ ] `exports/prices_latest.csv` → fichier présent, lisible, décimales "."

### 2. Test élargi (résultats attendus)

**Commande :**
```bash
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix --brands evian,cristaline,volvic --formats "50 cl,1 l,1,5 l" --maxPages 2
```

**Vérifications :**
- [ ] 6 runs success dans `/admin/runs`
- [ ] `/marque/evian` → données timeseries 7/30 jours fonctionnelles
- [ ] Sélecteur de période fonctionne (7j/30j)
- [ ] `exports/prices_history_YYYYMMDD.csv` → généré automatiquement
- [ ] `/comparateur-prix` → mode "2 marques" et "2 enseignes" fonctionnels

### 3. Tests UX publique

#### `/prix-eaux`
- [ ] Filtres persistants via URL (`?retailers=...&brands=...`)
- [ ] Filtre enseigne (multi-sélection)
- [ ] Filtre marque (multi-sélection)  
- [ ] Filtre format (50cl/1L/1,5L/Autre)
- [ ] Filtre pack (6/8/12/Autre)
- [ ] Filtre disponibilité (Tous/En stock)
- [ ] Recherche texte libre
- [ ] Tri serveur : €/L croissant puis date décroissant
- [ ] Pagination 50 éléments par page
- [ ] Badge "PROMO" si `is_promo=true`
- [ ] Colonne "Maj" format JJ/MM HH:MM

#### `/marque/evian`
- [ ] API `/api/brand/evian/timeseries?days=30` appelée
- [ ] Tableau prix récents par enseigne
- [ ] Sélecteur période (7/30 jours) 
- [ ] Mini-graph ou fallback liste compacte
- [ ] Données de composition (placeholder)

#### `/comparateur-prix`
- [ ] Mode A "2 marques" fonctionnel
- [ ] Mode B "2 enseignes" fonctionnel  
- [ ] Affichage min/médian/max €/L
- [ ] Nombre de produits pris en compte
- [ ] Loading states
- [ ] Empty states (aucune donnée)
- [ ] Empêche comparaison champs vides (toast d'erreur)

### 4. Tests admin

#### `/admin/runs`
- [ ] Liste des runs avec statuts temps réel
- [ ] Colonnes : enseigne, status, items_found, items_saved, error_rate, quality_score
- [ ] Actions "Relancer run", "Pause enseigne", "Reprendre enseigne"
- [ ] Badge de qualité selon quality_score

#### `/admin/quality`  
- [ ] Récap : outliers_count, unknown_brands_count, quality_score moyen
- [ ] Table anomalies : enseigne, marque, produit, €/L, format, raison
- [ ] Actions : Export CSV anomalies, liens vers source
- [ ] Types d'anomalies : Prix outlier, Marque inconnue, Format atypique

### 5. Tests exports CSV

#### Automatiques (après run success)
- [ ] `exports/prices_latest.csv` généré
- [ ] `exports/prices_history_YYYYMMDD.csv` généré
- [ ] En-têtes stricts respectés
- [ ] Encodage UTF-8 avec BOM
- [ ] Séparateur "," et décimales "."

#### Manuels (via admin)  
- [ ] Export latest prices depuis `/admin/runs`
- [ ] Export historical data avec filtres date
- [ ] Export stats enseignes
- [ ] Export anomalies depuis `/admin/quality`

### 6. Tests cron et pause

#### Test pause enseigne
```sql
UPDATE retailers SET status = 'paused' WHERE slug = 'carrefour';
```
- [ ] Le prochain cron ignore l'enseigne pause
- [ ] Log indique "skipped - paused status"
- [ ] Interface `/admin/runs` montre status "paused"

#### Test beta enseigne
```sql  
UPDATE retailers SET status = 'beta' WHERE slug = 'lidl';
```
- [ ] Cron automatique ignore les enseignes beta
- [ ] Test manuel fonctionne : `pnpm scrape --retailers lidl --brands evian --formats "1 l" --maxPages 1`

### 7. Tests qualité et métriques

#### Calcul quality_score
- [ ] Base 1.0
- [ ] -0.2 si outliers_count > 5  
- [ ] -0.2 si unknown_brands_count > 3
- [ ] Minimum 0.4
- [ ] Affiché dans `/admin/runs` et `/admin/quality`

#### Détection anomalies
- [ ] Prix outliers : < 0.05€/L ou > 5.00€/L
- [ ] Formats atypiques : pack_count > 24 ou unit_volume_l > 3L
- [ ] Marques inconnues : brand = "Inconnu"

## 🧪 Tests E2E avec fixtures

#### Test fixtures (sans réseau)
```bash
npm test src/lib/__tests__/e2e.test.ts
```
- [ ] Carrefour fixture → 3 produits extraits
- [ ] Auchan fixture → 3 produits extraits  
- [ ] Leclerc fixture → 3 produits extraits
- [ ] Normalisation → prix/volumes/marques détectés
- [ ] Qualité → outliers/inconnues détectés

#### Test normalize étendu
```bash
npm test src/lib/__tests__/normalize.test.ts  
```
- [ ] parseFormat: "2x6x50cl", "6×1 l + 2 offertes", "lot promo"
- [ ] parsePrice: prix barrés, €, espaces insécables
- [ ] guessBrand: Hépar/Hepar, Saint-Amand/St Amand, Quézac/Quezac

## 📋 Critères de succès final

### CLI harmonisé
- [ ] Flags anglais uniquement : `--retailers`, `--brands`, `--formats`, `--maxPages`, `--headful`, `--dry-run`, `--smoke`, `--since`
- [ ] Documentation README mise à jour
- [ ] Exemples cohérents partout

### UX finalisée  
- [ ] Filtres persistants + UX intuitive
- [ ] Loading states et empty states
- [ ] Timeseries fonctionnelles
- [ ] Comparateur robuste

### Exports automatiques
- [ ] CSV générés après chaque run success
- [ ] Formats stricts respectés
- [ ] Pas d'erreur d'encodage

### Qualité et monitoring
- [ ] Page `/admin/quality` complète
- [ ] Métriques qualité dans les runs
- [ ] Détection anomalies fiable

### Tests et fixtures
- [ ] E2E sans réseau opérationnels  
- [ ] Tests unitaires étendus
- [ ] Fixtures HTML représentatives

---

**✅ Phase 2 validée quand tous les points ci-dessus sont cochés**