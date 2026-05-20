# Refonte du menu responsive

Objectif : transformer la longue liste plate actuelle en grille visuelle 2 colonnes avec recherche, organisée par sections.

## Structure cible (drawer latéral droit, inchangé)

```text
┌─────────────────────────────┐
│  💧 InfoEau.fr         ✕    │
├─────────────────────────────┤
│  [🇫🇷 France ▾]  [🇬🇧 FR ▾]  │  ← région + langue
├─────────────────────────────┤
│  🔍 Rechercher dans le menu │  ← filtre live
├─────────────────────────────┤
│  CARTES                     │
│  ┌────────┐  ┌────────┐     │
│  │ 🚰     │  │ 💧     │     │
│  │ Robinet│  │Boutei. │     │
│  └────────┘  └────────┘     │
│  ┌────────┐  ┌────────┐     │
│  │ ⚠️     │  │ 🛣️    │     │
│  │Pollu.  │  │Parcours│     │
│  └────────┘  └────────┘     │
├─────────────────────────────┤
│  INFOGRAPHIES               │
│  ┌────────┐  ┌────────┐     │
│  │ 🌧️    │  │ 🍶     │     │
│  │Eau     │  │Boutei. │     │
│  └────────┘  └────────┘     │
├─────────────────────────────┤
│  PRIX                       │
│  ┌────────┐  ┌────────┐     │
│  │ 🛒     │  │ 📈     │     │
│  │Compar. │  │Cours   │     │
│  └────────┘  └────────┘     │
├─────────────────────────────┤
│  OUTILS                     │
│  ┌────────┐  ┌────────┐     │
│  │ 🩺     │  │ 🥤     │     │
│  │Diagnos.│  │Quelle  │     │
│  └────────┘  └────────┘     │
│  ┌────────┐  ┌────────┐     │
│  │ 🏆     │  │ 🔔     │     │
│  │Classem.│  │Alertes │     │
│  └────────┘  └────────┘     │
└─────────────────────────────┘
```

## Changements visuels

- **Grille 2 colonnes** au lieu d'une liste linéaire — gain vertical ~50%, scan instantané.
- **Cartes** ~44px de haut : icône Lucide en haut, libellé court en bas, bordure douce, état actif = fond `bg-accent` + ring `primary`.
- **Sections** séparées par un titre fin `text-xs uppercase tracking-wide` + séparateur léger.
- **Recherche** : `Input` avec icône loupe, filtre toutes les entrées en temps réel (case-insensitive, accent-insensitive). Quand actif, la grille devient une liste filtrée plate avec libellés complets.
- **CTA principal** (Diagnostic) légèrement mis en avant via un dégradé blue→green sur sa carte.
- **Region + Langue** regroupés en haut sous le logo, sur la même ligne, pour libérer le header.

## Détails techniques

- Fichier : `src/components/Header.tsx` (refonte du contenu `SheetContent` uniquement, le drawer reste).
- Largeur sheet : passer `w-72 sm:w-80` → `w-[88vw] max-w-sm` pour plus d'espace sur petits écrans (320px).
- Ajouter une structure de données unique `menuSections: { id, label, items: { href, label, icon }[] }[]` calculée depuis `isEurope`, pour centraliser le mapping icône↔route.
- Icônes Lucide à associer (FR) : `Droplet` (robinet), `GlassWater` (bouteilles), `AlertTriangle` (polluants), `Truck` (parcours bouteille map), `Route` (parcours robinet map), `CloudRain` (infographie eau), `Wine` (infographie bouteille), `ShoppingCart` (comparateur), `TrendingUp` (cours), `Stethoscope` (diagnostic), `HelpCircle` (quelle eau), `Trophy` (classement), `Bell` (alertes). EU : sous-ensemble équivalent.
- Recherche : `useState('')` + filtre `.filter(item => normalize(item.label).includes(normalize(query)))` sur tous les items aplatis ; si `query.length > 0` afficher liste plate, sinon grille par sections.
- Accessibilité : chaque carte = `<Link>` avec `min-h-[64px]`, `aria-current="page"` si actif, focus ring visible.
- Conserver fermeture du sheet sur clic (`onClick={() => setIsOpen(false)}`).
- Aucun changement sur la nav desktop (≥xl) ni sur les routes / contextes existants.

## Hors scope

- Menu desktop, footer, RegionSwitcher interne (réutilisé tel quel).
- Traductions : on réutilise les clés `t('nav.*')` existantes, pas de nouvelles entrées i18n nécessaires.
