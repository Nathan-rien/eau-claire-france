

## Enrichir la page /quelle-eau-boire avec du contenu SEO et une question supplementaire

### 1. Contenu editorial sur l'ecran d'accueil (mode = null)

Ajouter sous les deux cartes de choix diagnostic, trois sections de texte riche :

**Section "Pourquoi choisir la bonne eau ?"** : Paragraphe expliquant que chaque eau a une composition minerale unique, que les besoins varient selon l'age, l'activite, la sante. Mots-cles SEO : eau minerale, eau de source, composition, mineraux, sante.

**Section "Comment fonctionne notre diagnostic ?"** : Explication du systeme de score (criteres mineraux vs profil, ponderation par priorite, score sur 100). Transparence sur la methode = confiance utilisateur + contenu indexable.

**Section "Les risques d'une eau non adaptee"** : Liste des risques concrets (exces de sodium et hypertension, nitrates et nourrissons, manque de calcium et osteoporose, exces de mineralisation et calculs renaux). Avec icone AlertTriangle, fond orange/rouge leger.

Chaque section utilise des balises h2 pour le SEO, avec des paragraphes informatifs de 3-5 lignes.

### 2. Nouvelle question dans le diagnostic rapide

Ajouter une troisieme question : **"Votre objectif principal"** entre le profil et le CTA.

Options : "Sante au quotidien", "Performance sportive", "Digestion & transit", "Os & articulations", "Eau la plus pure possible".

Cela mappe vers une preference utilisateur qui s'ajoute aux criteres du profil selectionne, rendant le diagnostic rapide plus pertinent (3 questions au lieu de 2, comme prevu dans le plan initial).

Le `handleQuickRecommendations` passera cette preference en plus du profil.

### Modifications techniques

**Fichier : `src/pages/QuelleEauBoire.tsx`**

- Ecran `mode === null` : ajouter 3 sections h2 apres la grille de cartes (Pourquoi, Comment, Risques)
- Ecran `mode === 'quick'` : ajouter un state `quickObjective` et une grille de boutons objectif apres le profil
- `handleQuickRecommendations` : mapper l'objectif vers une preference de `userPreferences` et l'inclure dans le calcul
- Imports supplementaires : `ShieldAlert`, `Info`, `Target` depuis lucide-react

### Structure du contenu SEO

```text
[Cartes diagnostic rapide / complet]

── h2: Pourquoi choisir une eau adaptee a vos besoins ?
   Paragraphe explicatif (composition, mineraux, profils)

── h2: Comment fonctionne notre diagnostic ?
   Explication score/100, criteres, ponderation

── h2: Les risques d'une eau non adaptee
   4-5 risques avec icones (sodium/HTA, nitrates/bebe, etc.)
```

