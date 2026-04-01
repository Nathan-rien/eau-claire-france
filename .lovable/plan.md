

## Optimiser le SEO de toutes les pages non optimisees

### Constat

**Pages sans aucun SEOHead (11 pages) :**
- `APropos.tsx`, `Contact.tsx`, `MentionsLegales.tsx`, `RGPD.tsx`, `Accessibilite.tsx`
- `OpenData.tsx`, `Sources.tsx`, `Methodologie.tsx`, `ApiPublique.tsx`
- `CartePolluants.tsx`
- `NotFound.tsx` (besoin d'un meta robots noindex)

**Pages avec SEOHead mais sans donnees structurees ni canonical :**
- Les 7 pages Europe (CarteEurope, CartePolluantsEurope, ClassementEurope, PolluantsEurope, DiagnosticEurope, AlertesEurope, PrixEauxEurope) ont title/description inline mais pas de canonical, keywords optimises, ni schema.org
- `ComparateurPrix.tsx`, `MarquePrix.tsx`, `PrixEaux.tsx` : pas de schema.org

**Sitemap incomplet :**
- Manquent : `/parcours-eau`, `/parcours-eau-bouteille`, `/prix-eaux`, `/comparateur-prix`, `/sources-eau`, `/comparatif-bouteilles` (deja present?), et toutes les pages Europe

### Plan

**1. Enrichir `seoData.ts` (~20 nouvelles entrees)**

Ajouter des blocs SEO complets (title, description, keywords, canonical, schemaData) pour :
- Pages institutionnelles : aPropos, contact, mentionsLegales, rgpd, accessibilite
- Pages data : openData, sources, methodologie, apiPublique
- Page carte polluants France
- 7 pages Europe : carteEurope, cartePolluantsEurope, classementEurope, polluantsEurope, diagnosticEurope, alertesEurope, prixEauxEurope
- Pages prix : comparateurPrix, prixEaux
- Page 404 (noindex)

Chaque entree contiendra un schema.org adapte (WebPage, FAQPage pour methodologie, DataCatalog pour openData, ContactPage pour contact, etc.)

**2. Ajouter SEOHead aux 11 pages manquantes**

Import SEOHead + seoData dans chaque fichier, ajouter le composant juste apres `<Layout>`.

**3. Ameliorer les 7 pages Europe**

Remplacer les title/description inline par des references a seoData, ajouter canonical et schema.org.

**4. Mettre a jour le sitemap**

Ajouter les ~15 URLs manquantes dans `public/sitemap.xml` :
- `/parcours-eau`, `/parcours-eau-bouteille`, `/prix-eaux`, `/comparateur-prix`, `/sources-eau`
- `/carte-europe`, `/carte-polluants-europe`, `/classement-europe`, `/polluants-europe`, `/diagnostic-europe`, `/alertes-europe`, `/prix-eaux-europe`

**5. Ajouter `robots.txt` avec reference au sitemap** (deja present mais verifier le lien sitemap)

### Fichiers modifies (~22 fichiers)
- `src/utils/seoData.ts` (ajout ~20 entrees)
- `src/pages/APropos.tsx`, `Contact.tsx`, `MentionsLegales.tsx`, `RGPD.tsx`, `Accessibilite.tsx`, `OpenData.tsx`, `Sources.tsx`, `Methodologie.tsx`, `ApiPublique.tsx`, `CartePolluants.tsx`, `NotFound.tsx` (ajout SEOHead)
- `src/pages/CarteEurope.tsx`, `CartePolluantsEurope.tsx`, `ClassementEurope.tsx`, `PolluantsEurope.tsx`, `DiagnosticEurope.tsx`, `AlertesEurope.tsx`, `PrixEauxEurope.tsx` (amelioration SEO)
- `public/sitemap.xml` (ajout URLs manquantes)
- `public/robots.txt` (verification lien sitemap)

