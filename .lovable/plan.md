

## Lignes depliables sur /classement-europe

Ajouter un state `expandedCountry` (string | null). Au clic sur une ligne du tableau, afficher une ligne supplementaire en dessous avec toutes les informations detaillees du pays.

### Modifications — `src/pages/ClassementEurope.tsx`

**1. Imports et donnees supplementaires**
- Importer `getEUPollutants`, `EUPollutant` depuis `europeWaterApi`
- Importer `ChevronDown`, `FlaskConical`, `Shield`, `Users`, `Droplets` depuis lucide
- Ajouter un state `pollutants` charge au mount via `getEUPollutants()`
- Ajouter un state `expandedCountry: string | null`

**2. Ligne cliquable**
- Rendre chaque `TableRow` cliquable (`cursor-pointer`, `onClick` toggle `expandedCountry`)
- Ajouter un chevron qui tourne quand le pays est deplie

**3. Ligne de detail (colspan full)**
- Quand `expandedCountry === c.countryCode`, inserer une `TableRow` supplementaire avec une `TableCell` colSpan={6} contenant :
  - **Resume** : Population desservie, zones d'approvisionnement, annee du rapport
  - **Violations detaillees** : Pesticides / Plomb / Bacteries avec icones et compteurs
  - **Polluants detectes** : Liste filtree depuis `pollutants` par `countryCode`, affichant nom, categorie, valeur moyenne, limite, unite, taux de depassement (badge colore si >1%), zones affectees
  - **Liens** : vers `/carte-polluants-europe` et `/alertes-europe`

### Structure visuelle du detail

```text
┌──────────────────────────────────────────────────────────┐
│  👥 8.9M habitants  │  🏭 1200 zones  │  📅 2023        │
│                                                          │
│  Violations:  🧪 Pesticides: 2  🔩 Plomb: 0  🦠 Bact: 1│
│                                                          │
│  Polluants détectés:                                     │
│  ┌─────────┬──────────┬────────┬───────┬────────┬──────┐ │
│  │Polluant │Catégorie │Moyenne │Limite │Dépass. │Zones │ │
│  ├─────────┼──────────┼────────┼───────┼────────┼──────┤ │
│  │Nitrates │Chimique  │12.3   │50     │0.5%    │6     │ │
│  │Pestici. │Chimique  │0.08   │0.5    │0.2%    │2     │ │
│  └─────────┴──────────┴────────┴───────┴────────┴──────┘ │
│                                                          │
│  🔗 Voir la carte des polluants  │  🔗 Alertes Europe   │
└──────────────────────────────────────────────────────────┘
```

Pas de nouveau fichier — tout dans `ClassementEurope.tsx`.

