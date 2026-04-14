
## Plan : Supprimer la page /comparateur-prix

### Fichiers modifiés

1. **`src/App.tsx`** — Supprimer le lazy import `ComparateurPrix` et la route `/comparateur-prix`
2. **`supabase/functions/ondine-chat/index.ts`** — Retirer la ligne `[Comparateur de prix](/comparateur-prix)` du system prompt + redéployer
3. **`src/utils/seoData.ts`** — Supprimer l'entrée `comparateurPrix`

### Fichier supprimé
4. **`src/pages/ComparateurPrix.tsx`** — Supprimer le fichier

### Note
La navigation (Header/Navigation) ne pointe pas vers `/comparateur-prix` — elle pointe vers `/prix-eaux` avec le label "Comparateur de prix", donc rien à changer côté nav.
