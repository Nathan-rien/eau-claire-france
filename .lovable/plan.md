## Diagnostic

**1. Pourquoi Mont Roucous n'apparaît pas en haut**

D'après le scoring actuel du profil Pureté, Mont Roucous obtient ~79/80 mais est pénalisée sur 2 points :
- **Potassium** (8.2 mg/L) : règle `fullAt:2, zeroAt:15` → score 5.2/10 (alors que le potassium n'a aucune pertinence pour la "pureté")
- **Sulfates** : valeur manquante dans le CSV → score neutre 5/10 (la donnée absente pénalise injustement les eaux ultra-pures)

Résultat : Montcalm (80/80, K=0.6, SO4=10) écrase Mont Roucous, et Voss/autres passent devant. Mont Roucous existe bien dans le CSV (ligne 26) et passe tous les filtres par défaut — elle est seulement reléguée plus bas dans la liste.

**2. Pourquoi les eaux "restent bloquées" au changement de profil**

Le tri se recalcule correctement, mais comme chaque carte garde la même `key={water.id}`, React déplace les nœuds DOM sans aucune transition visuelle ni feedback de scroll. L'utilisateur perçoit que "rien ne bouge" car :
- pas de reset de scroll en haut de liste
- pas d'animation de réordonnancement
- les filtres avancés sont déjà ouverts au-dessus de la liste, donc l'utilisateur ne voit pas le nouveau podium

## Plan

### 1. Corriger le scoring Pureté (`src/utils/rankingV2.ts`)

- **Potassium en Pureté** : passer de `fullAt:2, zeroAt:15` → `fullAt:10, zeroAt:50` (K n'est pas un marqueur de pureté)
- **Sulfates en Pureté** : si valeur manquante, traiter comme **neutre haut (10/10)** et non 5/10 — une eau granitique sans SO4 mesuré est par hypothèse pauvre en sulfates
- **Normalisation du total** : quand `scoreBottle` rencontre une `Composition` avec des champs `undefined`, exclure ces critères du dénominateur et reproportionner le total sur 80. Cela évite que les eaux les plus complètes (Montcalm avec SO4) écrasent celles avec données partielles (Mont Roucous sans SO4)

Résultat attendu : Mont Roucous monte à 80/80 ex-aequo avec Montcalm en profil Pureté.

### 2. Réagencer la page `/classement` pour plus de clarté

Nouvelle hiérarchie verticale :

```text
┌─ Hero compact (titre + 1 ligne explicative + lien "?" info modal) ─┐
│                                                                     │
├─ [Profil] sticky en haut quand scroll (avec emoji + label actif)   │
│                                                                     │
├─ TOOLBAR (1 ligne) :                                                │
│   [🔍 Recherche]  [⭐ Favoris]  [⚙️ Filtres (n)]  [📋/📊 Vue]      │
│                                                                     │
├─ PODIUM TOP 3 (cards plus grandes, médailles 🥇🥈🥉)               │
│                                                                     │
├─ Liste reste du classement (cards compactes, n° de rang visible)   │
│                                                                     │
└─ Sticky compare bar (inchangée)                                    │
```

Modifications concrètes :
- **Sticky profile selector** : devient sticky `top-0` avec backdrop blur quand l'utilisateur scrolle
- **Carte info "Comment fonctionne le score"** : remplacée par un bouton `(?)` à côté du titre qui ouvre un Dialog (gagne ~150px verticaux)
- **Filtres avancés** : repliés par défaut + badge "n actifs" pour signaler quand un filtre non-défaut est appliqué (aujourd'hui le panneau ne signale pas s'il y a des filtres actifs)
- **Podium top 3** : grille `md:grid-cols-3` avec cartes mises en valeur (bordure dorée/argent/bronze, gros score, médaille). Le reste passe en grille 2 colonnes classique
- **Animation de tri** : ajouter `layout` Framer Motion sur les cartes pour animer le réordonnancement lors du changement de profil → effet visuel "ça bouge"
- **Reset scroll** : `window.scrollTo({ top: ..., behavior: 'smooth' })` vers le podium quand le profil change
- **Description profil active** : afficher dans une bulle plus visible sous le selector (gradient bleu/vert, icône, 1 phrase)

### 3. Petits fix UX

- Indicateur "données partielles" sur la carte uniquement si < 8/11 critères (sinon bruit visuel)
- Bouton "Réinitialiser tous les filtres" remonté en haut du panneau filtres
- Mobile : toolbar et profils en horizontal scroll (au lieu de wrap qui prend 3 lignes)

### Fichiers modifiés

- `src/utils/rankingV2.ts` — règles potassium/sulfates Pureté + normalisation par poids effectifs
- `src/pages/Classement.tsx` — réagencement, sticky selector, podium, scroll reset
- `src/components/Ranking/RankingProfileSelector.tsx` — version sticky + meilleure description active
- `src/components/Ranking/BottleRankingCard.tsx` — variante "podium" (taille XL + médaille)
- `src/components/Ranking/RankingFilters.tsx` — badge "filtres actifs" + reset visible

Aucun changement de schéma de données, aucun fichier CSV touché.
