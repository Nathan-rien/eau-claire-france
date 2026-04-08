

## Plan : Appliquer le dégradé bleu→vert de la charte aux chiffres clés

### Référence
L'image montre les 4 chiffres (35,000+ / 50+ / 98% / 24h) chacun avec une couleur différente. La charte InfoEau utilise le dégradé `from-[#3b82f6] to-[#22c55e]`. On applique ce dégradé en texte (`bg-gradient-to-r bg-clip-text text-transparent`) aux 4 valeurs pour un rendu cohérent avec le logo.

### Fichier modifié
`src/pages/Index.tsx` — lignes 55, 59, 63, 67

### Changements
Remplacer les classes de couleur de chaque chiffre par le dégradé :

| Chiffre | Avant | Après |
|---------|-------|-------|
| 35,000+ | `text-primary` | `bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent` |
| 50+ | `text-muted-foreground` | `bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent` |
| 98% | `text-orange-600` | `bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent` |
| 24h | `text-purple-600` | `bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent` |

### Résultat attendu
Les 4 chiffres clés affichent le même dégradé bleu→vert conforme à la charte graphique du logo InfoEau.

