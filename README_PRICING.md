# Prix des Eaux en Bouteille - InfoEau.fr

## 🎯 Fonctionnalités

- **Tableau interactif** : Filtres par marque, enseigne, format, pack + tri par €/L
- **Fiches marques** : Composition + prix par enseigne
- **Comparateur** : 2 marques ou 2 enseignes côte à côte
- **Scraping automatisé** : Collecte quotidienne via Playwright
- **Admin complet** : Monitoring, export CSV, API publique

## 🏪 Enseignes supportées

- Carrefour / Carrefour Market
- Auchan
- E.Leclerc
- Intermarché
- Système U
- Monoprix
- Casino
- Franprix
- Cora
- Supermarchés Match
- Chronodrive
- Houra

## 🏷️ Marques ciblées

Cristaline, Evian, Volvic, Hépar, Contrex, Vittel, Badoit, Perrier, Saint-Amand, Mont Roucous, Quézac

## 🚀 Démarrage

### Installation

```bash
npm install
# ou
pnpm install
```

### Variables d'environnement

```bash
# .env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TZ=Europe/Paris
```

### Base de données

Les migrations sont automatiquement appliquées. Tables créées :
- `retailers` : Enseignes
- `runs` : Historique des scraping
- `raw_products` : Données brutes scrapées
- `prices` : Prix normalisés

### Développement

```bash
npm run dev
```

Pages disponibles :
- `/prix-eaux` : Tableau principal
- `/marque/:slug` : Fiche marque
- `/comparateur-prix` : Comparateur
- `/admin` : Administration

## 🤖 Scraping

### CLI

```bash
# Smoke test (recommandé pour débuter)
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1,5 l" --maxPages 1

# Scraping complet
pnpm scrape --retailers carrefour,auchan,leclerc,intermarche,coursesu,monoprix,casino,franprix,cora,match,chronodrive,houra --brands evian,cristaline,volvic,hepar,contrex,vittel,badoit --formats "50 cl,1 l,1,5 l" --maxPages 3
```

### Cron automatique

Voir `docs/CRON_SETUP.md` pour la configuration.

## 📊 API

### Endpoints publics

```bash
GET /api/retailers
GET /api/brands  
GET /api/prices?brand=evian&retailer=carrefour&format=1L&page=1&limit=20
GET /api/brand/evian
```

### Admin (authentifié)

```bash
GET /api/runs
POST /api/scrape?retailer=carrefour
POST /api/retailers/carrefour/pause
POST /api/retailers/carrefour/resume
```

## 🔧 Tests

```bash
# Tests unitaires
npm test

# Tests de normalisation
npm test src/lib/__tests__/normalize.test.ts
```

## 📈 Monitoring

- Page `/admin/runs` : Historique et statuts
- Page `/admin/retailers` : Gestion des enseignes
- Export CSV automatique après chaque run réussi

## ⚖️ Conformité

- Respect des robots.txt et CGU
- Throttling 1000-1500ms entre requêtes
- Pas de contournement anti-bot
- Possibilité de pause sur demande