

## Infographie interactive : Le parcours de l'eau du captage au robinet

### Concept

Page single-scroll avec des sections verticales representant chaque etape du parcours de l'eau. Chaque etape est un bloc visuel interactif avec des animations au scroll, des icones, et des donnees cles. L'utilisateur progresse visuellement de la source naturelle jusqu'au robinet.

### Structure de la page (6 sections)

```text
[1] CAPTAGE - Types de sources
    ├── Nappes phreatiques (60% de l'eau potable FR)
    ├── Eaux souterraines profondes / nappes de craie
    ├── Sources de montagne
    └── Eaux de surface (rivieres, lacs, barrages)
    → Carte schematique en coupe geologique

[2] POMPAGE & PRELEVEMENT
    ├── Forages profonds (nappes)
    ├── Captages de source (gravitaire)
    ├── Prises d'eau en riviere
    └── Chiffres cles (5,4 Mds m3/an en France)

[3] TRAITEMENT
    ├── Pre-traitement (degrillage, tamisage)
    ├── Clarification (coagulation, floculation, decantation)
    ├── Filtration (sable, charbon actif)
    ├── Desinfection (chlore, ozone, UV)
    └── Affinage (membranes, charbon actif en grain)

[4] STOCKAGE
    ├── Chateaux d'eau
    ├── Reservoirs enterres
    └── Baches de stockage

[5] DISTRIBUTION
    ├── Reseau de canalisations (906 000 km en FR)
    ├── Surpresseurs et regulateurs
    └── Controles qualite en continu

[6] ARRIVEE AU ROBINET
    ├── Compteur d'eau individuel
    ├── Installation interieure
    └── Qualite finale et controles ARS
```

### Fichiers a creer

**1. `src/pages/ParcoursEau.tsx`**
- Page principale avec Layout, SEOHead
- 6 sections scrollables avec `useState` pour la section active
- Chaque section = composant Card avec icone, titre, description, details interactifs (accordeons ou tabs)
- Barre de progression verticale a gauche qui suit le scroll (trait bleu avec points)
- Animations CSS `animate-in` au scroll via IntersectionObserver
- Donnees statiques inline (chiffres officiels ARS/EauFrance)
- Section "Types de sources" avec cards cliquables qui revelent des details (profondeur, qualite naturelle, risques)
- Section "Traitement" avec toggle entre traitement eau souterraine (leger) et eau surface (complet)

**2. Modifier `src/App.tsx`**
- Ajouter lazy import et route `/parcours-eau`

**3. Modifier `src/components/Navigation.tsx`**
- Ajouter "Parcours de l'eau" dans les items de navigation (section directe)

**4. Modifier `src/components/Footer.tsx`**
- Ajouter lien vers la page dans la section "Donnees"

**5. Modifier `src/utils/seoData.ts`**
- Ajouter metadonnees SEO pour la page

### Details techniques

- Pas de dependance externe : CSS animations + IntersectionObserver natif
- Composants utilises : Card, Badge, Tabs, Accordion, Progress (tous deja installes)
- Responsive : layout vertical sur mobile, 2 colonnes sur desktop pour certaines sections
- Barre de progression : `position: sticky` avec points colores selon la section visible

