

## Internationaliser les 25 pages publiques restantes

### Etat des lieux

**9 pages** utilisent deja `useLanguage` : Index, Carte, Diagnostic, Classement, Polluants, Alertes, QuelleEauBoire, ComparatifBouteilles, ParcoursEauBouteille.

**25 pages publiques** ont du texte francais en dur :

| Groupe | Pages | Lignes totales |
|--------|-------|----------------|
| Info/Legal | APropos (217), Contact (280), MentionsLegales (213), RGPD (259), Accessibilite (265), Methodologie (269) | ~1 503 |
| Data/API | Sources (244), OpenData (356), ApiPublique (284) | ~884 |
| France | ParcoursEau (1 101), PrixEaux (707), CartePolluants (61), SourcesEau (175), ComparateurPrix (578), DiagnosticPrix (181), MarquePrix (287) | ~3 090 |
| Europe | CarteEurope (296), CartePolluantsEurope (67), ClassementEurope (309), DiagnosticEurope (204), CompositionEurope (341), PolluantsEurope (193), AlertesEurope (169), PrixEauxEurope (133) | ~1 712 |
| Autre | NotFound (33) | 33 |

**Certaines cles existent deja** dans `translations.ts` (about.\*, contact.\*, journey.\*, prices.\*) mais ne sont pas utilisees dans les pages correspondantes.

### Approche

Travail en **5 lots** pour garder chaque modification lisible :

**Lot 1 — Pages avec cles existantes** (APropos, Contact, ParcoursEau, PrixEaux)
- Importer `useLanguage`, remplacer les chaines en dur par `t('about.*')`, `t('contact.*')`, `t('journey.*')`, `t('prices.*')`
- Ajouter les cles manquantes dans `translations.ts` (fr + en)

**Lot 2 — Pages legales/info** (MentionsLegales, RGPD, Accessibilite, Methodologie, Sources, OpenData, ApiPublique, NotFound)
- Creer les cles : `legal.*`, `rgpd.*`, `accessibility.*`, `methodology.*`, `sources.*`, `opendata.*`, `api.*`, `notfound.*`
- Wirer chaque page avec `useLanguage`

**Lot 3 — Pages France restantes** (CartePolluants, SourcesEau, ComparateurPrix, DiagnosticPrix, MarquePrix)
- Creer les cles : `pollutantMap.*`, `waterSources.*`, `priceComparator.*`, `priceDiag.*`, `brandPrice.*`
- Wirer chaque page

**Lot 4 — Pages Europe** (CarteEurope, CartePolluantsEurope, ClassementEurope, DiagnosticEurope, CompositionEurope, PolluantsEurope, AlertesEurope, PrixEauxEurope)
- Creer les cles : `europeMap.*`, `europePollutantMap.*`, `europeRanking.*`, `europeDiag.*`, `europeComposition.*`, `europePollutants.*`, `europeAlerts.*`, `europePrices.*`
- Wirer chaque page

**Lot 5 — Composants partages utilises par ces pages**
- Verifier que les composants imbriques (PollutantMap, WaterSourcesMap, etc.) utilisent aussi `t()` si ils contiennent du texte en dur

### Fichiers modifies

1. **`src/i18n/translations.ts`** — Ajouter ~300-400 nouvelles cles (fr + en) pour toutes les pages
2. **25 fichiers `src/pages/*.tsx`** — Importer `useLanguage`, remplacer chaque chaine francaise par `t('key')`
3. **Composants concernes** — Verifier et adapter si texte en dur

### Pages admin exclues

Les pages Admin, AdminQuality, AdminSetup, Auth, Dashboard, Login, SecurityDashboard et \_\_price-probe ne sont pas internationalisees (usage interne uniquement).

