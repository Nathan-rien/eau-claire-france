

## Probleme

La section "Surveillez la qualite de votre eau" (ligne 277) a deux backgrounds en conflit :

```
bg-gradient-to-br from-primary/10 via-blue-50 to-primary/5 ... bg-sky-50
```

Le `bg-sky-50` est ecrase par le gradient (`bg-gradient-to-br`), qui applique un filtre bleu avec des opacites (`primary/10`, `blue-50`, `primary/5`). Le resultat n'est pas un fond `sky-50` uniforme comme attendu dans la capture d'ecran.

## Solution

Supprimer le gradient et ne garder que `bg-sky-50` pour un fond uniforme et conforme a la charte.

### Modification — `src/pages/Index.tsx`, ligne 277

**Avant :**
```
bg-gradient-to-br from-primary/10 via-blue-50 to-primary/5 relative overflow-hidden bg-sky-50
```

**Apres :**
```
relative overflow-hidden bg-sky-50
```

Les particules decoratives (lignes 279-282) utilisent `bg-primary/5` et `bg-primary/10` qui resteront subtiles sur le fond `sky-50`.

