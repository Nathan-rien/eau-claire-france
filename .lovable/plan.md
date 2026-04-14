

## Plan : Corriger la conformité des paramètres d'analyse

### Problème
Le champ `conclusion_conformite_prelevement` de l'API Hub'Eau indique la conformité **du prélèvement entier**, pas de chaque paramètre individuel. Si un seul paramètre du prélèvement est non conforme, **tous** les paramètres de ce prélèvement apparaissent comme "Non conforme", ce qui est faux.

Par exemple, "Odeur (qualitatif)" avec une valeur de 0 (= pas d'odeur) apparaît "Non conforme" parce qu'un autre paramètre du même prélèvement a posé problème.

### Solution dans `src/services/dataGouvApi.ts`

Déterminer la conformité **par paramètre** en comparant la valeur au seuil :

```typescript
// Pour les paramètres quantitatifs :
conformite = valeur <= limite ? 'Conforme' : 'Non conforme'

// Pour les paramètres qualitatifs (unité "SANS OBJET", ou limite = 0) :
// Valeur 0 = normal/conforme, valeur > 0 = anomalie détectée
conformite = valeur === 0 ? 'Conforme' : 'Non conforme'
```

Concrètement, remplacer les lignes 97-98 par une logique de conformité individuelle au lieu d'utiliser `conclusion_conformite_prelevement` qui est global au prélèvement.

### Fichier modifié
- `src/services/dataGouvApi.ts` — logique de conversion (lignes 89-99)

### Impact
- Les paramètres dont la valeur est bien en dessous de la limite s'afficheront correctement comme "Conforme"
- Seuls les paramètres réellement hors limite seront marqués "Non conforme"
- Le score de qualité et le compteur de conformité seront plus précis

