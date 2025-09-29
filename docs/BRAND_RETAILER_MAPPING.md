# Documentation du mapping Marques-Enseignes

## Vue d'ensemble

Le système de mapping marques-enseignes permet d'associer explicitement les marques d'eau aux enseignes où elles sont disponibles, avec des informations sur le positionnement prix.

## Structure de la table

### Table `brand_retailer_mapping`

```sql
CREATE TABLE public.brand_retailer_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,                    -- Nom de la marque (ex: 'evian', 'cristaline')
  retailer_id UUID NOT NULL,                   -- UUID de l'enseigne (référence vers retailers.id)
  is_available BOOLEAN NOT NULL DEFAULT true,  -- La marque est-elle disponible chez cette enseigne
  price_position TEXT,                          -- Position prix: 'low', 'medium', 'high'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(brand_name, retailer_id)              -- Évite les doublons
);
```

## Format de données pour ajouter des mappings

### 1. Via SQL direct

```sql
-- Exemple pour ajouter Evian chez Carrefour
INSERT INTO public.brand_retailer_mapping (brand_name, retailer_id, is_available, price_position) 
VALUES 
  ('evian', '53379a4f-6f9e-4047-827c-e63ed985e643', true, 'high');
```

### 2. Via fichier CSV pour import en masse

Format de fichier CSV : `brand_retailer_mapping.csv`

```csv
brand_name,retailer_slug,is_available,price_position
evian,carrefour,true,high
cristaline,carrefour,true,low
vittel,carrefour,true,medium
perrier,carrefour,true,high
evian,leclerc,true,high
cristaline,leclerc,true,low
vittel,leclerc,true,medium
hepar,leclerc,true,medium
```

## UUIDs des enseignes principales

```
Carrefour:     53379a4f-6f9e-4047-827c-e63ed985e643
E.Leclerc:     515d6c6a-ee5f-4837-8bf9-ebc0631bf874  
Intermarché:   42ccdcf2-7b85-4aaa-a32b-709f7dea6e2e
Auchan:        e8b1cca5-1340-4496-bcc8-926879ff9f9c
Casino:        b3db5d57-714b-45b8-afb4-a647ea41346a
Chronodrive:   2434b422-e219-4171-b5cc-124c848352ab
Cora:          2054391c-2a43-41ba-81ed-a34db5feb7b1
Franprix:      4caf0a4e-91fc-4c0a-84ac-4291e4e06f95
Houra:         bbc32b21-45ae-4270-874c-01cc7bfbfb8d
```

## Positions de prix

- **`low`** : Marques économiques (Cristaline, marques distributeur)
- **`medium`** : Marques standards (Vittel, Volvic, Hépar, Contrex)  
- **`high`** : Marques premium (Evian, Perrier, San Pellegrino)

## Utilisation dans l'application

La page `/prix-eaux` utilise automatiquement ce mapping pour :
- Résoudre le nom de l'enseigne même avec des UUIDs incorrects
- Afficher la position prix de chaque marque chez chaque enseigne
- Filtrer par disponibilité réelle des marques

## Amélioration du scraping

### Problème actuel

Le système de scraping utilise des UUIDs génériques au lieu des vrais UUIDs des enseignes.

### Solution recommandée

Modifier le système de scraping pour récupérer les vrais UUIDs dans `src/scripts/run-scrape.ts`.