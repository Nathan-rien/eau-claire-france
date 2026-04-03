

## Optimisation des performances et Core Web Vitals

### Diagnostic

**Cause principale du ralentissement sur /classement-europe (et autres pages Europe) :**

`getEUPollutants()` dans `europeWaterApi.ts` fait **2 appels reseau par pays** pour 8 pays (lignes 86-89 + 95-100) = **16 requetes edge function** qui bloquent l'affichage. De plus, `fetchDiscodataPollutants` fait un premier appel `supabase.functions.invoke()` inutile (ligne 86-89) dont le resultat n'est jamais utilise, puis un second `fetch()` — c'est un double appel.

Pages affectees : `/classement-europe`, `/diagnostic-europe`, `/polluants-europe` (toutes appellent `getEUPollutants()`).

**Autres problemes identifies :**

1. **`fetchDiscodataPollutants` fait un appel fantome** — `supabase.functions.invoke()` est appele mais son resultat (`data`, `error`) n'est jamais utilise. C'est une requete gaspillee qui ajoute ~500ms.

2. **Pas de timeout sur les enrichissements DISCODATA** — Si l'edge function est lente, la page attend indefiniment.

3. **3 CSV charges sequentiellement** — `getEUWaterQuality()`, `getEUPollutants()`, `getEUWaterComposition()` chargent chacune un CSV. Les CSV sont petits mais le pattern est waterfall (CSV charge → parse → puis enrichissement API).

4. **`EnhancedSecurityService.startSecurityMonitoring()`** — Patche `localStorage.setItem` et `console.log` sur chaque app start, ajoutant overhead sur chaque ecriture.

5. **Pas de loading state visible** — Les pages Europe utilisent `useState` + `useEffect` sans afficher de skeleton pendant le chargement, l'ecran reste vide.

6. **React.Fragment recoit `data-lov-id`** — Warning console sur ClassementEurope (non-bloquant mais polluant).

### Plan d'action

**1. Corriger `fetchDiscodataPollutants` — supprimer l'appel fantome + ajouter timeout (`europeWaterApi.ts`)**

- Supprimer `supabase.functions.invoke()` (lignes 86-89) qui ne sert a rien
- Ajouter `AbortController` avec timeout de 3 secondes sur le fetch
- Strategie "CSV-first, API-enrichment-later" : afficher les donnees CSV immediatement, enrichir en arriere-plan

**2. Passer les pages Europe a un pattern "affichage immediat" (`ClassementEurope.tsx`, `DiagnosticEurope.tsx`, `PolluantsEurope.tsx`)**

- Charger les CSV (rapide, ~50ms) et afficher immediatement
- Lancer l'enrichissement DISCODATA en arriere-plan avec `Promise.allSettled` + timeout
- Ajouter un skeleton/spinner pendant le chargement initial des CSV
- Mettre a jour les donnees quand l'enrichissement arrive (sans bloquer)

**3. Restructurer `getEUPollutants` en 2 phases (`europeWaterApi.ts`)**

Nouvelle API :
- `getEUPollutantsBaseline()` — retourne les CSV immediatement (sync apres premier chargement)
- `enrichPollutantsWithApi()` — lance l'enrichissement DISCODATA en arriere-plan, retourne une Promise

**4. Ajouter des etats de chargement aux pages Europe**

- Afficher un skeleton table pendant que les CSV chargent
- Indicateur discret "Mise a jour en cours..." pendant l'enrichissement API
- Badge "Donnees enrichies via API" quand l'enrichissement reussit

**5. Supprimer le monkey-patching de `console.log` en production (`enhancedSecurityService.ts`)**

`monitorConsoleAccess()` remplace `console.log` en production par une version qui appelle `AuditService.logEvent()` sur chaque log — c'est un overhead inutile et potentiellement recursif.

**6. Optimiser le rendu du tableau ClassementEurope**

- Les fonctions `getCountryPollutants()` et `getCountryComposition()` sont appelees pour chaque ligne a chaque render, meme non-expanded. Les calculer uniquement pour le pays expande.

### Fichiers modifies

1. **`src/services/europeWaterApi.ts`** — Supprimer appel fantome, ajouter timeout 3s, exporter `getEUPollutantsBaseline()` + `enrichPollutantsWithApi()`
2. **`src/pages/ClassementEurope.tsx`** — Chargement en 2 phases (CSV immediat + enrichissement), skeleton, filtrage lazy des pollutants/composition
3. **`src/pages/DiagnosticEurope.tsx`** — Meme pattern 2 phases
4. **`src/pages/PolluantsEurope.tsx`** — Meme pattern 2 phases
5. **`src/pages/CompositionEurope.tsx`** — Ajouter skeleton pendant chargement
6. **`src/services/enhancedSecurityService.ts`** — Supprimer `monitorConsoleAccess()` et simplifier `monitorLocalStorageChanges()`

### Gains estimes

- **Temps d'affichage /classement-europe** : de ~3-5s a ~200ms (CSV local servi immediatement)
- **Requetes reseau initiales** : de 16+ a 3 CSV, enrichissement differe
- **LCP** : ameliore par l'affichage immediat du contenu CSV
- **TBT** : reduit par suppression du monkey-patching console/localStorage

