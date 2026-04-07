

## Ecran de choix diagnostic rapide / complet sur /quelle-eau-boire

### Concept

Ajouter un nouvel etat `mode` au composant QuelleEauBoire : `null` (ecran de choix), `'quick'` (diagnostic rapide), `'full'` (diagnostic complet = comportement actuel).

A l'arrivee sur la page, l'utilisateur voit un ecran de selection avec deux cartes cliquables. Une fois le mode choisi, il bascule vers le formulaire correspondant.

### Ecran d'accueil (mode = null)

Deux cartes cote a cote (desktop) ou empilees (mobile) :

- **Diagnostic rapide** (icone Zap) : "3 questions, resultat en 30 secondes". Pose uniquement : type d'eau (plate/gazeuse/toutes) + profil (un seul choix parmi les plus courants : sportif, grossesse, nourrisson, senior, quotidien) + eau plate/gazeuse. Bouton "Voir mes recommandations" directement.
- **Diagnostic complet** (icone ClipboardList) : "Analyse detaillee avec profils, intolerances et preferences". C'est le formulaire actuel en 4 etapes.

Design mobile-first : cartes pleine largeur, touch targets 48px min, padding genereux, transitions fluides entre les ecrans.

### Diagnostic rapide (mode = 'quick')

Un seul ecran compact avec :
1. Choix du type d'eau (3 boutons radio style pill, pas des cards)
2. Choix du profil principal (grille de boutons icon+label, un seul selectionnable, les 5-6 profils les plus courants)
3. Bouton CTA "Voir mes recommandations"

Sur mobile : layout vertical, boutons larges, scroll minimal. Transition animee depuis l'ecran d'accueil.

### Diagnostic complet (mode = 'full')

Le formulaire actuel (4 etapes) sans changement, avec juste un bouton retour vers l'ecran de choix.

### Modifications techniques

**Fichier : `src/pages/QuelleEauBoire.tsx`**

- Ajouter state `mode: 'quick' | 'full' | null` initialise a `null`
- Quand `mode === null` : rendre l'ecran de choix avec les 2 cartes
- Quand `mode === 'quick'` : rendre le formulaire rapide (nouveau composant inline ou extrait)
- Quand `mode === 'full'` : rendre le formulaire actuel (code existant)
- Le diagnostic rapide reutilise `handleGetRecommendations` avec un seul profil selectionne et le type d'eau
- Ajouter un bouton "Retour" en haut des deux modes pour revenir a l'ecran de choix
- Transitions CSS avec `transition-all` pour un passage fluide entre ecrans

### Optimisation mobile

- Ecran d'accueil : `grid grid-cols-1 md:grid-cols-2 gap-4`, cartes avec min-height 160px pour une bonne zone tactile
- Diagnostic rapide : boutons profil en grille `grid-cols-2` sur mobile, `grid-cols-3` sur desktop
- Type d'eau en diagnostic rapide : boutons horizontaux `flex gap-2` avec `flex-1` pour occuper toute la largeur
- Padding adaptatif `px-4 md:px-6`, textes `text-base md:text-lg`
- Scroll fluide vers le haut lors du changement de mode

