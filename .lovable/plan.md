# Séparer les deux diagnostics en pages distinctes

## Objectif
Aujourd'hui, les deux cartes "Diagnostic rapide" et "Diagnostic complet" sur la page d'accueil pointent toutes deux vers `/quelle-eau-boire`, qui affiche un écran de choix intermédiaire. On veut que chaque bouton mène directement au diagnostic correspondant, sur deux URL distinctes.

## Nouvelles URL
- `/quelle-eau-boire/rapide` → écran "Diagnostic rapide" (3 questions)
- `/quelle-eau-boire/complet` → écran "Diagnostic complet" (6 étapes)
- `/quelle-eau-boire` → conservée comme page de choix (entrée depuis le menu/header), avec les deux cartes qui renvoient vers les nouvelles URL

## Modifications

1. **`src/App.tsx`** — ajouter deux nouvelles routes :
   - `/quelle-eau-boire/rapide` → `LazyWaterRecommendation` avec prop/contexte `initialMode="quick"`
   - `/quelle-eau-boire/complet` → `LazyWaterRecommendation` avec prop `initialMode="full"`

2. **`src/pages/QuelleEauBoire.tsx`** — utiliser `useLocation()` pour détecter l'URL :
   - `/rapide` → initialiser `mode = 'quick'` et masquer l'écran de choix
   - `/complet` → initialiser `mode = 'full'` et masquer l'écran de choix
   - `/quelle-eau-boire` (sans suffixe) → comportement actuel (écran de choix), mais les deux `<button onClick={() => setMode(...)}>` sont remplacés par des `<Link to="/quelle-eau-boire/rapide">` et `<Link to="/quelle-eau-boire/complet">` pour que l'URL change aussi
   - Le bouton "Retour" (`handleBackToChoice`) navigue vers `/quelle-eau-boire`
   - Le breadcrumb affiche un libellé adapté (Diagnostic rapide / Diagnostic complet)

3. **`src/pages/Index.tsx`** — mettre à jour les deux `<Link>` :
   - Carte "Diagnostic rapide" → `to="/quelle-eau-boire/rapide"`
   - Carte "Diagnostic complet" → `to="/quelle-eau-boire/complet"`

4. **`src/components/LazyWaterRecommendation.tsx`** — accepter et transmettre une prop optionnelle `initialMode?: 'quick' | 'full'` à `QuelleEauBoire`.

5. **SEO** — ajouter des `canonical` distincts pour chaque mode (`/quelle-eau-boire/rapide`, `/quelle-eau-boire/complet`) afin d'éviter le contenu dupliqué, avec des `title`/`description` adaptés.

## Hors scope
- Pas de changement de logique métier du moteur de recommandation
- Pas de modification du menu mobile/desktop (les liens existants restent vers `/quelle-eau-boire`)
- Pas de redirection 301 côté serveur (SPA only)
