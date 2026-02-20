
## Clarifier l'affichage des dates sur /alertes

### Diagnostic

L'Edge Function `fetch-water-alerts` fonctionne correctement et appelle Hub'Eau en temps réel. Les données retournées sont bien actuelles (testées en direct : réponse `200 OK` avec des données fraîches).

Le champ `date_prelevement` affiché dans les cartes d'alerte correspond à la **date à laquelle l'échantillon d'eau a été prélevé dans la commune**, pas à une date de publication ou de mise à jour du système.

L'API Hub'Eau publie les résultats avec un **délai naturel de 4 à 8 semaines** (temps de traitement en laboratoire + validation administrative). En février 2026, les prélèvements les plus récents disponibles datent donc de fin décembre 2025 — ce comportement est attendu et conforme.

### Ce qui est trompeur pour l'utilisateur

Actuellement, la carte d'alerte affiche sous le label `"Date"` la valeur brute de `date_prelevement` (ex: `31/12/2025`). L'utilisateur comprend naturellement que c'est une date de publication ou d'actualité de l'alerte, et pense que les données sont figées depuis le 31 décembre.

### Modifications prévues

**1. Renommer le label "Date" → "Date de prélèvement"** dans les cartes d'alerte (`src/pages/Alertes.tsx`)

Actuellement :
```
<p className="text-muted-foreground">Date</p>
```
Remplacer par :
```
<p className="text-muted-foreground">Prélevé le</p>
```

**2. Ajouter une note explicative** dans la section des filtres ou en haut de la liste, expliquant que les données Hub'Eau sont publiées avec un délai réglementaire de 4 à 8 semaines.

Une petite bannière informative de type `Alert` avec un icône `Info` :
> "Les résultats d'analyses sont publiés par les laboratoires agréés avec un délai réglementaire de 4 à 8 semaines. Les données affichées sont à jour au regard de ce que l'API Hub'Eau met à disposition."

**3. Ajouter la date de publication Hub'Eau** si disponible dans la réponse, ou afficher "Publié le" avec la date à laquelle l'alerte a été récupérée par notre système (c'est-à-dire `lastUpdate`).

**4. Mettre à jour le `DataFreshnessIndicator`** pour préciser que la fraîcheur mesurée est celle de la dernière interrogation de l'API, et non la date des prélèvements.

### Fichiers modifiés

- `src/pages/Alertes.tsx` :
  - Label "Date" → "Prélevé le" dans les cartes
  - Ajout d'une bannière informative sur le délai de publication Hub'Eau
  - Ajout d'une note dans `DataFreshnessIndicator` expliquant le décalage

### Aucune modification backend nécessaire

L'Edge Function, le hook `useWaterAlerts`, et le service `waterAlertsApi.ts` fonctionnent correctement. Seul l'affichage côté page doit être amélioré pour ne pas induire l'utilisateur en erreur.
