

## Étendre la traduction anglaise à l'ensemble du site

### Constat

Le système de traduction (`LanguageContext`) existe mais ne couvre qu'une fraction du contenu :
- **7 fichiers** utilisent `useLanguage` (Header, Index, Carte, Diagnostic, ComparatifBouteilles, QuelleEauBoire, Navigation ne l'utilise même pas)
- Le **Header** lui-même a des labels hardcodés en français ("Les cartes", labels de navigation, menu mobile)
- Le **Footer** est entièrement en français
- **~30 pages** n'utilisent aucune traduction (APropos, Contact, Polluants, Alertes, Classement, ParcoursEau, MentionsLegales, RGPD, etc.)
- Les **composants partagés** (SearchBar, PollutantIndex, NavigationCTA, etc.) sont en français

### Plan d'implémentation

Vu l'ampleur, je propose une approche par vagues prioritaires :

**Vague 1 — Navigation & Structure (Header, Footer, Navigation)**
- Ajouter les clés de traduction pour le Header : "Les cartes", labels des maps, labels de navigation, "Menu", "Navigation"
- Traduire le Footer : titres de sections, description, copyright
- Faire que `Navigation.tsx` utilise `useLanguage`

**Vague 2 — Pages principales (les plus visitées)**
- `Polluants.tsx` : titre, description
- `Alertes.tsx` : titre, contenus
- `Classement.tsx` : titre, contenus
- `ParcoursEau.tsx` / `ParcoursEauBouteille.tsx` : titres, étapes
- `PrixEaux.tsx` : titre, contenus

**Vague 3 — Pages secondaires**
- `APropos.tsx` : mission, histoire, valeurs, timeline, impact
- `Contact.tsx` : formulaire, labels
- `MentionsLegales.tsx`, `RGPD.tsx`, `Accessibilite.tsx`
- `Methodologie.tsx`, `Sources.tsx`, `OpenData.tsx`, `ApiPublique.tsx`

**Vague 4 — Composants partagés**
- `SearchBar`, `NavigationCTA`, `PollutantIndex`, `WaterQualityCard`, `StatisticsOverview`, `DataBanner`, etc.

### Mise en oeuvre technique

1. **Enrichir `LanguageContext.tsx`** avec ~200-300 nouvelles clés (fr + en)
2. **Importer `useLanguage`** dans chaque page/composant concerné
3. **Remplacer les textes hardcodés** par des appels `t('clé')`

### Volume estimé

- ~40 fichiers à modifier
- ~300 clés de traduction à ajouter
- Je recommande de commencer par la **Vague 1** (navigation globale visible sur toutes les pages) puis enchaîner les vagues suivantes.

Souhaitez-vous que je procède vague par vague, ou tout d'un coup ?

