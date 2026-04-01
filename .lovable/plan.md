

## Remplacer le tableau mobile par une liste compacte e-commerce sur /prix-eaux

### Approche

Sur mobile (`< md`), masquer le tableau et afficher une liste compacte inspirée des apps de courses : chaque produit sur une ligne avec le retailer à gauche, le prix à droite, et les détails secondaires en dessous. Le tableau classique reste visible sur desktop (`md:` et au-dessus).

### Structure d'un item de la liste

```text
┌─────────────────────────────────────┐
│ 🏪 Carrefour              0.42 €/L │
│ Evian · 6×1.5L             3.79 €  │
│ ⏱ il y a 2j          PROMO        │
└─────────────────────────────────────┘
```

- **Ligne 1** : icône canal + nom retailer (gauche), prix/L en gras (droite)
- **Ligne 2** : marque + format (gauche), prix pack (droite)
- **Ligne 3** : date relative (gauche), badge promo si applicable (droite)

### Modifications dans `src/pages/PrixEaux.tsx`

1. **Retirer la colonne sticky et le hint de scroll** : supprimer `sticky left-0`, la classe `table-scroll-hint`, et le texte "Glissez pour voir toutes les colonnes".

2. **Masquer le tableau sur mobile** : ajouter `hidden md:block` sur le wrapper du tableau existant.

3. **Ajouter la liste mobile** : juste avant le wrapper tableau, ajouter un bloc `md:hidden` qui itère sur `prices` et affiche chaque item en `div` avec :
   - `flex justify-between` pour aligner retailer/prix
   - Texte secondaire en `text-xs text-muted-foreground`
   - Bordure inférieure `border-b border-border` entre les items
   - Badge promo conditionnel
   - Même logique `getChannelIcon()` et `formatPrice()`

4. **Pagination** : la pagination existante reste inchangée et s'applique aux deux vues.

