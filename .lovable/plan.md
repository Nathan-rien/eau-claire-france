

## Corriger les textes francais restants dans toutes les pages i18n

### Probleme

Les pages utilisent bien `useLanguage` et `t()` pour les titres et sections, mais de nombreux **contenus inline** (tableaux de donnees, listes, badges, libelles de formulaire) restent en francais en dur. Resultat : en mode anglais, on voit un melange anglais/francais.

### Pages et zones concernees

| Page | Textes en dur restants |
|------|----------------------|
| **Sources.tsx** | 9 dataSources (name, description, type, frequency, coverage), 4 qualityStandards (organism, role, reference), 6 items dans les listes "temps reel" et "periodique" |
| **OpenData.tsx** | 6 datasets (name, description), 5 apiEndpoints (description), "Chargement...", "Erreur:", 4 principes Open Data, section communaute (8 items), 3 boutons docs, contact labels |
| **ApiPublique.tsx** | 7 endpoints (description, parameter descriptions), 3 badges ("Gratuit", "Aucun cout", etc.), section limites techniques (7 items), conditions d'utilisation (4 items) |
| **Methodologie.tsx** | 4 etapes methodology (title, description, 16 details), 3 qualityIndicators (name, description, calculation, threshold), 4 principes (titres+desc), section EU (8 items), 4 limitations |
| **RGPD.tsx** | Labels "Nom:", "Contact:", "Adresse:", retention periods (2 items), 8 security measures, labels "Email:", "Objet:" |
| **Accessibilite.tsx** | 16 items dans 4 cartes accessibilite (visual, keyboard, cognitive, auditory), 6 raccourcis clavier, "Janvier 2024", labels "Email:", "Objet:" |
| **MentionsLegales.tsx** | Labels "Email:", "LinkedIn:" |
| **Contact.tsx** | Email body labels "Nom:", "Sujet:", "Envoye depuis" |

### Plan d'implementation

**Etape 1 — Ajouter ~200 nouvelles cles dans `translations.ts`**

Organiser par namespace existant :
- `sources.src.*` (9 sources x 5 champs + 4 standards x 3 champs + 6 items listes)
- `opendata.ds.*` (6 datasets x 2 champs + 5 api desc + principes + communaute + docs)
- `api.ep.*` (7 endpoints + params + limites + conditions)
- `methodology.step.*`, `methodology.ind.*`, `methodology.principle.*`, `methodology.limit.*`, `methodology.eu.*`
- `rgpd.label.*`, `rgpd.retention.*`, `rgpd.security.*`
- `a11y.item.*`, `a11y.shortcut.*`

**Etape 2 — Mettre a jour les 8 pages**

Remplacer chaque chaine en dur par `t('key')` dans les tableaux et listes inline des fichiers :
- `Sources.tsx` — dataSources et qualityStandards comme tableaux dynamiques via `t()`
- `OpenData.tsx` — datasets, apiEndpoints, principes, communaute, docs
- `ApiPublique.tsx` — endpoints, badges, limites
- `Methodologie.tsx` — methodology, qualityIndicators, principes, EU, limitations
- `RGPD.tsx` — labels, retention, security measures
- `Accessibilite.tsx` — items listes, raccourcis, date
- `MentionsLegales.tsx` — labels contact
- `Contact.tsx` — email body template

### Fichiers modifies

1. **`src/i18n/translations.ts`** — ~200 nouvelles cles fr + en
2. **8 fichiers pages** — Sources, OpenData, ApiPublique, Methodologie, RGPD, Accessibilite, MentionsLegales, Contact

