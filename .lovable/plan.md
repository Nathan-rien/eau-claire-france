

## Recherche des API europeennes et plan d'implementation

### Erreur de build a corriger d'abord

Les fichiers de test `src/lib/__tests__/*.test.ts` sont inclus dans `tsconfig.app.json` (via `"include": ["src"]`) mais les types Jest ne sont pas reconnus par le compilateur Vite. Il faut exclure ces fichiers du build applicatif.

---

### API europeennes disponibles et pertinentes

Voici le resultat de ma recherche, classe par fonctionnalite existante du site :

#### 1. Qualite de l'eau potable (equivalent de Hub'Eau)

| Source | Couverture | Format | Acces | Pertinence |
|--------|-----------|--------|-------|------------|
| **EEA Waterbase - WISE DWD** (Drinking Water Directive) | 27 pays EU | CSV bulk download | Gratuit, pas de REST API temps reel | Donnees de conformite par pays, nitrates, pesticides, bacteries. Mises a jour annuelles. |
| **EEA Waterbase - Water Quality ICM** | 27 pays EU + | CSV/SQLite bulk | Gratuit | Qualite des eaux de surface (rivieres, lacs). Pas eau potable directement. |
| **UK Environment Agency - Water Quality API** | Angleterre | REST JSON | Gratuit, temps reel | `environment.data.gov.uk/water-quality` - Equivalent Hub'Eau pour l'Angleterre |
| **Germany - Wasser-DE / WasserBLIcK** | Allemagne | REST API | Gratuit | `wasserblick.net` - Donnees federales sur la qualite de l'eau |
| **Netherlands - Digitale Delta API** | Pays-Bas | REST API | Gratuit | `ihw.nl` - Donnees de qualite de l'eau normalisees |
| **EEA Bathing Water Quality** | 27 pays EU | JSON/Map viewer | Gratuit | ~22 000 sites de baignade, qualite E. coli / enterococci |

#### 2. Carte des eaux (equivalent de /carte)

| Source | Couverture | Usage |
|--------|-----------|-------|
| **EEA WISE Spatial Data** (WFD) | EU 27 | Contours des masses d'eau, stations de mesure georeferencees |
| **EEA Bathing Water Map Viewer** | EU 27 | Points de baignade avec coordonnees GPS |

#### 3. Polluants / Alertes (equivalent de /alertes, /polluants)

| Source | Couverture | Usage |
|--------|-----------|-------|
| **WISE DWD - QualityInformation (DWD_QI)** | EU 27 | Depassements de seuils par parametre et par pays |
| **EEA Waterbase ICM - Hazardous substances** | EU 27 | Substances dangereuses dans les eaux de surface |

#### 4. Eaux en bouteille / Composition minerale

**Aucune API europeenne centralisee n'existe.** Chaque pays a ses propres bases. Il faudrait constituer un CSV europeen manuellement a partir de sources nationales.

---

### Limites importantes

- **Pas d'API REST temps reel pan-europeenne** : contrairement a Hub'Eau (France), l'EEA fournit des **datasets bulk en CSV/SQLite**, mis a jour annuellement. Il n'y a pas d'equivalent `?code_commune=XXX` a l'echelle EU.
- **Granularite variable** : la France offre des donnees a la commune. L'EEA fournit des donnees a la "Water Supply Zone" ou au pays.
- **Seuls quelques pays** (UK, Allemagne, Pays-Bas) ont des API REST nationales exploitables en temps reel.

---

### Plan d'implementation propose

#### Phase 1 : Infrastructure et correctif build

1. **Corriger l'erreur de build** : exclure `__tests__` du `tsconfig.app.json`
2. **Ajouter un scope switcher France/Europe** dans le `LanguageContext` ou un nouveau `RegionContext`
3. **Creer un service `europeWaterApi.ts`** qui interroge les datasets EEA

#### Phase 2 : Donnees EU statiques (via CSV pre-traites)

Puisque l'EEA ne fournit pas de REST API, la strategie est :
- Telecharger les datasets WISE DWD (CSV) et les stocker dans `public/data/eu/`
- Creer une Edge Function qui sert les donnees filtrees par pays
- Alimenter les pages existantes avec un switch France/Europe

#### Phase 3 : Pages europeennes

- **Carte EU** : carte Mapbox avec les 27 pays, coloree par score de conformite national
- **Diagnostic EU** : selection par pays > donnees nationales aggregees
- **Polluants EU** : top polluants par pays (nitrates, pesticides, plomb)
- **Alertes EU** : depassements de seuils par pays (donnees WISE DWD_QI)
- **Classement EU** : classement des pays par qualite de l'eau potable

#### Phase 4 : API nationales specifiques (optionnel)

Pour les pays avec des API REST (UK, DE, NL), ajouter des services dedies permettant une granularite ville/region similaire a la France.

---

### Fichiers concernes

```text
tsconfig.app.json                          -- exclure __tests__
src/contexts/RegionContext.tsx              -- nouveau contexte France/Europe
src/services/europeWaterApi.ts             -- service API EEA
src/components/RegionSwitcher.tsx          -- composant switch FR/EU
src/pages/CarteEurope.tsx                  -- carte europeenne
public/data/eu/wise_dwd_quality.csv        -- donnees EEA pre-traitees
src/contexts/LanguageContext.tsx           -- traductions EU ajoutees
src/components/Navigation.tsx              -- liens Europe ajoutes
```

### Recommandation

Je suggere de commencer par la **Phase 1** (fix build + RegionContext) puis la **Phase 2** (donnees EU statiques). Voulez-vous que je procede par etapes, ou souhaitez-vous prioriser certaines fonctionnalites ?

