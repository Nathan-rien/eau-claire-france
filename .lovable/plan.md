

## Plan : Enrichir les données de la page /carte-polluants

### Constat actuel
Le composant `PollutantMap.tsx` contient des données très limitées :
- **10 villes** avec seulement 3 champs : nom, liste de polluants (texte), niveau de risque
- **6 régions** avec : nom, polluants principaux, niveau de risque, nombre de communes
- Les popups de la carte n'affichent qu'une liste à puces basique
- Aucune donnée chiffrée (valeurs mesurées, seuils, taux de conformité)

### Enrichissements proposés

#### 1. Données des villes (marqueurs carte) — plus de villes et plus de détails
Passer de 10 à **20+ villes** couvrant toutes les régions, et ajouter pour chaque ville :
- `population` (nombre d'habitants desservis)
- `conformityRate` (taux de conformité en %)
- `lastAnalysis` (date du dernier contrôle, ex: "Mars 2024")
- `waterSource` (type de captage : nappe souterraine / eau de surface)

Les popups Mapbox afficheront ces informations supplémentaires.

#### 2. Données régionales — compléter les 13 régions métropolitaines
Passer de 6 à **13 régions** et ajouter pour chaque région :
- `conformityRate` (taux de conformité %)
- `population` (population desservie)
- `supplyZones` (nombre de zones d'approvisionnement)
- `topPollutantValues` : objet avec les valeurs moyennes des polluants principaux (ex: `{ Nitrates: "22 mg/L", Pesticides: "0.08 µg/L" }`)

#### 3. Popups carte enrichis
Refondre le HTML des popups pour afficher :
- Taux de conformité avec indicateur couleur
- Population desservie
- Type de captage
- Date du dernier contrôle
- Valeurs mesurées par polluant (pas juste le nom)

### Fichier modifié
- `src/components/PollutantMap.tsx` — seul fichier concerné

### Ce qui ne change pas
- Aucune fonctionnalité modifiée (carte, filtres, navigation, légende)
- Même structure de composant, mêmes interactions
- Mêmes couleurs et styles visuels

