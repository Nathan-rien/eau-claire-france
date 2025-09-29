# Mapping Marques-Enseignes

Ce document explique comment gérer l'association des marques d'eau avec les enseignes qui les vendent.

## Système actuel

L'application utilise une table `brand_retailer_mapping` pour associer explicitement les marques aux enseignes, avec des informations sur la disponibilité et le positionnement prix.

## Table de mapping

La table `brand_retailer_mapping` contient les colonnes suivantes :

- `id` : UUID unique
- `brand_name` : Nom de la marque (ex: "cristaline", "evian")
- `retailer_id` : UUID de l'enseigne (référence vers la table `retailers`)
- `is_available` : Booléen indiquant si la marque est disponible chez cette enseigne
- `price_position` : Positionnement prix ("low", "medium", "high")
- `created_at` et `updated_at` : Timestamps de création et modification

## Format CSV pour import

Pour ajouter des données de mapping, vous pouvez utiliser le format CSV suivant :

```csv
brand_name,retailer_slug,retailer_name,is_available,price_position,notes
cristaline,carrefour,Carrefour,true,low,Marque économique très répandue
vittel,carrefour,Carrefour,true,medium,Marque standard chez Carrefour
evian,carrefour,Carrefour,true,high,Marque premium avec prix élevé
perrier,leclerc,E.Leclerc,true,high,Eau gazeuse premium
hepar,intermarche,Intermarché,true,medium,Eau riche en magnésium
```

### Colonnes détaillées

- **brand_name** : Nom de la marque en minuscules, sans accents
- **retailer_slug** : Slug technique de l'enseigne (carrefour, leclerc, intermarche, etc.)
- **retailer_name** : Nom complet de l'enseigne pour affichage
- **is_available** : `true` ou `false` selon la disponibilité
- **price_position** : 
  - `low` : Marque économique (ex: Cristaline)
  - `medium` : Marque standard (ex: Vittel, Hépar)
  - `high` : Marque premium (ex: Evian, Perrier)
- **notes** : Commentaires optionnels

## Enseignes supportées

Voici les enseignes actuellement configurées avec leurs UUIDs :

| Enseigne | Slug | UUID |
|----------|------|------|
| Carrefour | carrefour | 53379a4f-6f9e-4047-827c-e63ed985e643 |
| E.Leclerc | leclerc | 515d6c6a-ee5f-4837-8bf9-ebc0631bf874 |
| Intermarché | intermarche | 42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e |
| Auchan | auchan | e8b1cca5-1340-4496-bcc8-926879ff9f9c |
| Casino | casino | b3db5d57-714b-45b8-afb4-a647ea41346a |
| Franprix | franprix | 4caf0a4e-91fc-4c0a-84ac-4291e4e06f95 |

## Marques principales

Les marques d'eau les plus courantes :

- **Économiques** : Cristaline, marques de distributeur
- **Standards** : Vittel, Volvic, Hépar, Contrex
- **Premium** : Evian, Perrier, Badoit

## API pour la gestion

### Ajouter un mapping

```sql
INSERT INTO brand_retailer_mapping (brand_name, retailer_id, is_available, price_position)
VALUES ('vittel', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'medium');
```

### Consulter les mappings

```sql
SELECT brm.brand_name, r.name as retailer_name, brm.price_position, brm.is_available
FROM brand_retailer_mapping brm
JOIN retailers r ON brm.retailer_id = r.id
WHERE brm.brand_name = 'evian'
ORDER BY r.name;
```

## Amélioration du scraping

Le système de scraping a été amélioré pour :

1. **Utiliser les vrais UUIDs** : La fonction `getRetailerUUID()` dans `src/lib/normalize.ts` mappe automatiquement les noms d'enseignes vers leurs UUIDs corrects.

2. **Résolution intelligente** : La page PrixEaux résout les enseignes via :
   - UUID exact
   - Slug de l'enseigne dans le SKU
   - Domaine dans l'URL du produit

3. **Affichage enrichi** : Le positionnement prix est affiché avec des badges colorés :
   - 🟢 Économique (low)
   - 🟡 Standard (medium) 
   - 🔴 Premium (high)

## Edge Function de correction

Une fonction `admin-fix-retailer-mapping` est disponible pour corriger les données existantes qui utilisent des UUIDs génériques au lieu des vrais UUIDs des enseignes.

## Utilisation

1. **Pour ajouter des données** : Créez un fichier CSV au format spécifié et importez-le via SQL
2. **Pour le scraping** : Les nouveaux scrapers utilisent automatiquement les bons UUIDs
3. **Pour corriger l'existant** : Utilisez la fonction `admin-fix-retailer-mapping`

Cette architecture permet une gestion flexible et extensible des associations marques-enseignes tout en maintenant l'intégrité des données.