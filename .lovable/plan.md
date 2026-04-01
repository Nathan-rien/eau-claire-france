

## Fix: la page /prix-eaux se recharge plusieurs fois

### Cause

Le useEffect qui charge les prix (ligne 135-264) a comme dependances `[filters, toast, retailers, brandRetailerMapping]`. Or ces deux derniers sont mis a jour de facon asynchrone et independante dans le premier useEffect (lignes 91-122). Chaque `setState` declenche un re-render et relance `loadPrices` :

1. Render initial : `retailers=[]`, `brandRetailerMapping=[]` → loadPrices #1
2. `setRetailers(data)` → loadPrices #2
3. `setBrands(data)` → re-render (pas de reload car pas dans les deps)
4. `setBrandRetailerMapping(data)` → loadPrices #3

Resultat : 3 appels Supabase consecutifs avec "Chargement..." qui clignote.

### Solution

**Attendre que les donnees initiales soient chargees avant de lancer loadPrices.**

Ajouter un flag `initialDataLoaded` qui passe a `true` seulement quand les 3 appels initiaux (retailers, brands, mapping) sont termines. Le useEffect des prix ne se declenche que si ce flag est `true`.

### Modifications dans `src/pages/PrixEaux.tsx`

1. Ajouter un state `const [initialDataLoaded, setInitialDataLoaded] = useState(false);`

2. Dans le premier useEffect, deplacer le `setInitialDataLoaded(true)` apres les 3 setState (retailers, brands, mapping), juste avant le `catch`.

3. Dans le second useEffect (loadPrices), ajouter un early return `if (!initialDataLoaded) return;` au debut, et ajouter `initialDataLoaded` aux dependances a la place de `retailers` et `brandRetailerMapping`.

4. Puisque `loadPrices` accede a `retailers` et `brandRetailerMapping`, utiliser des refs (`useRef`) pour eviter qu'ils ne soient dans les deps du useEffect. Mettre a jour les refs dans le premier useEffect apres chaque setState.

Cela garantit un seul appel `getPrices` une fois toutes les donnees de reference chargees.

