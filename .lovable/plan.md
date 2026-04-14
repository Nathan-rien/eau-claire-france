

## Plan : Renseigner les descriptions manquantes via correspondance partielle

### Probleme
L'API Hub'Eau renvoie des noms de parametres longs et varies (ex: "Bacteries coliformes /100ml-MS", "Turbidite nephelometrique NFU", "Coloration", "Aspect (qualitatif)", "Bact. aer. revivifiables a 36°-44h") qui ne correspondent pas exactement aux cles du dictionnaire (`"Bacteries coliformes"`, `"Turbidite"`, `"Couleur"`).

### Solution (2 actions dans `WaterQualityCard.tsx`)

1. **Ajouter les parametres manquants au dictionnaire** — couvrir les noms exacts courants de l'API :
   - `"Coloration"` — coloration de l'eau, indicateur visuel
   - `"Aspect (qualitatif)"` — aspect visuel general
   - `"Bact. aér. revivifiables à 36°-44h"` — bacteries indicatrices de qualite microbiologique
   - `"Bact. aér. revivifiables à 22°-68h"` — idem a temperature ambiante
   - `"Turbidité néphélométrique NFU"` — mesure de la limpidite
   - `"Bactéries coliformes /100ml-MS"` — indicateurs microbiologiques
   - `"Escherichia coli /100ml-MS"` — variante du nom E. coli
   - `"Entérocoques /100ml-MS"` — variante enterocoques
   - Et autres variantes courantes

2. **Ajouter une fonction de recherche par inclusion** — si le nom exact n'est pas dans le dictionnaire, chercher une cle du dictionnaire qui est contenue dans le nom du parametre (ou l'inverse). Cela couvre les variantes futures sans devoir les lister toutes.

```typescript
function getParameterDescription(name: string): string | undefined {
  if (PARAMETER_DESCRIPTIONS[name]) return PARAMETER_DESCRIPTIONS[name];
  const key = Object.keys(PARAMETER_DESCRIPTIONS).find(k => 
    name.toLowerCase().includes(k.toLowerCase()) || 
    k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? PARAMETER_DESCRIPTIONS[key] : undefined;
}
```

### Fichier modifie
- `src/components/WaterQualityCard.tsx`

