

## Objectif

Remplacer le compteur agrege "X violations totales" par un detail par type (pesticides, plomb, bacteries) dans la section "Pays en alerte" de la page AlertesEurope. On peut aussi croiser avec les donnees `pollutants` pour afficher les polluants specifiques du pays avec leurs valeurs.

## Modifications

**`src/pages/AlertesEurope.tsx`** :

- Dans le bloc de chaque pays en alerte (lignes 49-66), remplacer la ligne "X violations totales" par un detail ventile :
  - `🧪 Pesticides : {pesticideViolations}` 
  - `🔩 Plomb : {leadViolations}`
  - `🦠 Bactéries : {bacteriaViolations}`
- Ajouter une sous-section depliable (Collapsible ou simple toggle) montrant les polluants du pays concerne (filtre depuis `pollutants` par `countryCode`) avec valeur moyenne, limite et taux de depassement
- Utiliser les donnees deja disponibles dans `quality` (violations par type) et `pollutants` (details par polluant/pays)

### Structure visuelle par pays

```text
┌─────────────────────────────────────────────────┐
│ ⚠ Bulgarie  [Score C]          Conformité: 95.2%│
│                                                  │
│  Pesticides: 12  │  Plomb: 8  │  Bactéries: 15  │
│                                                  │
│  Polluants détectés:                             │
│  ├ Nitrates    22.1 mg/L  (limite 50)  3.5%     │
│  ├ Plomb       5.8 µg/L   (limite 10)  1.5%     │
│  └ Bact. col.  2.8 UFC    (limite 0)   2.9%     │
└─────────────────────────────────────────────────┘
```

Pas de nouveau composant — tout reste dans `AlertesEurope.tsx`. Les donnees `pollutants` sont deja chargees dans le state.

