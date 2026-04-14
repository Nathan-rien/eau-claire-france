
## Plan : Dédupliquer les données du diagnostic eau

### Problème
L'API Hub'Eau renvoie jusqu'à 50 résultats bruts. Un même paramètre (ex: Nitrates) apparaît plusieurs fois car il y a plusieurs prélèvements à des dates différentes. Le composant affiche tous les résultats tels quels, créant des redondances.

### Solution
Dédupliquer les données dans `src/services/dataGouvApi.ts` après conversion : grouper par `parametreAnalyse` et ne garder que le résultat le plus récent (date de prélèvement la plus récente) pour chaque paramètre.

### Fichier modifié

**`src/services/dataGouvApi.ts`** — Après la conversion des données (ligne 99), ajouter une étape de déduplication :
- Grouper les résultats par `parametreAnalyse`
- Pour chaque groupe, ne garder que l'entrée avec la `datePrelevement` la plus récente
- Retourner le tableau dédupliqué

Cela corrige à la fois les données réelles et n'affecte pas les données mock (qui sont déjà uniques).

### Impact
- La liste passe de ~50 lignes redondantes à ~10-15 paramètres uniques
- Le score de qualité devient plus représentatif (pas biaisé par la répétition d'un même paramètre)
- Aucun changement dans le composant d'affichage
