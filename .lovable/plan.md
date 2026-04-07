

## Refonte de la page d'accueil — Mise en avant des diagnostics, classement et infographies

### Objectif

Restructurer la page `/` pour :
1. Reprendre les deux cartes de choix de diagnostic (rapide / complet) de `/quelle-eau-boire`
2. Ajouter une carte mise en avant vers `/classement`
3. Ajouter une section "Infographies & Cartes" renvoyant vers les cartes interactives et pages visuelles du site

### Modifications

**Fichier : `src/pages/Index.tsx`**

Restructurer le contenu sous le hero (SearchBar + stats) en remplacant la section "Quick Access" actuelle et la section "Features" par :

**Section 1 — "Quelle eau boire ?" (apres les stats)**
- Titre + sous-titre reprenant le meme texte que `/quelle-eau-boire`
- Deux cartes cote a cote (grid 1 col mobile, 2 col desktop) :
  - **Diagnostic rapide** : icone Zap, titre, description "3 questions, resultat en 30 secondes", badge "Rapide" — lien vers `/quelle-eau-boire` (le composant la-bas gere le mode)
  - **Diagnostic complet** : icone ClipboardList, titre, description "Analyse detaillee avec profils, intolerances et preferences", badge "4 etapes" — lien vers `/quelle-eau-boire`
- Style identique aux cartes de QuelleEauBoire (hover shadow, border primary)

**Section 2 — Carte "Classement des eaux"**
- Grande carte horizontale (full width) avec fond gradient bleu/vert
- Icone Award, titre "Classement des eaux en bouteille", description "Decouvrez le top des eaux minerales et de source classees par composition minerale"
- Bouton CTA "Voir le classement" → `/classement`

**Section 3 — "Cartes & Infographies" (grille 2x2 ou 2x3)**
Grille de cartes cliquables vers les pages visuelles :
- **Carte qualite de l'eau** (`/carte`) — icone MapPin, "Qualite de l'eau par commune"
- **Carte des polluants** (`/carte-polluants`) — icone AlertTriangle, "Polluants detectes en France"
- **Parcours de l'eau en bouteille** (`/carte-parcours-eau`) — icone Droplets, "De la source au magasin"
- **Parcours de l'eau du robinet** (`/carte-parcours-robinet`) — icone GlassWater, "Du captage au robinet"
- **Sources d'eau** (`/sources-eau`) — icone Leaf, "Carte des sources en France"
- **Carte Europe** (`/carte-europe`) — icone Globe, "Qualite de l'eau en Europe"

Conserver la section NavigationCTA en bas.

**Imports a ajouter** : `Zap`, `ClipboardList`, `GlassWater`, `Globe` depuis lucide-react.

### Structure finale de la page

```text
Hero (titre + SearchBar + stats)
───────────────────────────────
Section "Quelle eau boire ?"
  [Diag rapide]  [Diag complet]
───────────────────────────────
Section "Classement des eaux"
  [Grande carte CTA → /classement]
───────────────────────────────
Section "Cartes & Infographies"
  [Carte qualite] [Polluants]
  [Parcours bout.] [Parcours rob.]
  [Sources]        [Europe]
───────────────────────────────
NavigationCTA (existant)
```

### Fichiers modifies

- `src/pages/Index.tsx` — seul fichier modifie

