

## Plan : Corriger les données manquantes et les faux zéros sur `/sources-eau`

### Diagnostic

Le problème principal est un **bug dans `toNumber()`** dans `src/utils/csv.ts` : quand une cellule CSV est vide (`""`), `Number("")` retourne `0` au lieu de `undefined`. Cela provoque :
- Des "0 m³/jour", "0 mètres", "0 °C" dans les caractéristiques techniques (valeurs fantômes)
- Des "0 mg/L" pour des minéraux non mesurés
- La section "Caractéristiques techniques" s'affiche alors qu'il n'y a pas de données réelles

### Modifications

**1. `src/utils/csv.ts` — Corriger `toNumber`**

Ajouter un garde pour les chaînes vides : si `v` est vide ou whitespace, retourner `undefined` au lieu de `0`.

```typescript
export const toNumber = (v?: string) => {
  if (!v || !v.trim()) return undefined;  // ← ajout
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
};
```

**2. `src/components/WaterSourcesMap.tsx` — Masquer la section technique vide**

Conditionner l'affichage de la section "Caractéristiques techniques" (lignes 568-596) : ne l'afficher que si au moins un des 3 champs (`flow_rate`, `depth`, `temperature`) est défini et non nul. Actuellement elle s'affiche toujours avec les coordonnées, ce qui crée un bloc semi-vide.

Déplacer la ligne "Coordonnées" hors de cette section conditionnelle pour qu'elle reste toujours visible.

**3. `src/components/WaterSourcesMap.tsx` — Afficher un message quand la composition est absente**

Pour les sources sans données de composition (eaux de source génériques comme Cristaline), afficher un message informatif "Données de composition non disponibles pour cette source" au lieu de simplement ne rien montrer.

### Ce qui ne change pas
- La carte, les marqueurs, le zoom, les couleurs
- La logique de jointure multi-clés dans `sourcesAdapter.ts`
- Les sections éducatives et statistiques
- Les indicateurs enrichis (minéralisation, dureté, recommandations) — ils s'afficheront correctement une fois le bug `toNumber` corrigé

### Impact
Après ce fix, les sources avec composition réelle (Évian, Vittel, Hépar, Badoit…) afficheront les bonnes valeurs minérales et les indicateurs dérivés. Les sources sans composition afficheront un message clair. Plus aucun faux "0" ne polluera l'affichage.

