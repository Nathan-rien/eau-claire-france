# Audit complet des 12 profils du classement

## Constat (calculs réels sur la base actuelle)

| Profil | #1 actuel | Mont Roucous | Problème détecté |
|---|---|---|---|
| **Général** | Sainte-Sophie 75.2 | **45.5 (14e+)** | Récompense la minéralisation moyenne → pénalise les eaux pures |
| **Pureté** | Mont Roucous 76.2 | ✅ #1 | OK |
| **Quotidien** | Grand Barbier 76.3 | absent du top | Aucune exclusion → eaux excessives passent |
| **Bébé** | **Cristaline 77.0** | absent | ⚠️ Cristaline multi-sources en tête (incohérent — non labellisée bébé) |
| **Sport** | Quézac 73.3 | — | Aucune exclusion, doublons Quézac/Badoit |
| **Hyposodé** | Grand Barbier 76.0 | — | OK |
| **Thé** | Cristaline 75.8 | absent du top | ⚠️ Cristaline > Mont Roucous/Volvic (référence métier) |
| **Grossesse** | Sainte-Sophie 68.5 | — | OK |
| **Transit** | Amanda 66.4 | — | Aucune exclusion |
| **Ostéoporose** | Contrex 63.4 | — | Doublon Contrex ×2, Hépar ×2 |
| **Senior** | Vittel 66.7 | — | Aucune exclusion |
| **Digestion** | Quézac 68.9 | — | Doublon Quézac ×2 |

## Plan de correction

### 1. Repenser le profil **Général**
Deux philosophies possibles, à trancher avec l'utilisateur :
- **Option A — "Pureté & équilibre"** : valoriser les eaux faiblement à modérément minéralisées (residu 20–500), proche d'une eau de référence neutre. Mont Roucous, Volvic, Montcalm remontent dans le top.
- **Option B — "Équilibre minéral"** : conserver la logique actuelle (fenêtre 150–800) mais élargir vers le bas (min:0, optLow:50) pour ne pas casser les eaux peu minéralisées.
- **Option C — Hybride** : fenêtre large 30–800 avec plateau à 9/10 dès 30 mg/L (au lieu de pénaliser).

→ À choisir par question dédiée.

### 2. Ajouter des **exclusions manquantes** sur les profils sans garde-fous
- **Quotidien** : residu > 1500, sodium > 200, nitrates > 25, fluorure > 1.5
- **Sport** : nitrates > 25, fluorure > 1.5
- **Thé** : residu > 400 (sinon Cristaline ne devrait pas être #1)
- **Transit / Ostéo / Senior / Digestion** : nitrates > 25, fluorure > 1.5

### 3. Recalibrer **Thé & Bébé** (incohérences métier)
- **Thé** : durcir le poids du résidu et abaisser optHigh à 100 (référence : Volvic, Mont Roucous, Montcalm). Cristaline (residu ~300) ne doit pas être en tête.
- **Bébé** : exiger residu < 300 strict (exclusion), nitrates < 10 strict. Privilégier les eaux explicitement étiquetées "convient aux nourrissons" (bonus si label connu : Mont Roucous, Évian, Volvic, Mont Blanc).

### 4. Traiter les **doublons** dans l'affichage du classement
Wattwiller, Quézac, Contrex, Hépar apparaissent 2× (variantes plate/gazeuse ou multi-sources). Dans `Classement.tsx`, dédupliquer par `brand` en gardant la meilleure variante par profil — ou afficher la variante explicitement.

### 5. Validation
Pour chaque profil, vérifier que le top 5 correspond aux références métier reconnues :
- Général (selon option choisie) : Évian/Volvic/Mont Roucous OU Évian/Thonon/Sainte-Sophie
- Bébé : Mont Roucous, Montcalm, Évian, Volvic, Mont Blanc
- Thé : Volvic, Mont Roucous, Montcalm
- Sport : Saint-Yorre, Quézac, Rozana, Badoit
- Grossesse : Contrex, Hépar, Courmayeur (apport Ca/Mg)
- Ostéo/Transit : Hépar, Contrex, Courmayeur

## Question préalable
Avant d'implémenter, je dois savoir quelle philosophie tu veux pour le profil **Général** (cf. options A/B/C ci-dessus) — c'est le choix structurant.
