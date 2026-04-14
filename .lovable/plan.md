

## Plan : Corriger les erreurs NaN% et Infinity% limite

### Probleme
L'API Hub'Eau renvoie le champ `limite_qualite_parametre` sous forme de **string** (ex: `"<=0 n/(100mL)"`, `"<=50 mg/L"`) ou `null`. Le code actuel :
1. Utilise le mauvais nom de champ (`limite_de_qualite_parametre` au lieu de `limite_qualite_parametre`)
2. S'attend a un nombre, alors que c'est une string

Result: `limite` vaut toujours `0`, causant des divisions par zero (Infinity%) ou 0/0 (NaN%).

### Solution dans `src/services/dataGouvApi.ts`

1. **Corriger l'interface `HubEauResult`** : renommer le champ en `limite_qualite_parametre: string | null` et ajouter `reference_qualite_parametre: string | null`

2. **Parser la valeur numerique depuis la string** : extraire le nombre de chaines comme `"<=50 mg/L"` ou `">=6,5 et <=9 unite pH"` avec une regex

```typescript
function parseLimite(raw: string | null): number {
  if (!raw) return 0;
  // Extraire le dernier nombre (pour ">=6,5 et <=9", prend 9)
  const matches = raw.match(/[\d]+[,.]?[\d]*/g);
  if (!matches) return 0;
  return parseFloat(matches[matches.length - 1].replace(',', '.'));
}
```

3. **Utiliser aussi `reference_qualite_parametre`** comme fallback quand `limite_qualite_parametre` est null (cas du pH, temperature, chlore total)

4. **Dans `WaterQualityCard.tsx`** : ne pas afficher le pourcentage limite quand `limiteQualite` est `0` (pas de limite connue)

### Fichiers modifies
- `src/services/dataGouvApi.ts` — interface + parsing de la limite
- `src/components/WaterQualityCard.tsx` — masquer "% limite" quand pas de limite

